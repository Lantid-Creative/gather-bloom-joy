import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLATFORM_FEE_PERCENT = 10; // 10% inclusive fee

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

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("No session ID");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ success: false, error: "Payment not completed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Check if order already exists for this session (idempotency)
    const { data: existingOrders } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("stripe_session_id", sessionId)
      .limit(1);

    if (existingOrders && existingOrders.length > 0) {
      return new Response(
        JSON.stringify({ success: true, orderId: existingOrders[0].id, alreadyProcessed: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const metadata = session.metadata!;
    const items = JSON.parse(metadata.items_json);
    const totalCents = session.amount_total ?? 0;

    // Create order using service role (bypasses RLS)
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: metadata.user_id,
        customer_name: metadata.customer_name,
        customer_email: metadata.customer_email,
        total: totalCents / 100,
        status: "confirmed",
        stripe_session_id: sessionId,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(
        items.map((item: any) => ({
          order_id: order.id,
          event_id: item.eventId,
          ticket_type_id: item.ticketTypeId,
          event_title: item.eventTitle,
          ticket_name: item.ticketName,
          ticket_price: item.price,
          quantity: item.quantity,
        }))
      );

    if (itemsError) throw itemsError;

    // === CREDIT ORGANIZER WALLETS ===
    // Group items by event to credit each organizer
    const eventIds = [...new Set(items.map((i: any) => i.eventId))];
    
    for (const eventId of eventIds) {
      // Get event owner and currency
      const { data: event } = await supabaseAdmin
        .from("events")
        .select("user_id, currency")
        .eq("id", eventId)
        .single();

      if (!event) continue;

      const organizerId = event.user_id;
      const eventCurrency = event.currency || "NGN";

      // Calculate revenue for this event from this order
      const eventItems = items.filter((i: any) => i.eventId === eventId);
      const eventRevenue = eventItems.reduce(
        (sum: number, i: any) => sum + i.price * i.quantity,
        0
      );

      // Fee calculation:
      // Total ticket price = eventRevenue
      // Platform fee (10% inclusive) = eventRevenue * 0.10
      // Organizer gets 90%
      const platformFee = eventRevenue * (PLATFORM_FEE_PERCENT / 100);
      const organizerNet = eventRevenue - platformFee;

      // Ensure organizer wallet exists (use event currency)
      const { data: existingWallet } = await supabaseAdmin
        .from("organizer_wallets")
        .select("id")
        .eq("user_id", organizerId)
        .single();

      let walletId: string;

      if (existingWallet) {
        walletId = existingWallet.id;
      } else {
        const { data: newWallet, error: walletError } = await supabaseAdmin
          .from("organizer_wallets")
          .insert({ user_id: organizerId, currency: eventCurrency })
          .select("id")
          .single();
        if (walletError) {
          console.error("Failed to create wallet:", walletError);
          continue;
        }
        walletId = newWallet.id;
      }

      // 7 days from now
      const availableAt = new Date();
      availableAt.setDate(availableAt.getDate() + 7);

      // Create wallet transaction (pending for 7 days) with event currency
      await supabaseAdmin.from("wallet_transactions").insert({
        wallet_id: walletId,
        user_id: organizerId,
        type: "credit",
        amount: eventRevenue,
        fee_amount: platformFee,
        net_amount: organizerNet,
        description: `Sale: ${eventItems.map((i: any) => `${i.quantity}x ${i.ticketName}`).join(", ")}`,
        order_id: order.id,
        available_at: availableAt.toISOString(),
        status: "pending",
        currency: eventCurrency,
      });

      // Update wallet pending balance and total earned
      await supabaseAdmin
        .from("organizer_wallets")
        .update({
          pending_balance: (existingWallet as any)?.pending_balance
            ? undefined
            : undefined, // Let the DB function handle recalc
          total_earned: undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("id", walletId);

      // Recalculate balances via raw update
      await supabaseAdmin.rpc("release_pending_funds");
    }

    // Create notification
    await supabaseAdmin.from("notifications").insert({
      user_id: metadata.user_id,
      title: "Payment successful! 🎉",
      message: `Your order #${order.id.slice(0, 8).toUpperCase()} is confirmed. ${items.length} ticket(s) purchased.`,
      type: "order",
      link: "/my-tickets",
    });

    return new Response(
      JSON.stringify({ success: true, orderId: order.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Verify payment error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
