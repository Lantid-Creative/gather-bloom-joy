import { Link } from "react-router-dom";
import type { Event } from "@/lib/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Megaphone } from "lucide-react";
import FavoriteButton from "@/components/FavoriteButton";
import { recordAdClick } from "@/hooks/usePromotedEvents";

interface PromotedEventCardProps {
  event: Event;
  adId: string;
}

const PromotedEventCard = ({ event, adId }: PromotedEventCardProps) => {
  const lowestPrice = event.ticket_types.length > 0 ? Math.min(...event.ticket_types.map((t) => t.price)) : 0;

  const handleClick = () => {
    recordAdClick(adId);
  };

  return (
    <Link to={`/event/${event.id}`} className="group block" onClick={handleClick}>
      <div className="overflow-hidden rounded-lg transition-all duration-200 hover:shadow-md ring-1 ring-primary/20">
        <div className="relative aspect-[16/9] overflow-hidden bg-muted rounded-t-lg">
          <img src={event.image_url} alt={event.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" width={800} height={450} />
          <FavoriteButton eventId={event.id} />
          <div className="absolute top-2 left-2">
            <Badge className="bg-primary text-primary-foreground text-[10px] font-bold border-0">
              <Megaphone className="h-3 w-3 mr-0.5" /> Promoted
            </Badge>
          </div>
        </div>
        <div className="pt-3 pb-1 px-1 space-y-1">
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

export default PromotedEventCard;
