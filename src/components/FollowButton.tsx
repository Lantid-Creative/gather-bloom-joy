import { useState } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const FollowButton = ({ organizerId, organizerName }: { organizerId: string; organizerName: string }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { data: isFollowing } = useQuery({
    queryKey: ["following", organizerId, user?.id],
    enabled: !!user && !!organizerId,
    queryFn: async () => {
      const { data } = await supabase
        .from("organizer_followers")
        .select("id")
        .eq("organizer_id", organizerId)
        .eq("follower_id", user!.id)
        .maybeSingle();
      return !!data;
    },
  });

  const { data: followerCount } = useQuery({
    queryKey: ["follower-count", organizerId],
    enabled: !!organizerId,
    queryFn: async () => {
      const { count } = await supabase
        .from("organizer_followers")
        .select("id", { count: "exact", head: true })
        .eq("organizer_id", organizerId);
      return count ?? 0;
    },
  });

  const toggle = async () => {
    if (!user) {
      toast({ title: "Sign in to follow organizers", variant: "destructive" });
      return;
    }
    setLoading(true);
    if (isFollowing) {
      await supabase.from("organizer_followers").delete().eq("organizer_id", organizerId).eq("follower_id", user.id);
      toast({ title: `Unfollowed ${organizerName}` });
    } else {
      await supabase.from("organizer_followers").insert({ organizer_id: organizerId, follower_id: user.id });
      toast({ title: `Following ${organizerName}! 🎉` });
    }
    queryClient.invalidateQueries({ queryKey: ["following", organizerId] });
    queryClient.invalidateQueries({ queryKey: ["follower-count", organizerId] });
    setLoading(false);
  };

  return (
    <Button
      variant={isFollowing ? "secondary" : "outline"}
      size="sm"
      className="rounded-full text-xs"
      onClick={toggle}
      disabled={loading}
    >
      {isFollowing ? <UserCheck className="h-3.5 w-3.5 mr-1" /> : <UserPlus className="h-3.5 w-3.5 mr-1" />}
      {isFollowing ? "Following" : "Follow"}
      {followerCount ? ` · ${followerCount}` : ""}
    </Button>
  );
};

export default FollowButton;
