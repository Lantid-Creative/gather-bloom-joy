import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function sendWithdrawalEmail(
  supabase: any,
  templateName: string,
  recipientEmail: string,
  idempotencyKey: string,
  templateData: Record<string, any>
) {
  try {
    await supabase.functions.invoke("send-transactional-email", {
      body: { templateName, recipientEmail, idempotencyKey, templateData },
    });
  } catch (err) {
    console.error("Failed to send withdrawal email", { templateName, err });
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
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

      await supabaseAdmin.rpc("release_pending_funds");

      const { data: wallet, error: walletErr } = await supabaseAdmin
        .from("organizer_wallets")
        .select("*")
        .eq("user_id", authData.user.id)
        .single();

      if (walletErr || !wallet) throw new Error("Wallet not found");
      if (wallet.available_balance < amount) throw new Error("Insufficient available balance");
      if (!wallet.stripe_account_id || !wallet.stripe_onboarding_complete) {
        throw new Error("Please complete Stripe Connect onboarding before requesting withdrawals");
      }

      const { data: withdrawal, error: wErr } = await supabaseAdmin
        .from("withdrawal_requests")
        .insert({
          user_id: authData.user.id,
          wallet_id: wallet.id,
          amount,
          bank_name: wallet.bank_name || "Stripe Connect",
          account_number: wallet.stripe_account_id || "",
          account_name: wallet.account_name || "",
          bank_code: "",
        })
        .select()
        .single();

      if (wErr) throw wErr;

      await supabaseAdmin
        .from("organizer_wallets")
        .update({
          available_balance: wallet.available_balance - amount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", wallet.id);

      await supabaseAdmin.from("notifications").insert({
        user_id: authData.user.id,
        title: "Withdrawal requested 💸",
        message: `Your withdrawal of $${amount.toFixed(2)} is being reviewed.`,
        type: "wallet",
        link: "/dashboard/wallet",
      });

      return new Response(JSON.stringify({ success: true, withdrawal }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // === ADMIN: Approve withdrawal (auto-payout via Stripe) ===
    if (action === "approve") {
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

      // Get wallet to find Stripe Connect account
      const { data: wallet } = await supabaseAdmin
        .from("organizer_wallets")
        .select("*")
        .eq("id", withdrawal.wallet_id)
        .single();

      if (!wallet?.stripe_account_id) {
        throw new Error("Organizer has no Stripe Connect account. Cannot auto-payout.");
      }

      // Create Stripe Transfer to the connected account
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2025-08-27.basil",
      });

      const amountInCents = Math.round(withdrawal.amount * 100);

      const transfer = await stripe.transfers.create({
        amount: amountInCents,
        currency: "usd",
        destination: wallet.stripe_account_id,
        description: `Qantid withdrawal #${withdrawalId.slice(0, 8)}`,
        metadata: {
          withdrawal_id: withdrawalId,
          user_id: withdrawal.user_id,
        },
      });

      // Mark as processed (approved + paid in one step)
      await supabaseAdmin
        .from("withdrawal_requests")
        .update({
          status: "processed",
          admin_note: adminNote || "",
          processed_at: new Date().toISOString(),
          processed_by: authData.user.id,
        })
        .eq("id", withdrawalId);

      // Update wallet totals
      await supabaseAdmin
        .from("organizer_wallets")
        .update({
          total_withdrawn: wallet.total_withdrawn + withdrawal.amount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", wallet.id);

      // Notify organizer
      await supabaseAdmin.from("notifications").insert({
        user_id: withdrawal.user_id,
        title: "Withdrawal sent! 🎉",
        message: `$${withdrawal.amount.toFixed(2)} has been sent to your Stripe account and will arrive in your bank shortly.`,
        type: "wallet",
        link: "/dashboard/wallet",
      });

      // Send email
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(withdrawal.user_id);
      const organizerEmail = userData?.user?.email;
      if (organizerEmail) {
        await sendWithdrawalEmail(
          supabaseAdmin,
          "withdrawal-processed",
          organizerEmail,
          `withdrawal-processed-${withdrawalId}`,
          {
            amount: `$${withdrawal.amount.toFixed(2)}`,
            bankName: "Stripe Connect",
            accountName: wallet.account_name || "Your account",
            transferId: transfer.id,
          }
        );
      }

      return new Response(JSON.stringify({ success: true, transferId: transfer.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // === ADMIN: Reject withdrawal ===
    if (action === "reject") {
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

      await supabaseAdmin
        .from("withdrawal_requests")
        .update({
          status: "rejected",
          admin_note: adminNote || "",
          processed_at: new Date().toISOString(),
          processed_by: authData.user.id,
        })
        .eq("id", withdrawalId);

      // Refund to available balance
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

      await supabaseAdmin.from("notifications").insert({
        user_id: withdrawal.user_id,
        title: "Withdrawal rejected ❌",
        message: `Your withdrawal of $${withdrawal.amount.toFixed(2)} was rejected. ${adminNote || "Contact support for details."}`,
        type: "wallet",
        link: "/dashboard/wallet",
      });

      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(withdrawal.user_id);
      const organizerEmail = userData?.user?.email;
      if (organizerEmail) {
        await sendWithdrawalEmail(
          supabaseAdmin,
          "withdrawal-rejected",
          organizerEmail,
          `withdrawal-rejected-${withdrawalId}`,
          {
            amount: `$${withdrawal.amount.toFixed(2)}`,
            adminNote: adminNote || undefined,
          }
        );
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
