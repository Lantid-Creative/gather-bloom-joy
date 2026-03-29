import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import QantidHeader from "@/components/QantidHeader";
import QantidFooter from "@/components/QantidFooter";
import QantidCard from "@/components/QantidCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Event } from "@/lib/types";

const SavedEvents = () => {
  const { user } = useAuth();

  const { data: events, isLoading } = useQuery({
    queryKey: ["favorites", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: favs } = await supabase
        .from("event_favorites")
        .select("event_id")
        .eq("user_id", user!.id);
      if (!favs?.length) return [];

      const eventIds = favs.map((f) => f.event_id);
      const { data: evts } = await supabase.from("events").select("*").in("id", eventIds);
      if (!evts) return [];

      const { data: tickets } = await supabase.from("ticket_types").select("*").in("event_id", eventIds);

      return evts.map((e): Event => ({
        id: e.id, title: e.title, description: e.description, date: e.date,
        end_date: e.end_date ?? undefined, time: e.time, location: e.location,
        image_url: e.image_url, category: e.category, organizer: e.organizer,
        capacity: e.capacity, tickets_sold: e.tickets_sold, is_online: e.is_online,
        tags: e.tags ?? [],
        ticket_types: (tickets ?? []).filter((t) => t.event_id === e.id).map((t) => ({
          id: t.id, name: t.name, price: Number(t.price), description: t.description,
          available: t.available, max_per_order: t.max_per_order,
        })),
      }));
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <QantidHeader />
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-8">Saved Events</h1>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : !events || events.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">No saved events</h2>
            <p className="text-muted-foreground">Save events you're interested in and find them here.</p>
            <Button variant="hero" className="rounded-full" asChild>
              <Link to="/">Browse Events</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.map((e) => (
              <QantidCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </div>
      <QantidFooter />
    </div>
  );
};

export default SavedEvents;
