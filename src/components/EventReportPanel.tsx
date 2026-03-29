import { useMemo } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { DollarSign, Ticket, Users, TrendingUp, Clock, Target, BarChart3, PieChart as PieChartIcon, Activity, ArrowUpRight, ArrowDownRight, Percent } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, subDays, eachDayOfInterval, startOfDay, parseISO, differenceInDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface OrderItem {
  id: string;
  order_id: string;
  event_id: string;
  event_title: string;
  ticket_name: string;
  ticket_price: number;
  quantity: number;
  created_at: string;
  time_slot_label?: string | null;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  total: number;
  created_at: string;
}

interface EventReportPanelProps {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  capacity: number;
  ticketsSold: number;
  orderItems: OrderItem[];
  orders: Order[];
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2, 173 58% 39%))",
  "hsl(var(--chart-3, 197 37% 24%))",
  "hsl(var(--chart-4, 43 74% 66%))",
  "hsl(var(--chart-5, 27 87% 67%))",
];

const MiniStat = ({ icon: Icon, label, value, trend, trendLabel }: { icon: React.ElementType; label: string; value: string; trend?: "up" | "down" | "neutral"; trendLabel?: string }) => (
  <div className="rounded-lg border bg-card p-3 space-y-0.5">
    <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]"><Icon className="h-3 w-3" />{label}</div>
    <div className="flex items-center gap-2">
      <p className="text-lg font-bold">{value}</p>
      {trend && trendLabel && (
        <span className={`inline-flex items-center text-[10px] font-medium ${trend === "up" ? "text-green-600" : trend === "down" ? "text-destructive" : "text-muted-foreground"}`}>
          {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : trend === "down" ? <ArrowDownRight className="h-3 w-3" /> : null}
          {trendLabel}
        </span>
      )}
    </div>
  </div>
);

