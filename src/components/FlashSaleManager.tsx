import { useState } from "react";
import { Zap, Plus, Trash2, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Props {
  eventId: string;
  ticketTypes: { id: string; name: string; price: number }[];
}

const FlashSaleManager = ({ eventId, ticketTypes }: Props) => {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    discount_type: "percentage",
    discount_value: 10,
    starts_at: "",
    ends_at: "",
    max_uses: "",
    applies_to_ticket_ids: [] as string[],
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sales } = useQuery({
    queryKey: ["flash-sales", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flash_sales")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleCreate = async () => {
    if (!form.name || !form.starts_at || !form.ends_at) {
      toast({ title: "Fill in all required fields", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("flash_sales").insert({
        event_id: eventId,
        name: form.name,
        discount_type: form.discount_type,
        discount_value: form.discount_value,
        starts_at: new Date(form.starts_at).toISOString(),
        ends_at: new Date(form.ends_at).toISOString(),
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        applies_to_ticket_ids: form.applies_to_ticket_ids,
      });
      if (error) throw error;
      toast({ title: "Flash sale created! ⚡" });
      setShowForm(false);
      setForm({ name: "", discount_type: "percentage", discount_value: 10, starts_at: "", ends_at: "", max_uses: "", applies_to_ticket_ids: [] });
      queryClient.invalidateQueries({ queryKey: ["flash-sales", eventId] });
    } catch (err: unknown) {
      toast({ title: "Failed to create sale", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await supabase.from("flash_sales").update({ is_active: !isActive }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["flash-sales", eventId] });
  };

  const deleteSale = async (id: string) => {
    await supabase.from("flash_sales").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["flash-sales", eventId] });
    toast({ title: "Flash sale deleted" });
  };

  const getSaleStatus = (sale: Tables<"flash_sales">) => {
    const now = new Date();
    const start = new Date(sale.starts_at);
    const end = new Date(sale.ends_at);
    if (!sale.is_active) return { label: "Inactive", color: "bg-muted text-muted-foreground" };
    if (now < start) return { label: "Upcoming", color: "bg-blue-500/10 text-blue-600" };
    if (now > end) return { label: "Ended", color: "bg-muted text-muted-foreground" };
    return { label: "🔥 Live", color: "bg-red-500/10 text-red-600" };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Flash Sales & Discounts</h3>
        </div>
        <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-3 w-3 mr-1" /> New Sale
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">Sale Name</Label>
              <Input placeholder="e.g. Early Bird, Flash 50% Off" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Discount Type</Label>
              <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Discount Value</Label>
              <Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: parseFloat(e.target.value) || 0 })} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Start Date & Time</Label>
              <Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">End Date & Time</Label>
              <Input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Max Uses (optional)</Label>
              <Input type="number" placeholder="Unlimited" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} className="h-8 text-sm" />
            </div>
          </div>

          {ticketTypes.length > 0 && (
            <div>
              <Label className="text-xs mb-1 block">Applies to Tickets (leave empty for all)</Label>
              <div className="flex flex-wrap gap-1.5">
                {ticketTypes.map((t) => (
                  <button
                    key={t.id}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${form.applies_to_ticket_ids.includes(t.id) ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"}`}
                    onClick={() => setForm({
                      ...form,
                      applies_to_ticket_ids: form.applies_to_ticket_ids.includes(t.id)
                        ? form.applies_to_ticket_ids.filter((id) => id !== t.id)
                        : [...form.applies_to_ticket_ids, t.id],
                    })}
                  >
                    {t.name} (${t.price})
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button size="sm" className="rounded-full text-xs" onClick={handleCreate} disabled={saving}>
              {saving ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Creating...</> : "Create Flash Sale"}
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full text-xs" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {sales && sales.length > 0 && (
        <div className="space-y-2">
          {sales.map((sale) => {
            const status = getSaleStatus(sale);
            return (
              <div key={sale.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{sale.name}</p>
                    <Badge className={`text-[10px] ${status.color}`}>{status.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {sale.discount_value}{sale.discount_type === "percentage" ? "%" : "$"} off · {format(new Date(sale.starts_at), "MMM d, HH:mm")} → {format(new Date(sale.ends_at), "MMM d, HH:mm")}
                    {sale.max_uses && ` · ${sale.used_count}/${sale.max_uses} used`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={sale.is_active} onCheckedChange={() => toggleActive(sale.id, sale.is_active)} />
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteSale(sale.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
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

export default FlashSaleManager;
