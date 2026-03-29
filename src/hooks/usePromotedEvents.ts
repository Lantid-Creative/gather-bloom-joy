import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PromotedEvent {
  ad_id: string;
  event_id: string;
  placements: string[];
}

export const usePromotedEvents = (placement: string) => {
  return useQuery({
    queryKey: ["promoted-events", placement],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_ads")
        .select("id, event_id, placements")
        .eq("status", "active")
        .contains("placements", [placement]);
      if (error) throw error;

      // Record impressions for all returned ads
      for (const ad of data ?? []) {
        supabase.rpc("record_ad_impression", { p_ad_id: ad.id }).then();
      }

      return (data ?? []).map((a) => ({
        ad_id: a.id,
        event_id: a.event_id,
        placements: a.placements as string[],
      }));
    },
    staleTime: 60_000,
  });
};

export const recordAdClick = async (adId: string) => {
  await supabase.rpc("record_ad_click", { p_ad_id: adId });
};
