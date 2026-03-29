import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify caller is admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user: caller },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...params } = await req.json();

    let result: unknown;

    switch (action) {
      case "list_users": {
        const { page = 1, perPage = 50 } = params;
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage,
        });
        if (error) throw error;
        result = data;
        break;
      }

      case "ban_user": {
        const { user_id } = params;
        if (!user_id) throw new Error("user_id required");
        const { error } = await supabaseAdmin.auth.admin.updateUserById(
          user_id,
          { ban_duration: "876000h" },
        );
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "unban_user": {
        const { user_id } = params;
        if (!user_id) throw new Error("user_id required");
        const { error } = await supabaseAdmin.auth.admin.updateUserById(
          user_id,
          { ban_duration: "none" },
        );
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "delete_user": {
        const { user_id } = params;
        if (!user_id) throw new Error("user_id required");
        const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "list_all_events": {
        const { page = 1, perPage = 50, status } = params;
        let query = supabaseAdmin
          .from("events")
          .select("*", { count: "exact" });
        if (status && status !== "all") query = query.eq("status", status);
        const from = (page - 1) * perPage;
        const { data, error, count } = await query
          .order("created_at", { ascending: false })
          .range(from, from + perPage - 1);
        if (error) throw error;
        result = { events: data, total: count };
        break;
      }

      case "update_event_status": {
        const { event_id, status } = params;
        if (!event_id || !status) throw new Error("event_id and status required");
        const { error } = await supabaseAdmin
          .from("events")
          .update({ status })
          .eq("id", event_id);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "delete_event": {
        const { event_id } = params;
        if (!event_id) throw new Error("event_id required");
        const { error } = await supabaseAdmin
          .from("events")
          .delete()
          .eq("id", event_id);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "list_all_orders": {
        const { page = 1, perPage = 50 } = params;
        const from = (page - 1) * perPage;
        const { data, error, count } = await supabaseAdmin
          .from("orders")
          .select("*, order_items(*)", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(from, from + perPage - 1);
        if (error) throw error;
        result = { orders: data, total: count };
        break;
      }

      case "platform_stats": {
        const [usersRes, eventsRes, ordersRes, revenueRes] = await Promise.all([
          supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 }),
          supabaseAdmin.from("events").select("id", { count: "exact", head: true }),
          supabaseAdmin.from("orders").select("id", { count: "exact", head: true }),
          supabaseAdmin.from("orders").select("total").eq("status", "confirmed"),
        ]);
        const totalRevenue = (revenueRes.data ?? []).reduce(
          (sum: number, o: { total: number }) => sum + Number(o.total),
          0,
        );
        result = {
          totalUsers: usersRes.data?.total ?? 0,
          totalEvents: eventsRes.count ?? 0,
          totalOrders: ordersRes.count ?? 0,
          totalRevenue,
        };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
