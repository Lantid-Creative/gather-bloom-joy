import { useState } from "react";
import { Tag, Plus, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface PromoCodeManagerProps {
  events: { id: string; title: string }[];
}

const PromoCodeManager = ({ events }: PromoCodeManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    eventId: "",
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    usageLimit: "",
    expiresAt: "",
  });

  const eventIds = events.map((e) => e.id);

  const { data: promoCodes } = useQuery({
    queryKey: ["promo-codes-manage", eventIds],
    enabled: eventIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("promo_codes")
        .select("*")
        .in("event_id", eventIds)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const handleCreate = async () => {
    if (!form.eventId || !form.code.trim() || !form.discountValue) {
      toast({ title: "Fill in event, code and discount value", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("promo_codes").insert({
      event_id: form.eventId,
      code: form.code.trim().toUpperCase(),
      discount_type: form.discountType,
      discount_value: parseFloat(form.discountValue),
      usage_limit: form.usageLimit ? parseInt(form.usageLimit) : null,
      expires_at: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Failed to create promo code", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Promo code created! 🎉" });
    setForm({ eventId: "", code: "", discountType: "percentage", discountValue: "", usageLimit: "", expiresAt: "" });
    setCreating(false);
    queryClient.invalidateQueries({ queryKey: ["promo-codes-manage"] });
  };

  const handleDelete = async (id: string) => {
    await supabase.from("promo_codes").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["promo-codes-manage"] });
    toast({ title: "Promo code deleted" });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: `Copied "${code}"` });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Tag className="h-5 w-5" /> Promo Codes
        </h2>
        <Button variant="outline" size="sm" className="rounded-full" onClick={() => setCreating(!creating)}>
          <Plus className="h-3.5 w-3.5 mr-1" /> New Code
        </Button>
      </div>

      {creating && (
        <div className="border rounded-xl p-4 mb-4 space-y-3 bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Event</Label>
              <Select value={form.eventId} onValueChange={(v) => setForm({ ...form, eventId: v })}>
                <SelectTrigger><SelectValue placeholder="Select event" /></SelectTrigger>
                <SelectContent>
                  {events.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.title.length > 30 ? e.title.slice(0, 28) + "…" : e.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Code</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="EARLYBIRD" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Discount Type</Label>
              <Select value={form.discountType} onValueChange={(v: "percentage" | "fixed") => setForm({ ...form, discountType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Value</Label>
              <Input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} placeholder={form.discountType === "percentage" ? "20" : "10.00"} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Usage Limit (optional)</Label>
              <Input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} placeholder="100" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Expires (optional)</Label>
              <Input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="hero" size="sm" className="rounded-full" onClick={handleCreate} disabled={loading}>
              {loading ? "Creating…" : "Create Code"}
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setCreating(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {!promoCodes || promoCodes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No promo codes yet. Create one to offer discounts.</p>
      ) : (
        <div className="space-y-2">
          {promoCodes.map((pc) => {
            const event = events.find((e) => e.id === pc.event_id);
            const isExpired = pc.expires_at && new Date(pc.expires_at) < new Date();
            const isMaxed = pc.usage_limit !== null && pc.used_count >= pc.usage_limit;
            return (
              <div key={pc.id} className="flex items-center justify-between border rounded-lg px-4 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <button onClick={() => copyCode(pc.code)} className="font-mono font-bold text-primary hover:underline flex items-center gap-1">
                    {pc.code} <Copy className="h-3 w-3" />
                  </button>
                  <span className="text-muted-foreground">
                    {pc.discount_type === "percentage" ? `${pc.discount_value}%` : `$${pc.discount_value}`} off
                  </span>
                  {event && <span className="text-muted-foreground">· {event.title.length > 20 ? event.title.slice(0, 18) + "…" : event.title}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {pc.used_count}{pc.usage_limit ? `/${pc.usage_limit}` : ""} used
                  </span>
                  {isExpired && <span className="text-xs text-destructive">Expired</span>}
                  {isMaxed && !isExpired && <span className="text-xs text-destructive">Maxed</span>}
                  {pc.expires_at && !isExpired && (
                    <span className="text-xs text-muted-foreground">
                      expires {format(new Date(pc.expires_at), "MMM d")}
                    </span>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(pc.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PromoCodeManager;
