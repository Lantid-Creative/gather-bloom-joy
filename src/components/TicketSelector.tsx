import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TicketType } from "@/lib/types";
import { useCartStore } from "@/lib/cart-store";
import { useToast } from "@/hooks/use-toast";

interface TicketSelectorProps {
  ticket: TicketType;
  eventId: string;
  eventTitle: string;
}

const TicketSelector = ({ ticket, eventId, eventTitle }: TicketSelectorProps) => {
  const [qty, setQty] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const { toast } = useToast();
  const soldOut = ticket.available <= 0;

  const handleAdd = () => {
    if (qty === 0) return;
    addItem({
      ticketType: ticket,
      quantity: qty,
      eventId,
      eventTitle,
    });
    toast({
      title: "Added to cart",
      description: `${qty}x ${ticket.name} for ${eventTitle}`,
    });
    setQty(0);
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border bg-card ${soldOut ? "opacity-60" : ""}`}>
      <div className="space-y-1 flex-1">
        <div className="flex items-center gap-3">
          <h4 className="font-semibold">{ticket.name}</h4>
          <span className="text-lg font-bold text-primary">${ticket.price}</span>
          {soldOut && <Badge variant="destructive" className="text-xs">Sold Out</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">{ticket.description}</p>
        {!soldOut && <p className="text-xs text-muted-foreground">{ticket.available} remaining</p>}
      </div>
      {!soldOut && (
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setQty(Math.max(0, qty - 1))}
            disabled={qty === 0}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center font-semibold">{qty}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setQty(Math.min(ticket.max_per_order, qty + 1))}
            disabled={qty >= ticket.max_per_order || qty >= ticket.available}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="hero"
            size="sm"
            onClick={handleAdd}
            disabled={qty === 0}
            className="ml-2"
          >
            Add
          </Button>
        </div>
      )}
    </div>
  );
};

export default TicketSelector;
