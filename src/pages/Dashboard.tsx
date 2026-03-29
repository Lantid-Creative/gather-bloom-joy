import { useState } from "react";
import type { DbTable } from "@/lib/db-types";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, DollarSign, Ticket, Users, TrendingUp, ChevronDown, ChevronUp, Download, QrCode, Mail, Loader2, Handshake, Copy, Activity, CalendarDays, Percent } from "lucide-react";
import EventbriteHeader from "@/components/EventbriteHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, eachDayOfInterval, startOfDay, parseISO, differenceInDays } from "date-fns";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import PromoCodeManager from "@/components/PromoCodeManager";
import TrackingLinkManager from "@/components/TrackingLinkManager";
import SponsorshipTierManager from "@/components/SponsorshipTierManager";
import AiSalesInsights from "@/components/AiSalesInsights";
import AiPromoCopyGenerator from "@/components/AiPromoCopyGenerator";
import AiInfluencerMatcher from "@/components/AiInfluencerMatcher";
import AiSmartPricing from "@/components/AiSmartPricing";
import AiSponsorshipProposal from "@/components/AiSponsorshipProposal";
import FlashSaleManager from "@/components/FlashSaleManager";
import ReferralProgramManager from "@/components/ReferralProgramManager";
import SocialPostScheduler from "@/components/SocialPostScheduler";
import EmailCampaignManager from "@/components/EmailCampaignManager";
import DpTemplateManager from "@/components/DpTemplateManager";
import TimeSlotManager from "@/components/TimeSlotManager";
import LineupManager from "@/components/LineupManager";
import EventReportPanel from "@/components/EventReportPanel";
import AdsManager from "@/components/AdsManager";

interface OrderItem { id: string; order_id: string; event_id: string; event_title: string; ticket_name: string; ticket_price: number; quantity: number; created_at: string; }
interface Order { id: string; customer_name: string; customer_email: string; total: number; created_at: string; }

