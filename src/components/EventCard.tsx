import { Link } from "react-router-dom";
import { Calendar, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@/lib/types";
import { format } from "date-fns";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const lowestPrice = Math.min(...event.ticket_types.map((t) => t.price));
  const spotsLeft = event.capacity - event.tickets_sold;
  const almostFull = spotsLeft < event.capacity * 0.15;

  return (
    <Link to={`/event/${event.id}`} className="group block">
      <div className="overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            width={800}
            height={512}
          />
          <div className="absolute top-3 left-3">
            <Badge className="bg-background/90 text-foreground backdrop-blur-sm border-0 font-medium">
              {event.category}
            </Badge>
          </div>
          {almostFull && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-destructive text-destructive-foreground border-0 font-medium">
                Almost Full
              </Badge>
            </div>
          )}
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm text-primary font-semibold">
            <Calendar className="h-4 w-4" />
            {format(new Date(event.date), "EEE, MMM d · h:mm a")}
          </div>
          <h3 className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {event.location.split(",")[0]}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {spotsLeft} spots left
            </span>
          </div>
          <div className="pt-2 border-t">
            <span className="text-sm font-semibold">
              From ${lowestPrice}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
