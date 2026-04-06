import { DollarSign, Ticket, Users, TrendingUp, Activity, CalendarDays, Percent, Wallet, ArrowRight } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, eachDayOfInterval, startOfDay, parseISO } from "date-fns";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";

const StatCard = ({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub?: string }) => (
  <div className="rounded-xl border bg-card p-5 space-y-1">
    <div className="flex items-center gap-2 text-muted-foreground text-sm"><Icon className="h-4 w-4" />{label}</div>
    <p className="text-2xl font-bold">{value}</p>
    {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
  </div>
);

const DashboardOverview = () => {
  const { events, orderItems, totalRevenue, totalTickets, totalOrders, uniqueAttendees, eventStats } = useDashboardData();
  const { user } = useAuth();

  const { data: wallet } = useQuery({
    queryKey: ["wallet-summary", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("organizer_wallets")
        .select("available_balance, pending_balance, total_earned, total_withdrawn")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const chartData = eventStats.filter((s) => s.revenue > 0 || s.tickets > 0).slice(0, 8).map((s) => ({
    name: s.event.title.length > 20 ? s.event.title.slice(0, 18) + "…" : s.event.title, revenue: s.revenue, tickets: s.tickets,
  }));

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={DollarSign} label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} />
        <StatCard icon={Ticket} label="Tickets Sold" value={totalTickets.toString()} />
        <StatCard icon={TrendingUp} label="Total Orders" value={totalOrders.toString()} />
        <StatCard icon={Users} label="Unique Attendees" value={uniqueAttendees.toString()} />
      </div>

      {wallet && (
        <Link to="/dashboard/wallet" className="block mb-6">
          <div className="rounded-xl border bg-gradient-to-r from-primary/10 to-primary/5 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available Balance</p>
                  <p className="text-2xl font-bold">${wallet.available_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-sm font-semibold">${wallet.pending_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-muted-foreground">Total Earned</p>
                  <p className="text-sm font-semibold">${wallet.total_earned.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        </Link>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={Activity} label="Avg Order Value" value={totalOrders > 0 ? `$${(totalRevenue / totalOrders).toFixed(2)}` : "$0"} />
        <StatCard icon={CalendarDays} label="Active Events" value={String(events?.filter(e => new Date(e.date) >= new Date()).length ?? 0)} sub={`${events?.filter(e => new Date(e.date) < new Date()).length ?? 0} past`} />
        <StatCard icon={Percent} label="Avg Fill Rate" value={`${events && events.length > 0 ? Math.round(events.reduce((s, e) => s + (e.capacity > 0 ? (e.tickets_sold / e.capacity) * 100 : 0), 0) / events.length) : 0}%`} />
        <StatCard icon={TrendingUp} label="Revenue/Event" value={events && events.length > 0 ? `$${Math.round(totalRevenue / events.length)}` : "$0"} />
      </div>

      {orderItems && orderItems.length > 0 && (
        <div className="mb-10">
          <h3 className="text-lg font-semibold mb-3">Sales Trend (Last 30 Days)</h3>
          <div className="rounded-xl border bg-card p-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={(() => {
                const endDate = startOfDay(new Date());
                const days = eachDayOfInterval({ start: subDays(endDate, 29), end: endDate });
                let cumRev = 0;
                return days.map((day) => {
                  const dayStr = format(day, "yyyy-MM-dd");
                  const dayItems = orderItems.filter((i) => format(parseISO(i.created_at), "yyyy-MM-dd") === dayStr);
                  const dayRev = dayItems.reduce((s, i) => s + i.ticket_price * i.quantity, 0);
                  cumRev += dayRev;
                  return { date: format(day, "MMM d"), revenue: dayRev, cumulative: cumRev };
                });
              })()}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: "0.75rem" }} formatter={(value: number, name: string) => [`$${value}`, name === "cumulative" ? "Cumulative" : "Daily Revenue"]} />
                <Line type="monotone" dataKey="cumulative" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-2, 173 58% 39%))" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {chartData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Revenue by Event</h3>
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
    </div>
  );
};

export default DashboardOverview;
