import { useState } from "react";
import { Minus, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TicketType } from "@/lib/types";
import { useCartStore } from "@/lib/cart-store";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface TimeSlot {
  id: string;
  label: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked: number;
  is_active: boolean;
}

interface TicketSelectorProps {
  ticket: TicketType;
  eventId: string;
  eventTitle: string;
}

const TicketSelector = ({ ticket, eventId, eventTitle }: TicketSelectorProps) => {
  const [qty, setQty] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const addItem = useCartStore((s) => s.addItem);
  const { toast } = useToast();
  const soldOut = ticket.available <= 0;

  const { data: timeSlots } = useQuery({
    queryKey: ["time-slots-ticket", eventId],
    queryFn: async () => {
      const { data } = await supabase
        .from("event_time_slots" as any)
        .select("*")
        .eq("event_id", eventId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      return (data as any[] ?? []) as TimeSlot[];
    },
  });

  const hasTimeSlots = timeSlots && timeSlots.length > 0;
  const chosenSlot = timeSlots?.find((s) => s.id === selectedSlot);
  const slotFull = chosenSlot ? chosenSlot.booked >= chosenSlot.capacity : false;

  const handleAdd = () => {
    if (qty === 0) return;
    if (hasTimeSlots && !selectedSlot) {
      toast({ title: "Please select a time slot", variant: "destructive" });
      return;
    }
    if (slotFull) {
      toast({ title: "This time slot is full", variant: "destructive" });
      return;
    }

    const slotLabel = chosenSlot
      ? chosenSlot.label || `${chosenSlot.start_time} - ${chosenSlot.end_time}`
      : undefined;

    addItem({
      ticketType: ticket,
      quantity: qty,
      eventId,
      eventTitle,
      timeSlotId: selectedSlot || undefined,
      timeSlotLabel: slotLabel,
    });
    toast({
      title: "Added to cart",
      description: `${qty}x ${ticket.name}${slotLabel ? ` (${slotLabel})` : ""} for ${eventTitle}`,
    });
    setQty(0);
    setSelectedSlot("");
  };

  return (
    <div className={`flex flex-col gap-3 p-4 rounded-xl border bg-card ${soldOut ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold">{ticket.name}</h4>
            <span className="text-lg font-bold text-primary">${ticket.price}</span>
            {soldOut && <Badge variant="destructive" className="text-xs">Sold Out</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{ticket.description}</p>
          {!soldOut && <p className="text-xs text-muted-foreground">{ticket.available} remaining</p>}
        </div>
      </div>

      {!soldOut && hasTimeSlots && (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select value={selectedSlot} onValueChange={setSelectedSlot}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select a time slot" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((slot) => {
                const full = slot.booked >= slot.capacity;
                const remaining = slot.capacity - slot.booked;
                return (
                  <SelectItem key={slot.id} value={slot.id} disabled={full}>
                    {slot.label || `${slot.start_time} - ${slot.end_time}`}
                    {" · "}
                    {full ? "Full" : `${remaining} spots left`}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      {!soldOut && (
        <div className="flex w-full items-center justify-end gap-2">
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
            disabled={qty === 0 || (hasTimeSlots && !selectedSlot) || slotFull}
            className="sm:ml-2 w-full sm:w-auto"
          >
            Add
          </Button>
        </div>
      )}
    </div>
  );
};

export default TicketSelector;
