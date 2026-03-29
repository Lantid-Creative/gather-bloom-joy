import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Ticket, Calendar, MapPin, RotateCcw, Download, Bell } from "lucide-react";
import QantidHeader from "@/components/QantidHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { generateTicketPDF } from "@/lib/generate-ticket-pdf";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";

const MyTickets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [refundReason, setRefundReason] = useState("");
  const [refundingOrderId, setRefundingOrderId] = useState<string | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders", user?.id], enabled: !!user,
    queryFn: async () => { const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false }); if (error) throw error; return data; },
  });

  const { data: orderItems } = useQuery({
    queryKey: ["my-order-items", user?.id], enabled: !!user,
    queryFn: async () => { const { data, error } = await supabase.from("order_items").select("*"); if (error) throw error; return data; },
  });

  const { data: refundRequests } = useQuery({
    queryKey: ["my-refunds", user?.id], enabled: !!user,
    queryFn: async () => { const { data } = await supabase.from("refund_requests").select("*"); return data ?? []; },
  });

  const submitRefund = async (orderId: string) => {
    if (!user || !refundReason.trim()) return;
    const { error } = await supabase.from("refund_requests").insert({
      order_id: orderId, user_id: user.id, reason: refundReason.trim(),
    });
    if (error) {
      toast({ title: "Refund already requested", variant: "destructive" });
    } else {
      toast({ title: "Refund request submitted", description: "The organizer will review your request." });
    }
    setRefundReason("");
    setRefundingOrderId(null);
  };

  const handleDownloadTickets = async (orderId: string) => {
    if (!user) return;
    const { data: oi } = await supabase.from("order_items").select("*").eq("order_id", orderId);
    if (!oi?.length) return;
    const evtIds = [...new Set(oi.map((i) => i.event_id))];
    const { data: evts } = await supabase.from("events").select("id, date, location").in("id", evtIds);
    const { data: ord } = await supabase.from("orders").select("customer_name").eq("id", orderId).single();

    const tickets = oi.map((item) => {
      const evt = evts?.find((e) => e.id === item.event_id);
      return {
        orderId, orderItemId: item.id, eventTitle: item.event_title,
        ticketName: item.ticket_name, quantity: item.quantity,
        customerName: ord?.customer_name ?? "Attendee",
        eventDate: evt ? format(new Date(evt.date), "EEE, MMM d, yyyy · h:mm a") : "",
        eventLocation: evt?.location ?? "",
      };
    });
    await generateTicketPDF(tickets);
  };

  const handleSetReminder = async (eventId: string, eventTitle: string, eventDate: string) => {
    if (!user) return;
    await supabase.from("notifications").insert({
      user_id: user.id,
      title: `Reminder: ${eventTitle}`,
      message: `Don't forget! "${eventTitle}" is on ${format(new Date(eventDate), "EEE, MMM d")}. Get ready!`,
      type: "reminder",
      link: `/event/${eventId}`,
    });
    toast({ title: "Reminder set! 🔔", description: "You'll see it in your notifications." });
  };

  if (!user) return (
    <div className="min-h-screen bg-background"><QantidHeader />
      <div className="container max-w-lg py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold">Sign in to view your tickets</h1>
        <Button variant="hero" className="rounded-full" onClick={() => navigate("/auth")}>Sign in</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <QantidHeader />
      <div className="container max-w-3xl py-10">
        <h1 className="text-3xl font-bold mb-8">My Tickets</h1>
        {isLoading ? <p className="text-muted-foreground">Loading...</p> : !orders || orders.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <Ticket className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">No tickets yet</h2>
            <Button variant="hero" className="rounded-full" asChild><Link to="/">Browse Events</Link></Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const items = orderItems?.filter((i) => i.order_id === order.id) ?? [];
              const hasRefund = refundRequests?.some((r: { order_id: string }) => r.order_id === order.id);
              return (
                <div key={order.id} className="border rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 bg-surface text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">Order #{order.id.slice(0, 8).toUpperCase()}</span>
                      <span className="text-muted-foreground">{format(new Date(order.created_at), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary">${order.total}</span>
                      {hasRefund ? (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Refund requested</span>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-xs h-7"><RotateCcw className="h-3 w-3 mr-1" /> Refund</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Request Refund</DialogTitle></DialogHeader>
                            <Textarea placeholder="Why do you need a refund?" value={refundReason} onChange={(e) => setRefundReason(e.target.value)} />
                            <DialogFooter>
                              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                              <Button variant="hero" onClick={() => submitRefund(order.id)} disabled={!refundReason.trim()}>Submit Request</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                      <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => handleDownloadTickets(order.id)}>
                        <Download className="h-3 w-3 mr-1" /> PDF
                      </Button>
                    </div>
                  </div>
                  <div className="divide-y">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors">
                        <Link to={`/event/${item.event_id}`} className="space-y-1 flex-1">
                          <p className="font-semibold">{item.event_title}</p>
                          <p className="text-sm text-muted-foreground">{item.ticket_name} × {item.quantity}</p>
                        </Link>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">${item.ticket_price * item.quantity}</span>
                          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => handleSetReminder(item.event_id, item.event_title, item.created_at)}>
                            <Bell className="h-3 w-3 mr-1" /> Remind
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;
