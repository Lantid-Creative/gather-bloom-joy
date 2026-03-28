import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Event } from "@/lib/types";

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async (): Promise<Event[]> => {
      const { data: events, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .order("date", { ascending: true });

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

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ["event", id],
    enabled: !!id,
    queryFn: async (): Promise<Event | null> => {
      if (!id) return null;

      const { data: e, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!e) return null;

      const [{ data: tickets }, { data: schedules }] = await Promise.all([
        supabase.from("ticket_types").select("*").eq("event_id", e.id),
        supabase.from("schedule_items").select("*").eq("event_id", e.id).order("sort_order"),
      ]);

      return {
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
        ticket_types: (tickets ?? []).map((t) => ({
          id: t.id,
          name: t.name,
          price: Number(t.price),
          description: t.description,
          available: t.available,
          max_per_order: t.max_per_order,
        })),
        schedule: (schedules ?? []).map((s) => ({
          time: s.time,
          title: s.title,
          description: s.description ?? undefined,
          speaker: s.speaker ?? undefined,
        })),
      };
    },
  });
}
