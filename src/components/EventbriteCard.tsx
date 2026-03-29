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
  const capacityPercent = event.capacity > 0 ? Math.min((event.tickets_sold / event.capacity) * 100, 100) : 0;

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
          <div className="pt-1">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
              <span>{event.tickets_sold} sold</span>
              <span>{event.capacity - event.tickets_sold > 0 ? `${event.capacity - event.tickets_sold} left` : "Sold out"}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  capacityPercent >= 90 ? "bg-destructive" : capacityPercent >= 60 ? "bg-amber-500" : "bg-primary"
                }`}
                style={{ width: `${capacityPercent}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{event.organizer}</p>
        </div>
      </div>
    </Link>
  );
};

export default EventbriteCard;
