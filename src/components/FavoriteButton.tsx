import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const FavoriteButton = ({ eventId }: { eventId: string }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: isFavorited } = useQuery({
    queryKey: ["favorite", eventId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("event_favorites")
        .select("id")
        .eq("event_id", eventId)
        .eq("user_id", user!.id)
        .maybeSingle();
      return !!data;
    },
  });

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast({ title: "Sign in to save events", variant: "destructive" });
      return;
    }
    if (isFavorited) {
      await supabase.from("event_favorites").delete().eq("event_id", eventId).eq("user_id", user.id);
    } else {
      await supabase.from("event_favorites").insert({ event_id: eventId, user_id: user.id });
    }
    queryClient.invalidateQueries({ queryKey: ["favorite", eventId] });
    queryClient.invalidateQueries({ queryKey: ["favorites"] });
    toast({ title: isFavorited ? "Removed from saved" : "Event saved! ❤️" });
  };

  return (
    <button
      onClick={toggle}
      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors z-10"
    >
      <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : "text-foreground"}`} />
    </button>
  );
};

export default FavoriteButton;
