import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Event } from "@/lib/types";
import { useAuth } from "./useAuth";

export function useMyEvents() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-events", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Event[]> => {
      if (!user) return [];

      const { data: events, error } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!events || events.length === 0) return [];

      const eventIds = events.map((e) => e.id);

      const [{ data: tickets }, { data: schedules }] = await Promise.all([
        supabase.from("ticket_types").select("*").in("event_id", eventIds),
        supabase.from("schedule_items").select("*").in("event_id", eventIds).order("sort_order"),
      ]);

      return events.map((e) => ({
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
        ticket_types: (tickets ?? [])
          .filter((t) => t.event_id === e.id)
          .map((t) => ({
            id: t.id,
            name: t.name,
            price: Number(t.price),
            description: t.description,
            available: t.available,
            max_per_order: t.max_per_order,
          })),
        schedule: (schedules ?? [])
          .filter((s) => s.event_id === e.id)
          .map((s) => ({
            time: s.time,
            title: s.title,
            description: s.description ?? undefined,
            speaker: s.speaker ?? undefined,
          })),
      }));
    },
  });
}
