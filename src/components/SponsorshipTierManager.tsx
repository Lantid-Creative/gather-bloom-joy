import { useState } from "react";
import { Plus, Trash2, GripVertical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  eventId: string;
}

const SponsorshipTierManager = ({ eventId }: Props) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tiers, isLoading } = useQuery({
    queryKey: ["sponsorship-tiers", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsorship_tiers")
        .select("*")
        .eq("event_id", eventId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const [newTier, setNewTier] = useState({ name: "", price: "", benefits: "" });

  const addTier = useMutation({
    mutationFn: async () => {
      const benefits = newTier.benefits.split(",").map((b) => b.trim()).filter(Boolean);
      const { error } = await supabase.from("sponsorship_tiers").insert({
        event_id: eventId,
        name: newTier.name,
        price: Number(newTier.price) || 0,
        benefits,
        sort_order: (tiers?.length ?? 0) + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sponsorship-tiers", eventId] });
      setNewTier({ name: "", price: "", benefits: "" });
      toast({ title: "Tier added" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteTier = useMutation({
    mutationFn: async (tierId: string) => {
      const { error } = await supabase.from("sponsorship_tiers").delete().eq("id", tierId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sponsorship-tiers", eventId] });
      toast({ title: "Tier removed" });
    },
  });

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm">Sponsorship Tiers</h3>
      <p className="text-xs text-muted-foreground">Define packages that potential sponsors can purchase for brand visibility at your event.</p>

      {/* Existing tiers */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : tiers && tiers.length > 0 ? (
        <div className="space-y-2">
          {tiers.map((tier) => (
            <div key={tier.id} className="border rounded-lg p-3 flex items-start gap-3">
              <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{tier.name}</p>
                  <p className="text-sm font-bold text-primary">${Number(tier.price).toLocaleString()}</p>
                </div>
                {tier.benefits && tier.benefits.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {tier.benefits.map((b: string, i: number) => (
                      <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded-full">{b}</span>
                    ))}
                  </div>
                )}
                {tier.max_sponsors && (
                  <p className="text-xs text-muted-foreground mt-1">{tier.sponsors_count}/{tier.max_sponsors} spots taken</p>
                )}
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => deleteTier.mutate(tier.id)}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      {/* Add new tier */}
      <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
        <p className="text-sm font-medium">Add a Tier</p>
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Tier name (e.g. Gold)" value={newTier.name} onChange={(e) => setNewTier({ ...newTier, name: e.target.value })} />
          <Input placeholder="Price (USD)" type="number" value={newTier.price} onChange={(e) => setNewTier({ ...newTier, price: e.target.value })} />
        </div>
        <Input placeholder="Benefits (comma-separated): Logo on banner, Social media mentions, VIP booth" value={newTier.benefits} onChange={(e) => setNewTier({ ...newTier, benefits: e.target.value })} />
        <Button size="sm" className="rounded-full" onClick={() => addTier.mutate()} disabled={!newTier.name || addTier.isPending}>
          {addTier.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
          Add Tier
        </Button>
      </div>
    </div>
  );
};

export default SponsorshipTierManager;
