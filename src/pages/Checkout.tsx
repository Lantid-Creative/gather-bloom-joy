import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ArrowLeft, CheckCircle2, Download } from "lucide-react";
import EventbriteHeader from "@/components/EventbriteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/lib/cart-store";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PromoCodeInput from "@/components/PromoCodeInput";
import { generateTicketPDF } from "@/lib/generate-ticket-pdf";
import { format } from "date-fns";

const Checkout = () => {
  const { items, removeItem, total, clearCart } = useCartStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.user_metadata?.full_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [confirmed, setConfirmed] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState<{ type: string; value: number } | null>(null);
  const [purchasedItems, setPurchasedItems] = useState<typeof items>([]);
  const { toast } = useToast();

  const subtotal = total();
  const discountAmount = discount
    ? discount.type === "percentage"
      ? subtotal * (discount.value / 100)
      : Math.min(discount.value, subtotal)
    : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Please sign in to complete your purchase", variant: "destructive" });
      navigate("/auth");
      return;
    }

    setLoading(true);
    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({ user_id: user.id, customer_name: name, customer_email: email, total: finalTotal })
        .select()
        .single();
      if (orderError) throw orderError;

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(items.map((item) => ({
          order_id: order.id, event_id: item.eventId, ticket_type_id: item.ticketType.id,
          event_title: item.eventTitle, ticket_name: item.ticketType.name,
          ticket_price: item.ticketType.price, quantity: item.quantity,
        })));
      if (itemsError) throw itemsError;

      // Fetch created order items for PDF
      const { data: createdItems } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id);

      // Fetch event details for dates/locations
      const eventIds = [...new Set(items.map((i) => i.eventId))];
      const { data: eventDetails } = await supabase
        .from("events")
        .select("id, date, location")
        .in("id", eventIds);

      setPurchasedItems(items.map(i => ({ ...i })));
      setOrderId(order.id);
      setConfirmed(true);
      clearCart();

      // Create notification for the user
      if (user) {
        await supabase.from("notifications").insert({
          user_id: user.id,
          title: "Order confirmed! 🎉",
          message: `Your order #${order.id.slice(0, 8).toUpperCase()} has been confirmed. ${items.length} ticket(s) purchased.`,
          type: "order",
          link: "/my-tickets",
        });
      }

      toast({ title: "Order confirmed! 🎉" });
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast({ title: "Something went wrong", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTickets = async () => {
    if (!orderId) return;
    // Fetch order items with event info
    const { data: oi } = await supabase.from("order_items").select("*").eq("order_id", orderId);
    if (!oi?.length) return;
    const evtIds = [...new Set(oi.map((i) => i.event_id))];
    const { data: evts } = await supabase.from("events").select("id, date, location").in("id", evtIds);

    const tickets = oi.map((item) => {
      const evt = evts?.find((e) => e.id === item.event_id);
      return {
        orderId: orderId,
        orderItemId: item.id,
        eventTitle: item.event_title,
        ticketName: item.ticket_name,
        quantity: item.quantity,
        customerName: name,
        eventDate: evt ? format(new Date(evt.date), "EEE, MMM d, yyyy · h:mm a") : "",
        eventLocation: evt?.location ?? "",
      };
    });
    await generateTicketPDF(tickets);
  };

  if (confirmed) {
    return (
      <div className="min-h-screen bg-background">
        <EventbriteHeader />
        <div className="container max-w-lg py-20 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h1 className="text-3xl font-bold">You're all set!</h1>
          <p className="text-muted-foreground">
            Your tickets have been confirmed. A confirmation will be sent to{" "}
            <span className="font-medium text-foreground">{email}</span>.
          </p>
          {orderId && <p className="text-xs text-muted-foreground">Order ID: {orderId.slice(0, 8).toUpperCase()}</p>}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="hero" size="lg" className="rounded-full" onClick={handleDownloadTickets}>
              <Download className="h-4 w-4 mr-2" /> Download Tickets (PDF)
            </Button>
            <Button variant="outline" size="lg" className="rounded-full" asChild><Link to="/my-tickets">View My Tickets</Link></Button>
            <Button variant="ghost" size="lg" className="rounded-full" asChild><Link to="/">Browse More Events</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <EventbriteHeader />
        <div className="container max-w-lg py-20 text-center space-y-4">
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="text-muted-foreground">Find an event and add tickets to get started.</p>
          <Button variant="hero" asChild className="rounded-full"><Link to="/">Browse Events</Link></Button>
        </div>
      </div>
    );
  }

  const eventIds = [...new Set(items.map((i) => i.eventId))];

  return (
    <div className="min-h-screen bg-background">
      <EventbriteHeader />
      <div className="container max-w-2xl py-10">
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-6">
          <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
        </Button>
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {!user && (
          <div className="mb-6 p-4 rounded-xl border border-primary/30 bg-primary/5 text-sm">
            <Link to="/auth" className="text-primary font-semibold hover:underline">Sign in</Link> to save your tickets to your account.
          </div>
        )}

        <div className="space-y-3 mb-6">
          {items.map((item) => (
            <div key={item.ticketType.id} className="flex items-center justify-between p-4 rounded-xl border">
              <div className="space-y-1">
                <p className="font-semibold">{item.ticketType.name}</p>
                <p className="text-sm text-muted-foreground">{item.eventTitle}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold">${item.ticketType.price * item.quantity}</p>
                  <p className="text-xs text-muted-foreground">{item.quantity} × ${item.ticketType.price}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.ticketType.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Promo Code */}
        <div className="mb-6">
          <PromoCodeInput eventIds={eventIds} onDiscount={setDiscount} />
        </div>

        <div className="p-4 rounded-xl bg-surface mb-8 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {discount && (
            <div className="flex justify-between text-sm text-success">
              <span>Discount ({discount.type === "percentage" ? `${discount.value}%` : `$${discount.value}`})</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold text-primary">${finalTotal.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleCheckout} className="space-y-4">
          <h2 className="text-xl font-bold">Your Details</h2>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required />
          </div>
          <Button variant="hero" size="lg" type="submit" className="w-full rounded-full mt-4" disabled={loading}>
            {loading ? "Processing..." : `Complete Purchase — $${finalTotal.toFixed(2)}`}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
