import { useState } from "react";
import type { DbTable } from "@/lib/db-types";
import { Link } from "react-router-dom";
import { Users, ChevronDown, ChevronUp, QrCode, Mail, Loader2, Handshake, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import SponsorshipTierManager from "@/components/SponsorshipTierManager";
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

const DashboardEvents = () => {
  const { user, events, orderItems, ticketTypes, orders, eventStats, queryClient } = useDashboardData();
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [syncingEvent, setSyncingEvent] = useState<string | null>(null);
  const { toast } = useToast();

  const handleMailchimpSync = async (eventId: string, eventTitle: string) => {
    setSyncingEvent(eventId);
    try {
      const { data, error } = await supabase.functions.invoke("sync-mailchimp", { body: { eventId, eventTitle } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Synced to Mailchimp! 📧", description: `${data.added} added, ${data.updated} updated to "${data.listName}"` });
    } catch (err: unknown) {
      toast({ title: "Mailchimp sync failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally { setSyncingEvent(null); }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Event Breakdown</h2>
      {eventStats.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No events yet.</p>
          <Button variant="hero" size="sm" className="rounded-full mt-4" asChild><Link to="/create-event">Create Your First Event</Link></Button>
        </div>
      ) : (
        <div className="space-y-3">
          {eventStats.map(({ event, revenue, tickets, orders: eventOrders }) => (
            <div key={event.id} className="border rounded-xl overflow-hidden">
              <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors text-left" onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold truncate">{event.title}</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs font-medium px-2 py-0.5"><Users className="h-3 w-3" />{tickets}</span>
                    <Link to={`/check-in/${event.id}`} onClick={(e) => e.stopPropagation()} className="text-xs text-primary hover:underline flex items-center gap-1"><QrCode className="h-3 w-3" /> Check-in</Link>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const { data: cloned, error } = await supabase.from("events").insert({
                            user_id: user!.id, title: `${event.title} (Copy)`, description: event.description, date: event.date, end_date: event.end_date, time: event.time, location: event.location, image_url: event.image_url,
                            extra_images: ((event as unknown as Record<string, unknown>).extra_images as string[]) || [],
                            category: event.category, organizer: event.organizer, capacity: event.capacity, is_online: event.is_online, meeting_platform: event.meeting_platform, meeting_url: event.meeting_url, tags: event.tags, status: "draft", recurrence_type: event.recurrence_type, currency: event.currency,
                          }).select().single();
                          if (error) throw error;
                          const { data: tix } = await supabase.from("ticket_types").select("*").eq("event_id", event.id);
                          if (tix && tix.length > 0) {
                            await supabase.from("ticket_types").insert(tix.map((t: DbTable<"ticket_types">) => ({ event_id: cloned.id, name: t.name, price: t.price, description: t.description, available: t.available, max_per_order: t.max_per_order })));
                          }
                          queryClient.invalidateQueries({ queryKey: ["dashboard-events"] });
                          toast({ title: "Event duplicated as draft! ✨" });
                        } catch (err: unknown) {
                          toast({ title: "Failed to duplicate", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
                        }
                      }}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    ><Copy className="h-3 w-3" /> Duplicate</button>
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
                          }}><Mail className="h-3 w-3 mr-1" /> Export Emails</Button>
                          <Button variant="hero" size="sm" className="rounded-full text-xs" disabled={syncingEvent === event.id} onClick={() => handleMailchimpSync(event.id, event.title)}>
                            {syncingEvent === event.id ? (<><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Syncing...</>) : (<><Mail className="h-3 w-3 mr-1" /> Sync to Mailchimp</>)}
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
                  <EventReportPanel eventId={event.id} eventTitle={event.title} eventDate={event.date} capacity={event.capacity} ticketsSold={event.tickets_sold} orderItems={orderItems?.filter((i) => i.event_id === event.id) ?? []} orders={eventOrders ?? []} />
                  <div className="border-t pt-4 mt-4"><AdsManager eventId={event.id} eventTitle={event.title} /></div>
                  <div className="border-t pt-4 mt-4"><TimeSlotManager eventId={event.id} /></div>
                  <div className="border-t pt-4 mt-4"><LineupManager eventId={event.id} /></div>
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Handshake className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold">Sponsorship</h3>
                      <Button variant={event.seeking_sponsors ? "hero" : "outline"} size="sm" className="rounded-full text-xs ml-auto h-7" onClick={async () => { await supabase.from("events").update({ seeking_sponsors: !event.seeking_sponsors }).eq("id", event.id); queryClient.invalidateQueries({ queryKey: ["dashboard-events"] }); toast({ title: event.seeking_sponsors ? "Sponsorship disabled" : "Now seeking sponsors!" }); }}>
                        {event.seeking_sponsors ? "Seeking Sponsors ✓" : "Enable Sponsorship"}
                      </Button>
                    </div>
                    {event.seeking_sponsors && <SponsorshipTierManager eventId={event.id} />}
                    {event.seeking_sponsors && (<div className="mt-3"><AiSponsorshipProposal eventTitle={event.title} eventCategory={event.category} eventDescription={event.description} eventLocation={event.location} eventDate={event.date} capacity={event.capacity} ticketsSold={event.tickets_sold} seekingSponsors={event.seeking_sponsors} /></div>)}
                  </div>
                  <div className="border-t pt-4 mt-4"><AiSmartPricing eventTitle={event.title} eventCategory={event.category} eventLocation={event.location} capacity={event.capacity} ticketsSold={event.tickets_sold} isOnline={event.is_online} currentTickets={(ticketTypes?.filter(t => t.event_id === event.id) ?? []).map(t => ({ name: t.name, price: t.price, available: t.available }))} /></div>
                  <div className="border-t pt-4 mt-4"><AiInfluencerMatcher eventId={event.id} eventTitle={event.title} eventCategory={event.category} eventLocation={event.location} eventTags={event.tags || []} /></div>
                  <div className="border-t pt-4 mt-4"><FlashSaleManager eventId={event.id} ticketTypes={(ticketTypes?.filter(t => t.event_id === event.id) ?? []).map(t => ({ id: t.id, name: t.name, price: t.price }))} /></div>
                  <div className="border-t pt-4 mt-4"><ReferralProgramManager eventId={event.id} eventTitle={event.title} /></div>
                  <div className="border-t pt-4 mt-4"><SocialPostScheduler eventId={event.id} eventTitle={event.title} /></div>
                  <div className="border-t pt-4 mt-4"><DpTemplateManager eventId={event.id} /></div>
                  <div className="border-t pt-4 mt-4"><EmailCampaignManager eventId={event.id} eventTitle={event.title} attendees={eventOrders.map(o => ({ name: o.customer_name, email: o.customer_email }))} /></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardEvents;
