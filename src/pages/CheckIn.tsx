import { useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, Search, ScanLine } from "lucide-react";
import EventbriteHeader from "@/components/EventbriteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import QrScanner from "@/components/QrScanner";

const CheckIn = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  const { data: event } = useQuery({
    queryKey: ["event-checkin", eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const { data } = await supabase.from("events").select("*").eq("id", eventId!).single();
      return data;
    },
  });

  const { data: orderItems } = useQuery({
    queryKey: ["checkin-items", eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const { data: items } = await supabase.from("order_items").select("*").eq("event_id", eventId!);
      if (!items?.length) return [];
      const orderIds = [...new Set(items.map((i) => i.order_id))];
      const { data: orders } = await supabase.from("orders").select("*").in("id", orderIds);
      const { data: checkins } = await supabase.from("attendee_check_ins").select("*").in("order_item_id", items.map((i) => i.id));
      return items.map((item) => {
        const order = orders?.find((o) => o.id === item.order_id);
        const checkin = checkins?.find((c) => c.order_item_id === item.id);
        return { ...item, customer_name: order?.customer_name ?? "", customer_email: order?.customer_email ?? "", checked_in: !!checkin, checkin_time: checkin?.checked_in_at };
      });
    },
  });

  const handleCheckIn = async (orderItemId: string) => {
    if (!user) return;
    const { error } = await supabase.from("attendee_check_ins").insert({
      order_item_id: orderItemId,
      checked_in_by: user.id,
    });
    if (error) {
      toast({ title: "Already checked in", variant: "destructive" });
      return false;
    } else {
      toast({ title: "Checked in! ✅" });
      queryClient.invalidateQueries({ queryKey: ["checkin-items", eventId] });
      return true;
    }
  };

  const handleQrScan = async (rawData: string) => {
    // Prevent processing same scan twice in a row
    if (rawData === lastScanned) return;
    setLastScanned(rawData);

    try {
      const parsed = JSON.parse(rawData);
      const { orderItemId } = parsed;

      if (!orderItemId) {
        toast({ title: "Invalid QR code", description: "This doesn't look like an Afritickets ticket.", variant: "destructive" });
        return;
      }

      // Find the attendee in the list
      const attendee = orderItems?.find((i) => i.id === orderItemId);

      if (!attendee) {
        toast({ title: "Ticket not found", description: "This ticket doesn't belong to this event.", variant: "destructive" });
        return;
      }

      if (attendee.checked_in) {
        toast({ title: "Already checked in", description: `${attendee.customer_name} was already checked in.`, variant: "destructive" });
        return;
      }

      const success = await handleCheckIn(orderItemId);
      if (success) {
        // Vibration feedback (if supported)
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        // Audio beep feedback
        try {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 880;
          osc.type = "sine";
          gain.gain.value = 0.3;
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        } catch {}
      }
      // Highlight the scanned attendee
      setSearch(attendee.customer_name);
    } catch {
      toast({ title: "Invalid QR code", description: "Could not read ticket data from this code.", variant: "destructive" });
    }
  };

  const filtered = orderItems?.filter((i) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return i.customer_name.toLowerCase().includes(q) || i.customer_email.toLowerCase().includes(q) || i.ticket_name.toLowerCase().includes(q);
  }) ?? [];

  const checkedInCount = orderItems?.filter((i) => i.checked_in).length ?? 0;
  const totalCount = orderItems?.length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <EventbriteHeader />
      <div className="container max-w-3xl py-10">
        <h1 className="text-3xl font-bold mb-2">Check-In</h1>
        <p className="text-muted-foreground mb-6">{event?.title ?? "Event"}</p>

        <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-surface">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{checkedInCount}</p>
            <p className="text-xs text-muted-foreground">Checked in</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{totalCount}</p>
            <p className="text-xs text-muted-foreground">Total attendees</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0}%</p>
            <p className="text-xs text-muted-foreground">Attendance</p>
          </div>
        </div>

        {/* QR Scanner Section */}
        <div className="mb-6 p-4 rounded-xl border border-primary/20 bg-primary/5">
          <QrScanner onScan={handleQrScan} />
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="pl-10" />
        </div>

        <div className="space-y-2">
          {filtered.map((item) => (
            <div key={item.id} className={`flex items-center justify-between p-4 border rounded-xl transition-colors ${
              lastScanned && item.customer_name === search ? "border-primary bg-primary/5" : ""
            }`}>
              <div className="space-y-0.5">
                <p className="font-semibold text-sm">{item.customer_name}</p>
                <p className="text-xs text-muted-foreground">{item.customer_email}</p>
                <p className="text-xs text-muted-foreground">{item.ticket_name} × {item.quantity}</p>
              </div>
              {item.checked_in ? (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4" /> Checked in
                </div>
              ) : (
                <Button size="sm" variant="hero" className="rounded-full" onClick={() => handleCheckIn(item.id)}>
                  Check In
                </Button>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No attendees found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
