import { Link } from "react-router-dom";
import type { Event } from "@/lib/types";
import { format } from "date-fns";
import FavoriteButton from "@/components/FavoriteButton";

interface EventbriteCardProps {
  event: Event;
}

const EventbriteCard = ({ event }: EventbriteCardProps) => {
  const lowestPrice = event.ticket_types.length > 0 ? Math.min(...event.ticket_types.map((t) => t.price)) : 0;
  const soldOut = event.capacity - event.tickets_sold <= 0;

  return (
    <Link to={`/event/${event.id}`} className="group block">
      <div className="overflow-hidden rounded-lg transition-all duration-200 hover:shadow-md">
        <div className="relative aspect-[16/9] overflow-hidden bg-muted rounded-lg">
          <img src={event.image_url} alt={event.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" width={800} height={450} />
          <FavoriteButton eventId={event.id} />
          {soldOut && (
            <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full">Sold Out</span>
          )}
        </div>
        <div className="pt-3 space-y-1">
          <h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">{event.title}</h3>
          <p className="text-sm text-primary font-medium">{format(new Date(event.date), "EEE, MMM d · h:mm a")}</p>
          <p className="text-sm text-muted-foreground line-clamp-1">{event.location}</p>
          <p className="text-sm font-medium pt-0.5">
            {lowestPrice === 0 ? "Free" : `From $${lowestPrice.toFixed(2)}`}
          </p>
          <p className="text-xs text-muted-foreground">{event.organizer}</p>
        </div>
      </div>
    </Link>
  );
};

export default EventbriteCard;
