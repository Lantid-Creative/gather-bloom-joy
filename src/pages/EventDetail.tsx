import { useParams, Link, useSearchParams } from "react-router-dom";
import { Calendar, MapPin, Users, Bookmark, Bell, Handshake, Video, ExternalLink, ImagePlus, Flame, Clock, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { format, differenceInHours, differenceInDays } from "date-fns";
import QantidHeader from "@/components/QantidHeader";
import QantidFooter from "@/components/QantidFooter";
import TicketSelector from "@/components/TicketSelector";
import GoogleMap from "@/components/GoogleMap";
import ShareButtons from "@/components/ShareButtons";
import WaitlistButton from "@/components/WaitlistButton";
import FollowButton from "@/components/FollowButton";
import FavoriteButton from "@/components/FavoriteButton";
import SponsorshipRequestForm from "@/components/SponsorshipRequestForm";
import SEOHead from "@/components/SEOHead";
import EventChatbot from "@/components/EventChatbot";
import EventLineupDisplay from "@/components/EventLineupDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEvent } from "@/hooks/useEvents";
import { mockEvents } from "@/lib/mock-data";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const platformLabels: Record<string, string> = {
  zoom: "Zoom",
  google_meet: "Google Meet",
  microsoft_teams: "Microsoft Teams",
  webex: "Cisco Webex",
  youtube_live: "YouTube Live",
  facebook_live: "Facebook Live",
  twitter_spaces: "X (Twitter) Spaces",
  discord: "Discord",
  other: "Virtual Meeting",
};
const platformLabel = (p?: string) => (p && platformLabels[p]) || "Online Event";

const EventDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { data: dbEvent, isLoading } = useEvent(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const [galleryIndex, setGalleryIndex] = useState(0);
  const event = dbEvent ?? mockEvents.find((e) => e.id === id) ?? null;

  // Track referral link click
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && id) {
      supabase.rpc("track_link_click", { p_event_id: id, p_code: ref }).then(() => {});
    }
  }, [id, searchParams]);

  // Build JSON-LD for event
  const eventJsonLd = event
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        name: event.title,
        description: event.description?.slice(0, 300),
        startDate: event.date,
        ...(event.end_date ? { endDate: event.end_date } : {}),
        location: event.is_online
          ? { "@type": "VirtualLocation", url: window.location.href }
          : { "@type": "Place", name: event.location, address: event.location },
        image: event.image_url,
        organizer: { "@type": "Organization", name: event.organizer },
        eventAttendanceMode: event.is_online
          ? "https://schema.org/OnlineEventAttendanceMode"
          : "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        url: window.location.href,
      }
    : undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <QantidHeader />
        <div className="container max-w-5xl py-20 text-center">
          <div className="animate-pulse space-y-4">
            <div className="aspect-[5/2] rounded-xl bg-muted" />
            <div className="h-8 bg-muted rounded w-1/2 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <QantidHeader />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold">Event not found</h1>
          <Button variant="link" asChild className="mt-4"><Link to="/">← Back to events</Link></Button>
        </div>
      </div>
    );
  }

  const spotsLeft = event.capacity - event.tickets_sold;
  const soldOut = spotsLeft <= 0;
  const organizerId = event.user_id;
  const extraImages: string[] = event.extra_images ?? [];
  const allImages = [event.image_url, ...extraImages].filter(Boolean);
  
  // Urgency calculations
  const hoursUntilEvent = differenceInHours(new Date(event.date), new Date());
  const daysUntilEvent = differenceInDays(new Date(event.date), new Date());
  const capacityPercent = event.capacity > 0 ? (event.tickets_sold / event.capacity) * 100 : 0;
  const isSellingFast = capacityPercent >= 70 && !soldOut;
  const isAlmostSoldOut = spotsLeft > 0 && spotsLeft <= 10;
  const isToday = daysUntilEvent === 0 && hoursUntilEvent > 0;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={event.title}
        description={event.description?.slice(0, 160) || `${event.title} in ${event.location}`}
        ogImage={event.image_url}
        ogType="website"
        jsonLd={eventJsonLd}
      />
      <QantidHeader />

      {/* Image Gallery */}
      <div className="container max-w-5xl py-6">
        <div className="relative rounded-xl overflow-hidden aspect-[2/1] md:aspect-[5/2]">
          <img src={allImages[galleryIndex] || event.image_url} alt={event.title} className="h-full w-full object-cover" width={1920} height={960} />
          <FavoriteButton eventId={event.id} />
          {/* Urgency badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {soldOut && <Badge className="bg-destructive text-destructive-foreground text-xs font-bold border-0">Sold Out</Badge>}
            {isAlmostSoldOut && !soldOut && (
              <Badge className="bg-destructive/90 text-destructive-foreground text-xs font-bold border-0 animate-pulse">
                <Flame className="h-3.5 w-3.5 mr-1" /> Only {spotsLeft} tickets left!
              </Badge>
            )}
            {isSellingFast && !isAlmostSoldOut && !soldOut && (
              <Badge className="bg-amber-500 text-white text-xs font-bold border-0">
                <Zap className="h-3.5 w-3.5 mr-1" /> Selling Fast · {Math.round(capacityPercent)}% sold
              </Badge>
            )}
            {isToday && (
              <Badge className="bg-primary text-primary-foreground text-xs font-bold border-0">
                <Clock className="h-3.5 w-3.5 mr-1" /> Happening Today!
              </Badge>
            )}
          </div>
          {/* Gallery navigation */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={() => setGalleryIndex((i) => (i - 1 + allImages.length) % allImages.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setGalleryIndex((i) => (i + 1) % allImages.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setGalleryIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === galleryIndex ? "bg-white scale-125" : "bg-white/50"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        {/* Thumbnail strip */}
        {allImages.length > 1 && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setGalleryIndex(i)}
                className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === galleryIndex ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="container max-w-5xl pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <p className="text-sm font-semibold text-primary">{format(new Date(event.date), "EEEE, MMMM d, yyyy")}</p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">{event.title}</h1>

            <Link to={organizerId ? `/organizer/${organizerId}` : "#"} className="flex items-center gap-3 p-4 rounded-lg bg-surface hover:bg-accent/50 transition-colors">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{event.organizer[0]}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">By {event.organizer}</p>
                <p className="text-xs text-muted-foreground">Organizer</p>
              </div>
              {organizerId && (
                <div onClick={(e) => e.preventDefault()}>
                  <FollowButton organizerId={organizerId} organizerName={event.organizer} />
                </div>
              )}
            </Link>

            <div className="space-y-4">
              <h2 className="text-xl font-bold">When and where</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-3 p-4 rounded-lg border">
                  <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Date and time</p>
                    <p className="text-sm text-muted-foreground">{format(new Date(event.date), "EEE, MMM d, yyyy · h:mm a")}</p>
                  </div>
                </div>
                <div className="flex gap-3 p-4 rounded-lg border">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Location</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </div>
                </div>
              </div>
              {!event.is_online && (
                <div className="h-48 rounded-xl overflow-hidden border"><GoogleMap location={event.location} /></div>
              )}
              {event.is_online && event.meeting_url && (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
                  <Video className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">
                      {platformLabel(event.meeting_platform)}
                    </p>
                    <p className="text-xs text-muted-foreground">Online event — join via the link below</p>
                  </div>
                  <Button size="sm" className="rounded-full gap-1.5" asChild>
                    <a href={event.meeting_url} target="_blank" rel="noopener noreferrer">
                      Join <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold">About this event</h2>
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (<Badge key={tag} variant="secondary" className="rounded-full">{tag}</Badge>))}
              </div>
            </div>

            {event.schedule && event.schedule.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Schedule</h2>
                <div className="space-y-0">
                  {event.schedule.map((item, i) => (
                    <div key={i} className="flex gap-4 py-3 border-b last:border-0">
                      <span className="text-sm font-semibold text-primary w-24 shrink-0">{item.time}</span>
                      <div>
                        <p className="font-medium text-sm">{item.title}</p>
                        {item.speaker && <p className="text-xs text-muted-foreground">{item.speaker}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Artist Lineup */}
            <EventLineupDisplay eventId={event.id} />
          </div>

          {/* Sidebar */}
          <div>
            <div className="sticky top-20 space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-full flex items-center gap-1.5">
                  <Bookmark className="h-3.5 w-3.5" /> Save
                </Button>
                <ShareButtons title={event.title} />
                {user && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full flex items-center gap-1.5"
                    onClick={async () => {
                      await supabase.from("notifications").insert({
                        user_id: user.id,
                        title: `Reminder: ${event.title}`,
                        message: `Don't forget! "${event.title}" is on ${format(new Date(event.date), "EEE, MMM d")}. Get ready!`,
                        type: "reminder",
                        link: `/event/${event.id}`,
                      });
                      toast({ title: "Reminder set! 🔔" });
                    }}
                  >
                    <Bell className="h-3.5 w-3.5" /> Remind Me
                  </Button>
                )}
              </div>

              {soldOut ? (
                <>
                  <div className="border rounded-xl p-5 text-center space-y-2">
                    <Badge variant="destructive" className="text-sm px-4 py-1">Sold Out</Badge>
                    <p className="text-muted-foreground text-sm">All tickets for this event have been sold.</p>
                  </div>
                  <WaitlistButton eventId={event.id} />
                </>
              ) : event.ticket_types.length > 0 ? (
                <div className="border rounded-xl p-5 space-y-4">
                  <h3 className="font-bold">Select tickets</h3>
                  {event.ticket_types.map((ticket) => (
                    <TicketSelector key={ticket.id} ticket={ticket} eventId={event.id} eventTitle={event.title} />
                  ))}
                </div>
              ) : (
                <div className="border rounded-xl p-5 text-center text-muted-foreground"><p>No tickets available yet</p></div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-surface">
                <Users className="h-4 w-4" />
                <span>{soldOut ? "This event is sold out" : `${spotsLeft} spots remaining out of ${event.capacity}`}</span>
              </div>

              {/* DP Generator Link */}
              <Link to={`/event/${event.id}/dp`}>
                <Button variant="outline" className="w-full gap-2">
                  <ImagePlus className="h-4 w-4" /> Create Your Event DP
                </Button>
              </Link>

              {event.seeking_sponsors && (
                <SponsorshipRequestForm eventId={event.id} />
              )}
              {searchParams.get("sponsor") === "true" && !event.seeking_sponsors && (
                <div className="border rounded-xl p-5 text-center space-y-2">
                  <Handshake className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">This event is not currently seeking sponsors.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <QantidFooter />
      {event && (
        <EventChatbot
          event={{
            title: event.title,
            description: event.description,
            date: event.date,
            time: event.time,
            location: event.location,
            is_online: event.is_online,
            meeting_platform: event.meeting_platform ?? "",
            organizer: event.organizer,
            ticket_types: event.ticket_types?.map((t) => ({ name: t.name, price: t.price, available: t.available })),
          }}
        />
      )}
    </div>
  );
};

export default EventDetail;