const EventReportPanel = ({ eventId, eventTitle, eventDate, capacity, ticketsSold, orderItems, orders }: EventReportPanelProps) => {
  // Fetch tracking links for conversion data
  const { data: trackingLinks } = useQuery({
    queryKey: ["report-tracking", eventId],
    queryFn: async () => {
      const { data } = await supabase.from("tracking_links").select("*").eq("event_id", eventId);
      return data ?? [];
    },
  });

  // Fetch check-ins
  const { data: checkIns } = useQuery({
    queryKey: ["report-checkins", eventId],
    queryFn: async () => {
      const orderItemIds = orderItems.map((i) => i.id);
      if (orderItemIds.length === 0) return [];
      const { data } = await supabase.from("attendee_check_ins").select("*").in("order_item_id", orderItemIds);
      return data ?? [];
    },
    enabled: orderItems.length > 0,
  });

  const revenue = orderItems.reduce((sum, i) => sum + i.ticket_price * i.quantity, 0);
  const totalQty = orderItems.reduce((sum, i) => sum + i.quantity, 0);
  const avgOrderValue = orders.length > 0 ? revenue / orders.length : 0;
  const capacityPercent = capacity > 0 ? Math.round((ticketsSold / capacity) * 100) : 0;
  const checkInRate = totalQty > 0 ? Math.round(((checkIns?.length ?? 0) / totalQty) * 100) : 0;
  const daysToEvent = differenceInDays(new Date(eventDate), new Date());

  // --- Ticket type breakdown ---
  const ticketBreakdown = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number }> = {};
    orderItems.forEach((item) => {
      if (!map[item.ticket_name]) map[item.ticket_name] = { name: item.ticket_name, qty: 0, revenue: 0 };
      map[item.ticket_name].qty += item.quantity;
      map[item.ticket_name].revenue += item.ticket_price * item.quantity;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [orderItems]);

  // --- Sales timeline (last 30 days or since first order) ---
  const salesTimeline = useMemo(() => {
    if (orderItems.length === 0) return [];
    const sorted = [...orderItems].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const firstDate = startOfDay(parseISO(sorted[0].created_at));
    const endDate = startOfDay(new Date());
    const days = eachDayOfInterval({ start: subDays(endDate, Math.min(29, differenceInDays(endDate, firstDate))), end: endDate });

    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayItems = orderItems.filter((i) => format(parseISO(i.created_at), "yyyy-MM-dd") === dayStr);
      const dayRevenue = dayItems.reduce((s, i) => s + i.ticket_price * i.quantity, 0);
      const dayQty = dayItems.reduce((s, i) => s + i.quantity, 0);
      return { date: format(day, "MMM d"), revenue: dayRevenue, tickets: dayQty };
    });
  }, [orderItems]);

  // --- Cumulative sales ---
  const cumulativeSales = useMemo(() => {
    let cumTickets = 0;
    let cumRevenue = 0;
    return salesTimeline.map((d) => {
      cumTickets += d.tickets;
      cumRevenue += d.revenue;
      return { ...d, cumTickets, cumRevenue };
    });
  }, [salesTimeline]);

  // --- Sales velocity (last 7 days vs prior 7 days) ---
  const salesVelocity = useMemo(() => {
    const now = new Date();
    const last7 = orderItems.filter((i) => differenceInDays(now, parseISO(i.created_at)) <= 7);
    const prior7 = orderItems.filter((i) => {
      const d = differenceInDays(now, parseISO(i.created_at));
      return d > 7 && d <= 14;
    });
    const last7Qty = last7.reduce((s, i) => s + i.quantity, 0);
    const prior7Qty = prior7.reduce((s, i) => s + i.quantity, 0);
    const change = prior7Qty > 0 ? Math.round(((last7Qty - prior7Qty) / prior7Qty) * 100) : last7Qty > 0 ? 100 : 0;
    return { last7Qty, prior7Qty, change };
  }, [orderItems]);

  // --- Traffic conversion ---
  const totalClicks = trackingLinks?.reduce((s, l) => s + l.clicks, 0) ?? 0;
  const conversionRate = totalClicks > 0 ? ((orders.length / totalClicks) * 100).toFixed(1) : "–";

  // --- Attendee purchase time distribution ---
  const purchaseHourDist = useMemo(() => {
    const hours = Array(24).fill(0);
    orders.forEach((o) => {
      const h = new Date(o.created_at).getHours();
      hours[h]++;
    });
    return hours.map((count, h) => ({ hour: `${h}:00`, count })).filter((_, i) => i >= 6 && i <= 23);
  }, [orders]);

  if (orderItems.length === 0 && (trackingLinks?.length ?? 0) === 0) {
    return null;
  }

  return (
    <div className="space-y-5 border-t pt-4 mt-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Event Report</h3>
        {daysToEvent > 0 && (
          <Badge variant="secondary" className="text-[10px] ml-auto">
            <Clock className="h-3 w-3 mr-0.5" /> {daysToEvent} days to event
          </Badge>
        )}
        {daysToEvent <= 0 && (
          <Badge className="text-[10px] ml-auto bg-primary/10 text-primary border-0">Event passed</Badge>
        )}
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <MiniStat icon={DollarSign} label="Revenue" value={`$${revenue.toLocaleString()}`} />
        <MiniStat icon={Ticket} label="Tickets Sold" value={`${totalQty}/${capacity}`} trend={capacityPercent >= 80 ? "up" : "neutral"} trendLabel={`${capacityPercent}% filled`} />
        <MiniStat icon={TrendingUp} label="Avg Order" value={`$${avgOrderValue.toFixed(2)}`} />
        <MiniStat
          icon={Activity}
          label="7-Day Sales"
          value={`${salesVelocity.last7Qty} tickets`}
          trend={salesVelocity.change > 0 ? "up" : salesVelocity.change < 0 ? "down" : "neutral"}
          trendLabel={salesVelocity.change !== 0 ? `${salesVelocity.change > 0 ? "+" : ""}${salesVelocity.change}%` : "No change"}
        />
      </div>

      {/* Check-in + conversion row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <MiniStat icon={Users} label="Check-in Rate" value={`${checkInRate}%`} trend={checkInRate >= 70 ? "up" : "neutral"} trendLabel={`${checkIns?.length ?? 0} checked in`} />
        <MiniStat icon={Target} label="Traffic Clicks" value={totalClicks.toLocaleString()} />
        <MiniStat icon={Percent} label="Conversion Rate" value={`${conversionRate}%`} trend={Number(conversionRate) > 5 ? "up" : "neutral"} trendLabel={`${orders.length} orders`} />
      </div>

      {/* Sales Timeline Chart */}
      {cumulativeSales.length > 1 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5" /> Sales Timeline
          </h4>
          <div className="rounded-xl border bg-card p-3 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cumulativeSales}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: "0.75rem" }}
                  formatter={(value: number, name: string) => [name === "cumRevenue" ? `$${value}` : value, name === "cumRevenue" ? "Cumulative Revenue" : "Cumulative Tickets"]}
                />
                <Line yAxisId="left" type="monotone" dataKey="cumTickets" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="cumTickets" />
                <Line yAxisId="right" type="monotone" dataKey="cumRevenue" stroke="hsl(var(--chart-2, 173 58% 39%))" strokeWidth={2} dot={false} name="cumRevenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Ticket Type Breakdown */}
      {ticketBreakdown.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <PieChartIcon className="h-3.5 w-3.5" /> Revenue by Ticket Type
            </h4>
            <div className="rounded-xl border bg-card p-3 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ticketBreakdown}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={65}
                    paddingAngle={2}
                  >
                    {ticketBreakdown.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: "0.75rem" }}
                    formatter={(value: number) => [`$${value}`, "Revenue"]}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Ticket className="h-3.5 w-3.5" /> Ticket Sales Breakdown
            </h4>
            <div className="rounded-xl border bg-card overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-2 font-medium text-muted-foreground">Ticket</th>
                    <th className="text-right p-2 font-medium text-muted-foreground">Qty</th>
                    <th className="text-right p-2 font-medium text-muted-foreground">Revenue</th>
                    <th className="text-right p-2 font-medium text-muted-foreground">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {ticketBreakdown.map((t, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="p-2 font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        {t.name}
                      </td>
                      <td className="p-2 text-right text-muted-foreground">{t.qty}</td>
                      <td className="p-2 text-right font-medium">${t.revenue.toLocaleString()}</td>
                      <td className="p-2 text-right text-muted-foreground">{revenue > 0 ? Math.round((t.revenue / revenue) * 100) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Traffic / Tracking Links Conversion */}
      {trackingLinks && trackingLinks.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5" /> Traffic Sources
          </h4>
          <div className="rounded-xl border bg-card p-3 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trackingLinks.map((l) => ({ name: l.label || l.code, clicks: l.clicks }))}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: "0.75rem" }}
                />
                <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Purchase Time Distribution */}
      {purchaseHourDist.some((d) => d.count > 0) && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Purchase Time Distribution
          </h4>
          <div className="rounded-xl border bg-card p-3 h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={purchaseHourDist}>
                <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={1} />
                <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: "0.75rem" }}
                  formatter={(value: number) => [value, "Orders"]}
                />
                <Bar dataKey="count" fill="hsl(var(--chart-4, 43 74% 66%))" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Capacity gauge */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground">Capacity Utilization</span>
          <span className="text-sm font-bold">{capacityPercent}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              capacityPercent >= 90 ? "bg-destructive" : capacityPercent >= 60 ? "bg-amber-500" : "bg-primary"
            }`}
            style={{ width: `${capacityPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
          <span>{ticketsSold} sold</span>
          <span>{capacity - ticketsSold > 0 ? `${capacity - ticketsSold} remaining` : "Sold out"}</span>
        </div>
      </div>
    </div>
  );
};

export default EventReportPanel;
