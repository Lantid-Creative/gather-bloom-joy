import { useState } from "react";
import type { DbTable } from "@/lib/db-types";
import { Users, Link as LinkIcon, Copy, Check, Loader2, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Props {
  eventId: string;
  eventTitle: string;
}

const ReferralProgramManager = ({ eventId, eventTitle }: Props) => {
  const [saving, setSaving] = useState(false);
  const [commissionType, setCommissionType] = useState("percentage");
  const [commissionValue, setCommissionValue] = useState(10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: program } = useQuery({
    queryKey: ["referral-program", eventId],
    queryFn: async () => {
      const { data } = await supabase
        .from("referral_programs")
        .select("*")
        .eq("event_id", eventId)
        .maybeSingle();
      return data;
    },
  });

  const { data: referralLinks } = useQuery({
    queryKey: ["referral-links", program?.id],
    enabled: !!program,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referral_links")
        .select("*")
        .eq("program_id", program!.id)
        .order("total_earned", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createProgram = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("referral_programs").insert({
        event_id: eventId,
        commission_type: commissionType,
        commission_value: commissionValue,
      });
      if (error) throw error;
      toast({ title: "Referral program created! 🎉" });
      queryClient.invalidateQueries({ queryKey: ["referral-program", eventId] });
    } catch (err: unknown) {
      toast({ title: "Failed to create program", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateProgram = async (updates: Partial<Tables<"referral_programs">>) => {
    if (!program) return;
    await supabase.from("referral_programs").update(updates).eq("id", program.id);
    queryClient.invalidateQueries({ queryKey: ["referral-program", eventId] });
  };

  const totalClicks = referralLinks?.reduce((s, l) => s + l.clicks, 0) ?? 0;
  const totalConversions = referralLinks?.reduce((s, l) => s + l.conversions, 0) ?? 0;
  const totalEarned = referralLinks?.reduce((s, l) => s + Number(l.total_earned), 0) ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Referral / Affiliate Program</h3>
      </div>

      {!program ? (
        <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
          <p className="text-sm text-muted-foreground">Enable a referral program so anyone can earn commissions by promoting your event.</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Commission Type</Label>
              <Select value={commissionType} onValueChange={setCommissionType}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Commission Value</Label>
              <Input type="number" value={commissionValue} onChange={(e) => setCommissionValue(parseFloat(e.target.value) || 0)} className="h-8 text-sm" />
            </div>
          </div>
          <Button size="sm" className="rounded-full text-xs" onClick={createProgram} disabled={saving}>
            {saving ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Creating...</> : "Enable Referral Program"}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {program.commission_value}{program.commission_type === "percentage" ? "%" : "$"} commission
              </Badge>
              <Switch checked={program.is_active} onCheckedChange={(v) => updateProgram({ is_active: v })} />
              <span className="text-xs text-muted-foreground">{program.is_active ? "Active" : "Paused"}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border p-2.5 text-center">
              <LinkIcon className="h-3 w-3 mx-auto text-muted-foreground mb-1" />
              <p className="text-lg font-bold">{totalClicks}</p>
              <p className="text-[10px] text-muted-foreground">Clicks</p>
            </div>
            <div className="rounded-lg border p-2.5 text-center">
              <TrendingUp className="h-3 w-3 mx-auto text-muted-foreground mb-1" />
              <p className="text-lg font-bold">{totalConversions}</p>
              <p className="text-[10px] text-muted-foreground">Conversions</p>
            </div>
            <div className="rounded-lg border p-2.5 text-center">
              <DollarSign className="h-3 w-3 mx-auto text-muted-foreground mb-1" />
              <p className="text-lg font-bold">${totalEarned.toFixed(0)}</p>
              <p className="text-[10px] text-muted-foreground">Earned</p>
            </div>
          </div>

          {/* Affiliate leaderboard */}
          {referralLinks && referralLinks.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">Top Affiliates</h4>
              <div className="space-y-1.5">
                {referralLinks.slice(0, 5).map((link, i) => (
                  <div key={link.id} className="flex items-center justify-between rounded-lg border p-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                      <div>
                        <p className="text-xs font-medium">{link.code}</p>
                        <p className="text-[10px] text-muted-foreground">{link.clicks} clicks · {link.conversions} sales</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">${Number(link.total_earned).toFixed(0)}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {referralLinks && referralLinks.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-3">
              No affiliates yet. Share the referral signup link to get started.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ReferralProgramManager;
