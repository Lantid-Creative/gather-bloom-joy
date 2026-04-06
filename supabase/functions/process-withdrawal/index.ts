import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PAYSTACK_BASE = "https://api.paystack.co";

// Map currency codes to Paystack recipient types and minor-unit multipliers
const CURRENCY_CONFIG: Record<string, { type: string; multiplier: number }> = {
  NGN: { type: "nuban", multiplier: 100 },       // kobo
  GHS: { type: "ghipss", multiplier: 100 },      // pesewas
  ZAR: { type: "basa", multiplier: 100 },         // cents
  USD: { type: "nuban", multiplier: 100 },        // cents (Paystack USD payouts limited)
  KES: { type: "mobile_money", multiplier: 100 }, // cents
};

async function paystackRequest(path: string, method: string, body?: any) {
  const key = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured");

  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(data.message || `Paystack error: ${res.status}`);
  }
  return data;
}

async function createTransferRecipient(bankCode: string, accountNumber: string, accountName: string, currency: string) {
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.NGN;
  const data = await paystackRequest("/transferrecipient", "POST", {
    type: config.type,
    name: accountName,
    account_number: accountNumber,
    bank_code: bankCode,
    currency,
  });
  return data.data.recipient_code;
}

async function initiateTransfer(recipientCode: string, amountMinor: number, reason: string, reference: string) {
  const data = await paystackRequest("/transfer", "POST", {
    source: "balance",
    amount: amountMinor,
    recipient: recipientCode,
    reason,
    reference,
  });
  return data.data;
}

// Currency symbol lookup (server-side)
const SYMBOLS: Record<string, string> = {
  NGN: "₦", GHS: "GH₵", ZAR: "R", USD: "$", KES: "KSh",
  EGP: "E£", TZS: "TSh", UGX: "USh", ETB: "Br", GBP: "£", EUR: "€",
  XOF: "CFA", XAF: "FCFA", MAD: "MAD", RWF: "FRw",
};
function sym(code: string) { return SYMBOLS[code] || code; }

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
      if (!wallet.bank_name || !wallet.account_number || !wallet.bank_code) {
        throw new Error("Please add your bank details before requesting a withdrawal");
      }

      const walletCurrency = wallet.currency || "NGN";

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
          currency: walletCurrency,
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
        message: `Your withdrawal of ${sym(walletCurrency)}${amount.toLocaleString()} is being reviewed.`,
        type: "wallet",
        link: "/dashboard/wallet",
      });

      return new Response(JSON.stringify({ success: true, withdrawal }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // === ADMIN: Approve withdrawal (auto-payout via Paystack) ===
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

      const wdCurrency = withdrawal.currency || "NGN";
      const config = CURRENCY_CONFIG[wdCurrency] || CURRENCY_CONFIG.NGN;

      // Create Paystack transfer recipient and initiate transfer
      const recipientCode = await createTransferRecipient(
        withdrawal.bank_code,
        withdrawal.account_number,
        withdrawal.account_name,
        wdCurrency
      );

      const amountMinor = Math.round(withdrawal.amount * config.multiplier);
      const reference = `wd-${withdrawalId.slice(0, 8)}-${Date.now()}`;

      const transfer = await initiateTransfer(
        recipientCode,
        amountMinor,
        `Qantid payout #${withdrawalId.slice(0, 8)}`,
        reference
      );

      // Mark as processed
      await supabaseAdmin
        .from("withdrawal_requests")
        .update({
          status: "processed",
          admin_note: adminNote || `Paystack ref: ${transfer.transfer_code || reference}`,
          processed_at: new Date().toISOString(),
          processed_by: authData.user.id,
        })
        .eq("id", withdrawalId);

      // Update wallet totals
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
        title: "Withdrawal sent! 🎉",
        message: `${sym(wdCurrency)}${withdrawal.amount.toLocaleString()} has been sent to your bank account (${withdrawal.bank_name}).`,
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
            amount: `${sym(wdCurrency)}${withdrawal.amount.toLocaleString()}`,
            bankName: withdrawal.bank_name,
            accountName: withdrawal.account_name,
          }
        );
      }

      return new Response(JSON.stringify({ success: true, transferCode: transfer.transfer_code }), {
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

      const wdCurrency = withdrawal.currency || "NGN";

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
        message: `Your withdrawal of ${sym(wdCurrency)}${withdrawal.amount.toLocaleString()} was rejected. ${adminNote || "Contact support for details."}`,
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
            amount: `${sym(wdCurrency)}${withdrawal.amount.toLocaleString()}`,
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
