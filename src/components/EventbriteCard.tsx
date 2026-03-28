import { Link } from "react-router-dom";
import type { Event } from "@/lib/types";
import { format } from "date-fns";
import { Bookmark } from "lucide-react";

interface EventbriteCardProps {
  event: Event;
}

const EventbriteCard = ({ event }: EventbriteCardProps) => {
  const lowestPrice = Math.min(...event.ticket_types.map((t) => t.price));

  return (
    <Link to={`/event/${event.id}`} className="group block">
      <div className="overflow-hidden rounded-lg transition-all duration-200 hover:shadow-md">
        {/* Image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-muted rounded-lg">
          <img
            src={event.image_url}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            width={800}
            height={450}
          />
          <button
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
            onClick={(e) => { e.preventDefault(); }}
          >
            <Bookmark className="h-4 w-4 text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="pt-3 space-y-1">
          <h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <p className="text-sm text-primary font-medium">
            {format(new Date(event.date), "EEE, MMM d · h:mm a")}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {event.location}
          </p>
          <p className="text-sm font-medium pt-0.5">
            {lowestPrice === 0 ? "Free" : `From $${lowestPrice.toFixed(2)}`}
          </p>
          <p className="text-xs text-muted-foreground">
            {event.organizer}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default EventbriteCard;
