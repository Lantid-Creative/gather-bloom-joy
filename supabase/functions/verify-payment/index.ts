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
