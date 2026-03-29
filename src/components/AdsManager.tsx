import { useState } from "react";
import type { DbTable } from "@/lib/db-types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Megaphone, Plus, TrendingUp, Eye, MousePointer, DollarSign, Pause, Play, Trash2, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AdsManagerProps {
  eventId: string;
  eventTitle: string;
}

const PLACEMENT_OPTIONS = [
  { value: "homepage", label: "Homepage" },
  { value: "search", label: "Search Results" },
  { value: "category", label: "Category Pages" },
  { value: "related", label: "Related Events" },
];

const AdsManager = ({ eventId, eventTitle }: AdsManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState(`Promote: ${eventTitle}`);
  const [dailyBudget, setDailyBudget] = useState("5");
  const [totalBudget, setTotalBudget] = useState("50");
  const [placements, setPlacements] = useState<string[]>(["homepage", "search", "category", "related"]);

  const { data: ads, isLoading } = useQuery({
    queryKey: ["event-ads", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_ads")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createAd = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("event_ads").insert({
        event_id: eventId,
        user_id: user!.id,
        title,
        daily_budget: Number(dailyBudget),
        total_budget: Number(totalBudget),
        placements,
        status: "active",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-ads", eventId] });
      toast({ title: "Ad campaign created!", description: "Your event is now being promoted." });
      setShowCreate(false);
    },
  });

  const toggleAd = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      const { error } = await supabase.from("event_ads").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["event-ads", eventId] }),
  });

  const deleteAd = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("event_ads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-ads", eventId] });
      toast({ title: "Campaign deleted" });
    },
  });

  const togglePlacement = (p: string) => {
    setPlacements((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Qantid Ads</h3>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-3 w-3 mr-1" /> New Campaign
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div>
              <Label className="text-xs">Campaign Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Daily Budget ($)</Label>
                <Input type="number" value={dailyBudget} onChange={(e) => setDailyBudget(e.target.value)} className="h-8 text-sm" min="1" />
              </div>
              <div>
                <Label className="text-xs">Total Budget ($)</Label>
                <Input type="number" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} className="h-8 text-sm" min="5" />
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Ad Placements</Label>
              <div className="flex flex-wrap gap-2">
                {PLACEMENT_OPTIONS.map((p) => (
                  <Badge
                    key={p.value}
                    variant={placements.includes(p.value) ? "default" : "outline"}
                    className="cursor-pointer text-[10px]"
                    onClick={() => togglePlacement(p.value)}
                  >
                    {p.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => createAd.mutate()} disabled={createAd.isPending || !title || placements.length === 0}>
                {createAd.isPending ? "Creating..." : "Launch Campaign"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && <p className="text-xs text-muted-foreground">Loading campaigns...</p>}

      {ads && ads.length > 0 && (
        <div className="space-y-3">
          {ads.map((ad: DbTable<"event_ads">) => {
            const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : "0";
            return (
              <Card key={ad.id} className="overflow-hidden">
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm">{ad.title}</CardTitle>
                      <Badge variant={ad.status === "active" ? "default" : "secondary"} className="text-[10px]">
                        {ad.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => toggleAd.mutate({ id: ad.id, newStatus: ad.status === "active" ? "paused" : "active" })}
                      >
                        {ad.status === "active" ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteAd.mutate(ad.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Eye className="h-3 w-3" /> Impressions</p>
                      <p className="text-sm font-bold">{ad.impressions.toLocaleString()}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1"><MousePointer className="h-3 w-3" /> Clicks</p>
                      <p className="text-sm font-bold">{ad.clicks.toLocaleString()}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" /> CTR</p>
                      <p className="text-sm font-bold">{ctr}%</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" /> Spent</p>
                      <p className="text-sm font-bold">${Number(ad.spent).toFixed(2)} / ${Number(ad.total_budget).toFixed(0)}</p>
                    </div>
                  </div>
                  {/* Budget progress */}
                  <div className="mt-2">
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${Number(ad.spent) / Number(ad.total_budget) >= 0.9 ? "bg-destructive" : "bg-primary"}`}
                        style={{ width: `${Math.min((Number(ad.spent) / Number(ad.total_budget)) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Budget: ${Number(ad.spent).toFixed(2)} of ${Number(ad.total_budget).toFixed(0)} used</p>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(ad.placements as string[]).map((p) => (
                      <Badge key={p} variant="outline" className="text-[9px]">{p}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {ads && ads.length === 0 && !showCreate && (
        <div className="text-center py-6 border rounded-lg bg-muted/30">
          <Megaphone className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm font-medium">No ad campaigns yet</p>
          <p className="text-xs text-muted-foreground mb-3">Promote your event to reach more attendees. Events with ads get 9x more visibility.</p>
          <Button size="sm" onClick={() => setShowCreate(true)}><Plus className="h-3 w-3 mr-1" /> Create Campaign</Button>
        </div>
      )}
    </div>
  );
};

export default AdsManager;
