import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    const { eventId, eventTitle } = await req.json();
    if (!eventId) throw new Error("eventId is required");

    // Verify the user owns this event
    const { data: event, error: evtErr } = await supabase
      .from("events")
      .select("id, user_id")
      .eq("id", eventId)
      .single();
    if (evtErr || !event || event.user_id !== userId) {
      return new Response(JSON.stringify({ error: "Not authorized for this event" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get attendee emails for this event
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("order_id")
      .eq("event_id", eventId);

    if (!orderItems || orderItems.length === 0) {
      return new Response(JSON.stringify({ error: "No attendees to sync" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderIds = [...new Set(orderItems.map((i: any) => i.order_id))];
    const { data: orders } = await supabase
      .from("orders")
      .select("customer_name, customer_email")
      .in("id", orderIds);

    if (!orders || orders.length === 0) {
      return new Response(JSON.stringify({ error: "No attendee data found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deduplicate by email
    const attendeeMap = new Map<string, string>();
    orders.forEach((o: any) => {
      if (o.customer_email && !attendeeMap.has(o.customer_email)) {
        attendeeMap.set(o.customer_email, o.customer_name);
      }
    });

    const MAILCHIMP_API_KEY = Deno.env.get("MAILCHIMP_API_KEY");
    if (!MAILCHIMP_API_KEY) throw new Error("Mailchimp API key not configured");

    const dc = MAILCHIMP_API_KEY.split("-").pop(); // e.g. "us5"
    const baseUrl = `https://${dc}.api.mailchimp.com/3.0`;
    const authB64 = btoa(`anystring:${MAILCHIMP_API_KEY}`);

    // Create an audience for this event (or find existing one)
    const listName = `Qantid: ${eventTitle || eventId}`.slice(0, 100);

    // Check existing lists
    const listsRes = await fetch(`${baseUrl}/lists?count=100`, {
      headers: { Authorization: `Basic ${authB64}` },
    });
    const listsData = await listsRes.json();
    let listId: string | null = null;

    if (listsData.lists) {
      const existing = listsData.lists.find((l: any) => l.name === listName);
      if (existing) listId = existing.id;
    }

    // Create list if not found
    if (!listId) {
      const createRes = await fetch(`${baseUrl}/lists`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${authB64}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: listName,
          permission_reminder: "You signed up for this event on Qantid.",
          email_type_option: false,
          contact: {
            company: "Qantid",
            address1: "",
            city: "",
            state: "",
            zip: "",
            country: "US",
          },
          campaign_defaults: {
            from_name: "Qantid",
            from_email: "noreply@qantid.com",
            subject: "",
            language: "en",
          },
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(`Failed to create Mailchimp list: ${createData.detail || createData.title}`);
      }
      listId = createData.id;
    }

    // Batch add members
    const members = Array.from(attendeeMap.entries()).map(([email, name]) => {
      const parts = name.split(" ");
      return {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: parts[0] || "",
          LNAME: parts.slice(1).join(" ") || "",
        },
      };
    });

    const batchRes = await fetch(`${baseUrl}/lists/${listId}`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authB64}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        members,
        update_existing: true,
      }),
    });
    const batchData = await batchRes.json();

    const added = batchData.new_members?.length ?? 0;
    const updated = batchData.updated_members?.length ?? 0;
    const errors = batchData.errors?.length ?? 0;

    return new Response(
      JSON.stringify({
        success: true,
        listId,
        listName,
        added,
        updated,
        errors,
        total: attendeeMap.size,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
