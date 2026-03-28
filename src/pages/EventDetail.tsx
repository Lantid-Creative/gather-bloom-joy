import { useParams, Link } from "react-router-dom";
import { Calendar, MapPin, Users, Clock, ArrowLeft, Share2 } from "lucide-react";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import TicketSelector from "@/components/TicketSelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockEvents } from "@/lib/mock-data";

const EventDetail = () => {
  const { id } = useParams();
  const event = mockEvents.find((e) => e.id === id);

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold">Event not found</h1>
          <Button variant="link" asChild className="mt-4">
            <Link to="/">← Back to events</Link>
          </Button>
        </div>
      </div>
    );
  }

  const spotsLeft = event.capacity - event.tickets_sold;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative h-[360px] overflow-hidden">
        <img
          src={event.image_url}
          alt={event.title}
          className="h-full w-full object-cover"
          width={1920}
          height={960}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 container">
          <Button variant="ghost" size="sm" asChild className="text-primary-foreground/80 hover:text-primary-foreground mb-4 -ml-2">
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> All Events</Link>
          </Button>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className="bg-primary text-primary-foreground border-0">{event.category}</Badge>
            {event.is_online && <Badge className="bg-success text-success-foreground border-0">Online</Badge>}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground">{event.title}</h1>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-surface space-y-1">
                <Calendar className="h-5 w-5 text-primary" />
                <p className="text-sm font-semibold">{format(new Date(event.date), "MMM d, yyyy")}</p>
                <p className="text-xs text-muted-foreground">Date</p>
              </div>
              <div className="p-4 rounded-xl bg-surface space-y-1">
                <Clock className="h-5 w-5 text-primary" />
                <p className="text-sm font-semibold">{event.time}</p>
                <p className="text-xs text-muted-foreground">Time</p>
              </div>
              <div className="p-4 rounded-xl bg-surface space-y-1">
                <MapPin className="h-5 w-5 text-primary" />
                <p className="text-sm font-semibold">{event.location.split(",")[0]}</p>
                <p className="text-xs text-muted-foreground">Venue</p>
              </div>
              <div className="p-4 rounded-xl bg-surface space-y-1">
                <Users className="h-5 w-5 text-primary" />
                <p className="text-sm font-semibold">{spotsLeft} left</p>
                <p className="text-xs text-muted-foreground">of {event.capacity}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-bold mb-3">About this event</h2>
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>

            {/* Schedule */}
            {event.schedule && (
              <div>
                <h2 className="text-xl font-bold mb-4">Schedule</h2>
                <div className="space-y-0">
                  {event.schedule.map((item, i) => (
                    <div key={i} className="flex gap-4 py-3 border-b last:border-0">
                      <span className="text-sm font-semibold text-primary w-24 shrink-0">
                        {item.time}
                      </span>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        {item.speaker && (
                          <p className="text-sm text-muted-foreground">{item.speaker}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ticket Sidebar */}
          <div className="space-y-4">
            <div className="sticky top-24">
              <h2 className="text-xl font-bold mb-4">Tickets</h2>
              <div className="space-y-3">
                {event.ticket_types.map((ticket) => (
                  <TicketSelector
                    key={ticket.id}
                    ticket={ticket}
                    eventId={event.id}
                    eventTitle={event.title}
                  />
                ))}
              </div>
              <div className="mt-6 p-4 rounded-xl bg-surface text-sm">
                <p className="font-semibold">Organized by</p>
                <p className="text-muted-foreground">{event.organizer}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
