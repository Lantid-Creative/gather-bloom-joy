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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { items, promoDiscount, customerName, customerEmail } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("No items provided");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Build line items from cart
    const line_items = items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: `${item.eventTitle} — ${item.ticketName}`,
          metadata: {
            event_id: item.eventId,
            ticket_type_id: item.ticketTypeId,
          },
        },
        unit_amount: Math.round(item.price * 100), // cents
      },
      quantity: item.quantity,
    }));

    // Apply promo discount as a coupon if applicable
    const discounts: any[] = [];
    if (promoDiscount && promoDiscount.value > 0) {
      const coupon = await stripe.coupons.create(
        promoDiscount.type === "percentage"
          ? { percent_off: promoDiscount.value, duration: "once" }
          : { amount_off: Math.round(promoDiscount.value * 100), currency: "usd", duration: "once" }
      );
      discounts.push({ coupon: coupon.id });
    }

    // Build metadata for order creation after payment
    const metadata = {
      user_id: user.id,
      customer_name: customerName || user.user_metadata?.full_name || "",
      customer_email: customerEmail || user.email,
      items_json: JSON.stringify(
        items.map((item: any) => ({
          eventId: item.eventId,
          ticketTypeId: item.ticketTypeId,
          eventTitle: item.eventTitle,
          ticketName: item.ticketName,
          price: item.price,
          quantity: item.quantity,
        }))
      ),
    };

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items,
      discounts: discounts.length > 0 ? discounts : undefined,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/checkout?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/checkout`,
      metadata,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
