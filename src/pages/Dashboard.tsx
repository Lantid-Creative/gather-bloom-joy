import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, DollarSign, Ticket, Users, TrendingUp, ChevronDown, ChevronUp, Download, QrCode, Mail } from "lucide-react";
import EventbriteHeader from "@/components/EventbriteHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import PromoCodeManager from "@/components/PromoCodeManager";
import TrackingLinkManager from "@/components/TrackingLinkManager";

interface OrderItem { id: string; order_id: string; event_id: string; event_title: string; ticket_name: string; ticket_price: number; quantity: number; created_at: string; }
interface Order { id: string; customer_name: string; customer_email: string; total: number; created_at: string; }

const StatCard = ({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) => (
  <div className="rounded-xl border bg-card p-5 space-y-1">
    <div className="flex items-center gap-2 text-muted-foreground text-sm"><Icon className="h-4 w-4" />{label}</div>
    <p className="text-2xl font-bold">{value}</p>
    {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const { data: events } = useQuery({
    queryKey: ["dashboard-events", user?.id], enabled: !!user,
    queryFn: async () => { const { data, error } = await supabase.from("events").select("*").eq("user_id", user!.id).order("date", { ascending: false }); if (error) throw error; return data; },
  });

  const { data: orderItems } = useQuery({
    queryKey: ["dashboard-order-items", user?.id], enabled: !!user && !!events && events.length > 0,
    queryFn: async () => { const { data, error } = await supabase.from("order_items").select("*").in("event_id", events!.map((e) => e.id)); if (error) throw error; return data as OrderItem[]; },
  });

  const { data: orders } = useQuery({
    queryKey: ["dashboard-orders", user?.id, orderItems], enabled: !!orderItems && orderItems.length > 0,
    queryFn: async () => { const orderIds = [...new Set(orderItems!.map((i) => i.order_id))]; const { data, error } = await supabase.from("orders").select("*").in("id", orderIds); if (error) throw error; return data as Order[]; },
  });

  if (!user) return <div className="min-h-screen bg-background"><EventbriteHeader /><div className="container max-w-lg py-20 text-center space-y-4"><h1 className="text-2xl font-bold">Sign in to view your dashboard</h1><Button variant="hero" className="rounded-full" onClick={() => navigate("/auth")}>Sign in</Button></div></div>;

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

  const chartData = eventStats.filter((s) => s.revenue > 0 || s.tickets > 0).slice(0, 8).map((s) => ({
    name: s.event.title.length > 20 ? s.event.title.slice(0, 18) + "…" : s.event.title, revenue: s.revenue, tickets: s.tickets,
  }));

  const exportCSV = () => {
    if (!orders || !orderItems) return;
    const rows = [["Order ID", "Name", "Email", "Event", "Ticket", "Qty", "Price", "Date"]];
    orderItems.forEach((item) => {
      const order = orders.find((o) => o.id === item.order_id);
      rows.push([item.order_id.slice(0, 8), order?.customer_name ?? "", order?.customer_email ?? "", item.event_title, item.ticket_name, String(item.quantity), String(item.ticket_price), format(new Date(item.created_at), "yyyy-MM-dd")]);
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "afritickets-sales.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <EventbriteHeader />
      <div className="container max-w-5xl py-10">
        <Button variant="ghost" size="sm" className="-ml-2 mb-6" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
          <Button variant="outline" size="sm" className="rounded-full" onClick={exportCSV}><Download className="h-3.5 w-3.5 mr-1" /> Export CSV</Button>
        </div>
        <p className="text-muted-foreground mb-8">Track sales, revenue, and attendees across all your events.</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={DollarSign} label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} />
          <StatCard icon={Ticket} label="Tickets Sold" value={totalTickets.toString()} />
          <StatCard icon={TrendingUp} label="Total Orders" value={totalOrders.toString()} />
          <StatCard icon={Users} label="Unique Attendees" value={uniqueAttendees.toString()} />
        </div>

        {chartData.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4">Revenue by Event</h2>
            <div className="rounded-xl border bg-card p-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 11 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: "0.875rem" }} formatter={(value: number, name: string) => [name === "revenue" ? `$${value}` : value, name === "revenue" ? "Revenue" : "Tickets"]} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <h2 className="text-xl font-bold mb-4">Event Breakdown</h2>
        {eventStats.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground"><p>No events yet.</p><Button variant="hero" size="sm" className="rounded-full mt-4" asChild><Link to="/create-event">Create Your First Event</Link></Button></div>
        ) : (
          <div className="space-y-3">
            {eventStats.map(({ event, revenue, tickets, orders: eventOrders }) => (
              <div key={event.id} className="border rounded-xl overflow-hidden">
                <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors text-left" onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{event.title}</p>
                      <Link to={`/check-in/${event.id}`} onClick={(e) => e.stopPropagation()} className="text-xs text-primary hover:underline flex items-center gap-1"><QrCode className="h-3 w-3" /> Check-in</Link>
                    </div>
                    <p className="text-xs text-muted-foreground">{format(new Date(event.date), "MMM d, yyyy")} · {event.location}</p>
                  </div>
                  <div className="flex items-center gap-6 ml-4">
                    <div className="text-right"><p className="text-sm font-bold text-primary">${revenue}</p><p className="text-xs text-muted-foreground">{tickets} tickets</p></div>
                    {expandedEvent === event.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </button>
                {expandedEvent === event.id && (
                  <div className="border-t px-5 py-4">
                    {eventOrders.length === 0 ? <p className="text-sm text-muted-foreground">No orders yet.</p> : (
                      <>
                        <h3 className="text-sm font-semibold mb-3">Attendees ({eventOrders.length})</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-2 pr-4 font-medium">Name</th><th className="pb-2 pr-4 font-medium">Email</th><th className="pb-2 pr-4 font-medium">Date</th><th className="pb-2 font-medium text-right">Amount</th></tr></thead>
                            <tbody>{eventOrders.map((order) => (<tr key={order.id} className="border-b last:border-0"><td className="py-2 pr-4">{order.customer_name}</td><td className="py-2 pr-4 text-muted-foreground">{order.customer_email}</td><td className="py-2 pr-4 text-muted-foreground">{format(new Date(order.created_at), "MMM d")}</td><td className="py-2 text-right font-medium">${order.total}</td></tr>))}</tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Promo Codes */}
        <div className="mt-10">
          <PromoCodeManager events={events?.map((e) => ({ id: e.id, title: e.title })) ?? []} />
        </div>

        {/* Tracking Links */}
        <div className="mt-10">
          <TrackingLinkManager events={events?.map((e) => ({ id: e.id, title: e.title })) ?? []} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