const StatCard = ({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub?: string }) => (
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
  const [syncingEvent, setSyncingEvent] = useState<string | null>(null);
  const { toast } = useToast();
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

  const handleMailchimpSync = async (eventId: string, eventTitle: string) => {
    setSyncingEvent(eventId);
    try {
      const { data, error } = await supabase.functions.invoke("sync-mailchimp", {
        body: { eventId, eventTitle },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({
        title: "Synced to Mailchimp! 📧",
        description: `${data.added} added, ${data.updated} updated to "${data.listName}"`,
      });
    } catch (err: unknown) {
      toast({ title: "Mailchimp sync failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setSyncingEvent(null);
    }
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={DollarSign} label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} />
          <StatCard icon={Ticket} label="Tickets Sold" value={totalTickets.toString()} />
          <StatCard icon={TrendingUp} label="Total Orders" value={totalOrders.toString()} />
          <StatCard icon={Users} label="Unique Attendees" value={uniqueAttendees.toString()} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={Activity} label="Avg Order Value" value={totalOrders > 0 ? `$${(totalRevenue / totalOrders).toFixed(2)}` : "$0"} />
          <StatCard icon={CalendarDays} label="Active Events" value={String(events?.filter(e => new Date(e.date) >= new Date()).length ?? 0)} sub={`${events?.filter(e => new Date(e.date) < new Date()).length ?? 0} past`} />
          <StatCard icon={Percent} label="Avg Fill Rate" value={`${events && events.length > 0 ? Math.round(events.reduce((s, e) => s + (e.capacity > 0 ? (e.tickets_sold / e.capacity) * 100 : 0), 0) / events.length) : 0}%`} />
          <StatCard icon={TrendingUp} label="Revenue/Event" value={events && events.length > 0 ? `$${Math.round(totalRevenue / events.length)}` : "$0"} />
        </div>

        {/* Sales Trend + Revenue by Event */}
        {orderItems && orderItems.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4">Sales Trend (Last 30 Days)</h2>
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

        {/* AI Sales Insights & Forecasting */}
        {eventStats.length > 0 && (
          <div className="mb-10">
            <AiSalesInsights
              events={eventStats.map((s) => ({ title: s.event.title, revenue: s.revenue, tickets: s.tickets, date: s.event.date }))}
              totalRevenue={totalRevenue}
              totalTickets={totalTickets}
              totalOrders={totalOrders}
            />
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
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs font-medium px-2 py-0.5"><Users className="h-3 w-3" />{tickets}</span>
                      <Link to={`/check-in/${event.id}`} onClick={(e) => e.stopPropagation()} className="text-xs text-primary hover:underline flex items-center gap-1"><QrCode className="h-3 w-3" /> Check-in</Link>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const { data: cloned, error } = await supabase.from("events").insert({
                              user_id: user!.id,
                              title: `${event.title} (Copy)`,
                              description: event.description,
                              date: event.date,
                              end_date: event.end_date,
                              time: event.time,
                              location: event.location,
                              image_url: event.image_url,
                              extra_images: ((event as unknown as Record<string, unknown>).extra_images as string[]) || [] || [],
                              category: event.category,
                              organizer: event.organizer,
                              capacity: event.capacity,
                              is_online: event.is_online,
                              meeting_platform: event.meeting_platform,
                              meeting_url: event.meeting_url,
                              tags: event.tags,
                              status: "draft",
                              recurrence_type: event.recurrence_type,
                              currency: event.currency,
                            }).select().single();
                            if (error) throw error;
                            // Clone ticket types
                            const { data: tickets } = await supabase.from("ticket_types").select("*").eq("event_id", event.id);
                            if (tickets && tickets.length > 0) {
                              await supabase.from("ticket_types").insert(
                                tickets.map((t: Tables<"ticket_types">) => ({ event_id: cloned.id, name: t.name, price: t.price, description: t.description, available: t.available, max_per_order: t.max_per_order }))
                              );
                            }
                            queryClient.invalidateQueries({ queryKey: ["dashboard-events"] });
                            toast({ title: "Event duplicated as draft! ✨" });
                          } catch (err: unknown) {
                            toast({ title: "Failed to duplicate", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
                          }
                        }}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <Copy className="h-3 w-3" /> Duplicate
                      </button>
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
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <h3 className="text-sm font-semibold">Attendees ({eventOrders.length})</h3>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => {
                              const rows = [["Name", "Email"], ...eventOrders.map(o => [o.customer_name, o.customer_email])];
                              const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
                              const blob = new Blob([csv], { type: "text/csv" });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a"); a.href = url; a.download = `attendees-${event.title.slice(0,30).replace(/\s+/g,"-").toLowerCase()}.csv`; a.click();
                              URL.revokeObjectURL(url);
                            }}>
                              <Mail className="h-3 w-3 mr-1" /> Export Emails
                            </Button>
                            <Button
                              variant="hero"
                              size="sm"
                              className="rounded-full text-xs"
                              disabled={syncingEvent === event.id}
                              onClick={() => handleMailchimpSync(event.id, event.title)}
                            >
                              {syncingEvent === event.id ? (
                                <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Syncing...</>
                              ) : (
                                <><Mail className="h-3 w-3 mr-1" /> Sync to Mailchimp</>
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-2 pr-4 font-medium">Name</th><th className="pb-2 pr-4 font-medium">Email</th><th className="pb-2 pr-4 font-medium">Date</th><th className="pb-2 font-medium text-right">Amount</th></tr></thead>
                            <tbody>{eventOrders.map((order) => (<tr key={order.id} className="border-b last:border-0"><td className="py-2 pr-4">{order.customer_name}</td><td className="py-2 pr-4 text-muted-foreground">{order.customer_email}</td><td className="py-2 pr-4 text-muted-foreground">{format(new Date(order.created_at), "MMM d")}</td><td className="py-2 text-right font-medium">${order.total}</td></tr>))}</tbody>
                          </table>
                        </div>
                      </>
                    )}

                    {/* Event Report Panel */}
                    <EventReportPanel
                      eventId={event.id}
                      eventTitle={event.title}
                      eventDate={event.date}
                      capacity={event.capacity}
                      ticketsSold={event.tickets_sold}
                      orderItems={orderItems?.filter((i) => i.event_id === event.id) ?? []}
                      orders={eventOrders ?? []}
                    />

                    {/* Ads Manager */}
                    <div className="border-t pt-4 mt-4">
                      <AdsManager eventId={event.id} eventTitle={event.title} />
                    </div>

                    {/* Timed Entry Slots */}
                    <div className="border-t pt-4 mt-4">
                      <TimeSlotManager eventId={event.id} />
                    </div>

                    {/* Artist Lineup */}
                    <div className="border-t pt-4 mt-4">
                      <LineupManager eventId={event.id} />
                    </div>

                    {/* Sponsorship Tiers */}
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Handshake className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-semibold">Sponsorship</h3>
                        <Button
                          variant={event.seeking_sponsors ? "hero" : "outline"}
                          size="sm"
                          className="rounded-full text-xs ml-auto h-7"
                          onClick={async () => {
                            await supabase.from("events").update({ seeking_sponsors: !event.seeking_sponsors }).eq("id", event.id);
                            queryClient.invalidateQueries({ queryKey: ["dashboard-events"] });
                            toast({ title: event.seeking_sponsors ? "Sponsorship disabled" : "Now seeking sponsors!" });
                          }}
                        >
                          {event.seeking_sponsors ? "Seeking Sponsors ✓" : "Enable Sponsorship"}
                        </Button>
                      </div>
                      {event.seeking_sponsors && <SponsorshipTierManager eventId={event.id} />}
                      {event.seeking_sponsors && (
                        <div className="mt-3">
                          <AiSponsorshipProposal
                            eventTitle={event.title}
                            eventCategory={event.category}
                            eventDescription={event.description}
                            eventLocation={event.location}
                            eventDate={event.date}
                            capacity={event.capacity}
                            ticketsSold={event.tickets_sold}
                            seekingSponsors={event.seeking_sponsors}
                          />
                        </div>
                      )}
                    </div>

                    {/* AI Smart Pricing */}
                    <div className="border-t pt-4 mt-4">
                      <AiSmartPricing
                        eventTitle={event.title}
                        eventCategory={event.category}
                        eventLocation={event.location}
                        capacity={event.capacity}
                        ticketsSold={event.tickets_sold}
                        isOnline={event.is_online}
                        currentTickets={(ticketTypes?.filter(t => t.event_id === event.id) ?? []).map(t => ({ name: t.name, price: t.price, available: t.available }))}
                      />
                    </div>

                    {/* AI Influencer Matching */}
                    <div className="border-t pt-4 mt-4">
                      <AiInfluencerMatcher
                        eventId={event.id}
                        eventTitle={event.title}
                        eventCategory={event.category}
                        eventLocation={event.location}
                        eventTags={event.tags || []}
                      />
                    </div>

                    {/* Flash Sales */}
                    <div className="border-t pt-4 mt-4">
                      <FlashSaleManager
                        eventId={event.id}
                        ticketTypes={(ticketTypes?.filter(t => t.event_id === event.id) ?? []).map(t => ({ id: t.id, name: t.name, price: t.price }))}
                      />
                    </div>

                    {/* Referral Program */}
                    <div className="border-t pt-4 mt-4">
                      <ReferralProgramManager eventId={event.id} eventTitle={event.title} />
                    </div>

                    {/* Social Media Scheduler */}
                    <div className="border-t pt-4 mt-4">
                      <SocialPostScheduler eventId={event.id} eventTitle={event.title} />
                    </div>

                    {/* DP & Flyer Generator */}
                    <div className="border-t pt-4 mt-4">
                      <DpTemplateManager eventId={event.id} />
                    </div>

                    {/* Email Campaigns */}
                    <div className="border-t pt-4 mt-4">
                      <EmailCampaignManager
                        eventId={event.id}
                        eventTitle={event.title}
                        attendees={eventOrders.map(o => ({ name: o.customer_name, email: o.customer_email }))}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* AI Promo Copy Generator */}
        <div className="mt-10">
          <AiPromoCopyGenerator events={events?.map((e) => ({ id: e.id, title: e.title, description: e.description, date: e.date, location: e.location })) ?? []} />
        </div>

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
