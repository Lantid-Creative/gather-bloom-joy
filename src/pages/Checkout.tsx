import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, ArrowLeft, CheckCircle2 } from "lucide-react";
import EventbriteHeader from "@/components/EventbriteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/lib/cart-store";
import { useToast } from "@/hooks/use-toast";

const Checkout = () => {
  const { items, removeItem, total, clearCart } = useCartStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const { toast } = useToast();

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setConfirmed(true);
    clearCart();
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
            Your tickets have been confirmed. A confirmation email has been sent to{" "}
            <span className="font-medium text-foreground">{email}</span>.
          </p>
          <Button variant="hero" size="lg" className="rounded-full" asChild>
            <Link to="/">Browse More Events</Link>
          </Button>
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
          <Button variant="hero" asChild className="rounded-full">
            <Link to="/">Browse Events</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <EventbriteHeader />
      <div className="container max-w-2xl py-10">
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-6">
          <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
        </Button>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="space-y-3 mb-8">
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

        <div className="flex justify-between items-center p-4 rounded-xl bg-surface mb-8">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-bold text-primary">${total()}</span>
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
          <Button variant="hero" size="lg" type="submit" className="w-full rounded-full mt-4">
            Complete Purchase — ${total()}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
