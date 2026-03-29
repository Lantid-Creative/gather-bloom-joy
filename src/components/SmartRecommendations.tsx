import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import QantidCard from "@/components/QantidCard";
import type { Event } from "@/lib/types";

interface Props {
  allEvents: Event[];
}

const SmartRecommendations = ({ allEvents }: Props) => {
  const { user } = useAuth();
  const [recommended, setRecommended] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [reasoning, setReasoning] = useState("");

  useEffect(() => {
    if (!user || allEvents.length < 4) return;

    const fetchRecs = async () => {
      setLoading(true);
      try {
        // Get user's purchase/favorite history
        const [{ data: favorites }, { data: orderItems }] = await Promise.all([
          supabase.from("event_favorites").select("event_id").eq("user_id", user.id).limit(20),
          supabase.from("order_items").select("event_id, event_title").limit(20),
        ]);

        const historyEventIds = [
          ...(favorites?.map((f) => f.event_id) || []),
          ...(orderItems?.map((o) => o.event_id) || []),
        ];

        if (historyEventIds.length === 0) return; // No history, skip

        const historyEvents = allEvents
          .filter((e) => historyEventIds.includes(e.id))
          .map((e) => ({ title: e.title, category: e.category, location: e.location, tags: e.tags }));

        const availableEvents = allEvents.filter((e) => !historyEventIds.includes(e.id));
        if (availableEvents.length === 0) return;

        const { data, error } = await supabase.functions.invoke("ai-event-tools", {
          body: {
            action: "recommend_events",
            userHistory: historyEvents,
            availableEvents: availableEvents.slice(0, 30),
          },
        });

        if (error || data?.error) return;

        const recs = (data.event_ids || [])
          .map((id: string) => allEvents.find((e) => e.id === id))
          .filter(Boolean) as Event[];

        setRecommended(recs);
        setReasoning(data.reasoning || "");
      } catch {
        // Silently fail — recommendations are optional
      } finally {
        setLoading(false);
      }
    };

    fetchRecs();
  }, [user, allEvents]);

  if (!user || recommended.length === 0) return null;

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">Recommended for You</h2>
      </div>
      {reasoning && (
        <p className="text-xs text-muted-foreground mb-6 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-primary" /> {reasoning}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommended.slice(0, 4).map((event) => (
          <QantidCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default SmartRecommendations;
