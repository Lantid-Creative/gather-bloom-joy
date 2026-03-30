import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OrderItem { id: string; order_id: string; event_id: string; event_title: string; ticket_name: string; ticket_price: number; quantity: number; created_at: string; }
export interface Order { id: string; customer_name: string; customer_email: string; total: number; created_at: string; }

export function useDashboardData() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: events } = useQuery({
    queryKey: ["dashboard-events", user?.id], enabled: !!user,
    queryFn: async () => { const { data, error } = await supabase.from("events").select("*").eq("user_id", user!.id).order("date", { ascending: false }); if (error) throw error; return data; },
  });

  const { data: orderItems } = useQuery({
    queryKey: ["dashboard-order-items", user?.id], enabled: !!user && !!events && events.length > 0,
    queryFn: async () => { const { data, error } = await supabase.from("order_items").select("*").in("event_id", events!.map((e) => e.id)); if (error) throw error; return data as OrderItem[]; },
  });

  const { data: ticketTypes } = useQuery({
    queryKey: ["dashboard-ticket-types", user?.id], enabled: !!user && !!events && events.length > 0,
    queryFn: async () => { const { data, error } = await supabase.from("ticket_types").select("*").in("event_id", events!.map((e) => e.id)); if (error) throw error; return data; },
  });

  const { data: orders } = useQuery({
    queryKey: ["dashboard-orders", user?.id, orderItems], enabled: !!orderItems && orderItems.length > 0,
    queryFn: async () => { const orderIds = [...new Set(orderItems!.map((i) => i.order_id))]; const { data, error } = await supabase.from("orders").select("*").in("id", orderIds); if (error) throw error; return data as Order[]; },
  });

  const totalRevenue = orderItems?.reduce((sum, i) => sum + i.ticket_price * i.quantity, 0) ?? 0;
  const totalTickets = orderItems?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  const totalOrders = orders?.length ?? 0;
  const uniqueAttendees = new Set(orders?.map((o) => o.customer_email)).size;

  const eventStats = events?.map((event) => {
    const items = orderItems?.filter((i) => i.event_id === event.id) ?? [];
    const revenue = items.reduce((sum, i) => sum + i.ticket_price * i.quantity, 0);
    const tickets = items.reduce((sum, i) => sum + i.quantity, 0);
    const eventOrderIds = [...new Set(items.map((i) => i.order_id))];
    const eventOrders = orders?.filter((o) => eventOrderIds.includes(o.id)) ?? [];
    return { event, items, revenue, tickets, orders: eventOrders };
  }) ?? [];

  return { user, events, orderItems, ticketTypes, orders, totalRevenue, totalTickets, totalOrders, uniqueAttendees, eventStats, queryClient };
}
