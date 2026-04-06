import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Authenticate user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: authData } = await supabaseClient.auth.getUser(token);
    if (!authData.user) throw new Error("Not authenticated");

    const body = await req.json();
    const { action } = body;

    // === ORGANIZER: Request withdrawal ===
    if (action === "request") {
      const { amount } = body;
      if (!amount || amount <= 0) throw new Error("Invalid amount");

      // Release pending funds first
      await supabaseAdmin.rpc("release_pending_funds");

      // Get wallet
      const { data: wallet, error: walletErr } = await supabaseAdmin
        .from("organizer_wallets")
        .select("*")
        .eq("user_id", authData.user.id)
        .single();

      if (walletErr || !wallet) throw new Error("Wallet not found");
      if (wallet.available_balance < amount) throw new Error("Insufficient available balance");

      // Create withdrawal request with bank details from wallet
      const { data: withdrawal, error: wErr } = await supabaseAdmin
        .from("withdrawal_requests")
        .insert({
          user_id: authData.user.id,
          wallet_id: wallet.id,
          amount,
          bank_name: wallet.bank_name,
          account_number: wallet.account_number,
          account_name: wallet.account_name,
          bank_code: wallet.bank_code,
        })
        .select()
        .single();

      if (wErr) throw wErr;

      // Deduct from available balance
      await supabaseAdmin
        .from("organizer_wallets")
        .update({
          available_balance: wallet.available_balance - amount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", wallet.id);

      // Notify organizer
      await supabaseAdmin.from("notifications").insert({
        user_id: authData.user.id,
        title: "Withdrawal requested 💸",
        message: `Your withdrawal of $${amount.toFixed(2)} is being reviewed.`,
        type: "wallet",
        link: "/dashboard",
      });

      return new Response(JSON.stringify({ success: true, withdrawal }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // === ADMIN: Approve/Reject withdrawal ===
    if (action === "approve" || action === "reject") {
      // Check admin
      const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
        _user_id: authData.user.id,
        _role: "admin",
      });
      if (!isAdmin) throw new Error("Not authorized");

      const { withdrawalId, adminNote } = body;
      if (!withdrawalId) throw new Error("Missing withdrawal ID");

      const { data: withdrawal } = await supabaseAdmin
        .from("withdrawal_requests")
        .select("*")
        .eq("id", withdrawalId)
        .single();

      if (!withdrawal) throw new Error("Withdrawal not found");
      if (withdrawal.status !== "pending") throw new Error("Withdrawal already processed");

      if (action === "approve") {
        // Mark as approved (admin will manually disburse via Stripe dashboard / bank transfer)
        await supabaseAdmin
          .from("withdrawal_requests")
          .update({
            status: "approved",
            admin_note: adminNote || "",
            processed_at: new Date().toISOString(),
            processed_by: authData.user.id,
          })
          .eq("id", withdrawalId);

        // Update wallet total_withdrawn
        const { data: wallet } = await supabaseAdmin
          .from("organizer_wallets")
          .select("*")
          .eq("id", withdrawal.wallet_id)
          .single();

        if (wallet) {
          await supabaseAdmin
            .from("organizer_wallets")
            .update({
              total_withdrawn: wallet.total_withdrawn + withdrawal.amount,
              updated_at: new Date().toISOString(),
            })
            .eq("id", wallet.id);
        }

        // Notify organizer
        await supabaseAdmin.from("notifications").insert({
          user_id: withdrawal.user_id,
          title: "Withdrawal approved ✅",
          message: `Your withdrawal of $${withdrawal.amount.toFixed(2)} has been approved and will be processed shortly.`,
          type: "wallet",
          link: "/dashboard",
        });
      } else {
        // Reject: return funds to available balance
        await supabaseAdmin
          .from("withdrawal_requests")
          .update({
            status: "rejected",
            admin_note: adminNote || "",
            processed_at: new Date().toISOString(),
            processed_by: authData.user.id,
          })
          .eq("id", withdrawalId);

        // Return funds
        const { data: wallet } = await supabaseAdmin
          .from("organizer_wallets")
          .select("*")
          .eq("id", withdrawal.wallet_id)
          .single();

        if (wallet) {
          await supabaseAdmin
            .from("organizer_wallets")
            .update({
              available_balance: wallet.available_balance + withdrawal.amount,
              updated_at: new Date().toISOString(),
            })
            .eq("id", wallet.id);
        }

        // Notify organizer
        await supabaseAdmin.from("notifications").insert({
          user_id: withdrawal.user_id,
          title: "Withdrawal rejected ❌",
          message: `Your withdrawal of $${withdrawal.amount.toFixed(2)} was rejected. ${adminNote || "Contact support for details."}`,
          type: "wallet",
          link: "/dashboard",
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // === ADMIN: Mark as processed (money sent) ===
    if (action === "mark-processed") {
      const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
        _user_id: authData.user.id,
        _role: "admin",
      });
      if (!isAdmin) throw new Error("Not authorized");

      const { withdrawalId } = body;
      await supabaseAdmin
        .from("withdrawal_requests")
        .update({ status: "processed", processed_at: new Date().toISOString() })
        .eq("id", withdrawalId);

      // Notify organizer
      const { data: withdrawal } = await supabaseAdmin
        .from("withdrawal_requests")
        .select("*")
        .eq("id", withdrawalId)
        .single();

      if (withdrawal) {
        await supabaseAdmin.from("notifications").insert({
          user_id: withdrawal.user_id,
          title: "Withdrawal sent! 🎉",
          message: `$${withdrawal.amount.toFixed(2)} has been sent to your bank account.`,
          type: "wallet",
          link: "/dashboard",
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    throw new Error("Invalid action");
  } catch (error) {
    console.error("Process withdrawal error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
