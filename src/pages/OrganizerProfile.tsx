import { useParams, Link } from "react-router-dom";
import { Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import EventbriteHeader from "@/components/EventbriteHeader";
import EventbriteFooter from "@/components/EventbriteFooter";
import EventbriteCard from "@/components/EventbriteCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import FollowButton from "@/components/FollowButton";
import type { Event } from "@/lib/types";

const OrganizerProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["organizer-profile", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", id!).single();
      return data;
    },
  });

  const { data: events } = useQuery({
    queryKey: ["organizer-events", id],
    enabled: !!id,
    queryFn: async () => {
      const { data: evts } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", id!)
        .eq("status", "published")
        .order("date", { ascending: false });
      if (!evts) return [];

      const eventIds = evts.map((e) => e.id);
      const { data: tickets } = await supabase.from("ticket_types").select("*").in("event_id", eventIds);

      return evts.map((e): Event => ({
        id: e.id,
        title: e.title,
        description: e.description,
        date: e.date,
        end_date: e.end_date ?? undefined,
        time: e.time,
        location: e.location,
        image_url: e.image_url,
        category: e.category,
        organizer: e.organizer,
        capacity: e.capacity,
        tickets_sold: e.tickets_sold,
        is_online: e.is_online,
        tags: e.tags ?? [],
        ticket_types: (tickets ?? []).filter((t) => t.event_id === e.id).map((t) => ({
          id: t.id, name: t.name, price: Number(t.price), description: t.description, available: t.available, max_per_order: t.max_per_order,
        })),
      }));
    },
  });

  const { data: followerCount } = useQuery({
    queryKey: ["follower-count", id],
    enabled: !!id,
    queryFn: async () => {
      const { count } = await supabase.from("organizer_followers").select("id", { count: "exact", head: true }).eq("organizer_id", id!);
      return count ?? 0;
    },
  });

  const totalTicketsSold = events?.reduce((s, e) => s + e.tickets_sold, 0) ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <EventbriteHeader />
      <div className="container max-w-5xl py-10">
        <div className="flex items-center gap-6 mb-10">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-primary">{profile?.full_name?.[0] ?? "?"}</span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{profile?.full_name ?? "Organizer"}</h1>
            {profile?.bio && <p className="text-muted-foreground mt-1">{profile.bio}</p>}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>{followerCount} followers</span>
              <span>{events?.length ?? 0} events</span>
              <span>{totalTicketsSold} tickets sold</span>
            </div>
          </div>
          {id && id !== user?.id && <FollowButton organizerId={id} organizerName={profile?.full_name ?? "Organizer"} />}
        </div>

        <h2 className="text-xl font-bold mb-6">Events</h2>
        {!events || events.length === 0 ? (
          <p className="text-muted-foreground">No published events yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((e) => (
              <EventbriteCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </div>
      <EventbriteFooter />
    </div>
  );
};

export default OrganizerProfile;
