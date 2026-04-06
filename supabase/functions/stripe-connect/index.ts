import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: authData } = await supabaseClient.auth.getUser(token);
    if (!authData.user) throw new Error("Not authenticated");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const body = await req.json();
    const { action } = body;
    const origin = req.headers.get("origin") || "https://gather-bloom-joy.lovable.app";

    // Get or create wallet
    let { data: wallet } = await supabaseAdmin
      .from("organizer_wallets")
      .select("*")
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (!wallet) {
      const { data: newWallet } = await supabaseAdmin
        .from("organizer_wallets")
        .insert({ user_id: authData.user.id })
        .select()
        .single();
      wallet = newWallet;
    }

    if (!wallet) throw new Error("Could not create wallet");

    // === Create or retrieve Stripe Connect account ===
    if (action === "onboard") {
      let accountId = wallet.stripe_account_id;

      if (!accountId) {
        // Create a new Express connected account
        const account = await stripe.accounts.create({
          type: "express",
          email: authData.user.email,
          capabilities: {
            transfers: { requested: true },
          },
          metadata: {
            user_id: authData.user.id,
            wallet_id: wallet.id,
          },
        });
        accountId = account.id;

        await supabaseAdmin
          .from("organizer_wallets")
          .update({ stripe_account_id: accountId })
          .eq("id", wallet.id);
      }

      // Create onboarding link
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${origin}/dashboard/wallet`,
        return_url: `${origin}/dashboard/wallet?onboarding=complete`,
        type: "account_onboarding",
      });

      return new Response(JSON.stringify({ url: accountLink.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // === Check onboarding status ===
    if (action === "check-status") {
      if (!wallet.stripe_account_id) {
        return new Response(JSON.stringify({ connected: false, onboarding_complete: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      const account = await stripe.accounts.retrieve(wallet.stripe_account_id);
      const isComplete = account.charges_enabled && account.payouts_enabled;

      // Update DB if status changed
      if (isComplete && !wallet.stripe_onboarding_complete) {
        await supabaseAdmin
          .from("organizer_wallets")
          .update({ stripe_onboarding_complete: true })
          .eq("id", wallet.id);
      }

      return new Response(JSON.stringify({
        connected: true,
        onboarding_complete: isComplete,
        account_id: wallet.stripe_account_id,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // === Stripe Express Dashboard login link ===
    if (action === "dashboard") {
      if (!wallet.stripe_account_id) throw new Error("No Stripe account connected");

      const loginLink = await stripe.accounts.createLoginLink(wallet.stripe_account_id);
      return new Response(JSON.stringify({ url: loginLink.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    throw new Error("Invalid action");
  } catch (error) {
    console.error("Stripe Connect error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
