import { useState } from "react";
import type { DbTable } from "@/lib/db-types";
import { Sparkles, Users, Star, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

interface Props {
  eventId: string;
  eventTitle: string;
  eventCategory: string;
  eventLocation: string;
  eventTags: string[];
}

interface Match {
  influencer_id: string;
  match_score: number;
  reason: string;
}

const AiInfluencerMatcher = ({ eventId, eventTitle, eventCategory, eventLocation, eventTags }: Props) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { data: influencers } = useQuery({
    queryKey: ["influencers-for-matching"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("influencer_profiles")
        .select("id, display_name, avatar_url, categories, region, city, country, instagram_followers, tiktok_followers, twitter_followers, youtube_subscribers, avg_rating, total_jobs")
        .eq("is_available", true)
        .limit(30);
      if (error) throw error;
      return data;
    },
  });

  const findMatches = async () => {
    if (!influencers || influencers.length === 0) {
      toast({ title: "No influencers available to match", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-event-tools", {
        body: {
          action: "match_influencers",
          eventTitle,
          eventCategory,
          eventLocation,
          eventTags,
          influencers,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMatches(data.matches || []);
      if (data.matches?.length > 0) {
        toast({ title: `🎯 Found ${data.matches.length} influencer matches!` });
      }
    } catch (e: unknown) {
      toast({ title: (e instanceof Error ? e.message : "Unknown error") || "Failed to match influencers", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getInfluencer = (id: string) => influencers?.find((i) => i.id === id);

  const totalFollowers = (inf: Tables<"influencer_profiles">) =>
    (inf.instagram_followers || 0) + (inf.tiktok_followers || 0) + (inf.twitter_followers || 0) + (inf.youtube_subscribers || 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <Users className="h-4 w-4 text-primary" /> AI Influencer Matching
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={findMatches}
          disabled={loading || !influencers?.length}
          className="rounded-full text-xs gap-1"
        >
          {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          {matches.length > 0 ? "Refresh" : "Find Matches"}
        </Button>
      </div>

      {matches.length > 0 && (
        <div className="space-y-2">
          {matches.map((match) => {
            const inf = getInfluencer(match.influencer_id);
            if (!inf) return null;
            return (
              <div key={match.influencer_id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {inf.avatar_url ? (
                    <img src={inf.avatar_url} alt={inf.display_name} className="h-full w-full object-cover" />
                  ) : (
                    <Users className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link to={`/influencer/${inf.id}`} className="text-sm font-medium hover:text-primary truncate">
                      {inf.display_name}
                    </Link>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                      {match.match_score}%
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{match.reason}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Users className="h-2.5 w-2.5" />{totalFollowers(inf).toLocaleString()}</span>
                    <span className="flex items-center gap-0.5"><Star className="h-2.5 w-2.5" />{inf.avg_rating}</span>
                    <span>{inf.city}, {inf.country}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-full text-xs shrink-0" asChild>
                  <Link to={`/hire/${inf.id}`}>Hire</Link>
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {!loading && matches.length === 0 && influencers && influencers.length > 0 && (
        <p className="text-xs text-muted-foreground">Click "Find Matches" to discover the best influencers for this event.</p>
      )}
    </div>
  );
};

export default AiInfluencerMatcher;
