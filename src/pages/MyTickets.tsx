import { Link, useNavigate } from "react-router-dom";
import { Ticket, Calendar, MapPin } from "lucide-react";
import EventbriteHeader from "@/components/EventbriteHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const MyTickets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: orderItems } = useQuery({
    queryKey: ["my-order-items", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <EventbriteHeader />
        <div className="container max-w-lg py-20 text-center space-y-4">
          <h1 className="text-2xl font-bold">Sign in to view your tickets</h1>
          <p className="text-muted-foreground">Your purchased tickets will appear here.</p>
          <Button variant="hero" className="rounded-full" onClick={() => navigate("/auth")}>
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <EventbriteHeader />
      <div className="container max-w-3xl py-10">
        <h1 className="text-3xl font-bold mb-8">My Tickets</h1>

        {isLoading ? (
          <p className="text-muted-foreground">Loading your tickets...</p>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <Ticket className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">No tickets yet</h2>
            <p className="text-muted-foreground">When you purchase tickets, they'll show up here.</p>
            <Button variant="hero" className="rounded-full" asChild>
              <Link to="/">Browse Events</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const items = orderItems?.filter((i) => i.order_id === order.id) ?? [];
              return (
                <div key={order.id} className="border rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 bg-surface text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">Order #{order.id.slice(0, 8).toUpperCase()}</span>
                      <span className="text-muted-foreground">
                        {format(new Date(order.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                    <span className="font-bold text-primary">${order.total}</span>
                  </div>
                  <div className="divide-y">
                    {items.map((item) => (
                      <Link
                        key={item.id}
                        to={`/event/${item.event_id}`}
                        className="flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <p className="font-semibold">{item.event_title}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.ticket_name} × {item.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-medium">${item.ticket_price * item.quantity}</span>
                      </Link>
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
