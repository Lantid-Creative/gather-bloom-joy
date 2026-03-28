import { useState } from "react";
import { Link2, Plus, Trash2, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TrackingLinkManagerProps {
  events: { id: string; title: string }[];
}

const TrackingLinkManager = ({ events }: TrackingLinkManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ eventId: "", label: "", code: "" });

  const eventIds = events.map((e) => e.id);

  const { data: links } = useQuery({
    queryKey: ["tracking-links-manage", eventIds],
    enabled: eventIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("tracking_links")
        .select("*")
        .in("event_id", eventIds)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const generateCode = () => Math.random().toString(36).substring(2, 8);

  const handleCreate = async () => {
    if (!form.eventId || !form.label.trim()) {
      toast({ title: "Select an event and add a label", variant: "destructive" });
      return;
    }
    setLoading(true);
    const code = form.code.trim() || generateCode();
    const { error } = await supabase.from("tracking_links").insert({
      event_id: form.eventId,
      label: form.label.trim(),
      code,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Failed to create link", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Tracking link created! 🎉" });
    setForm({ eventId: "", label: "", code: "" });
    setCreating(false);
    queryClient.invalidateQueries({ queryKey: ["tracking-links-manage"] });
  };

  const handleDelete = async (id: string) => {
    await supabase.from("tracking_links").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["tracking-links-manage"] });
    toast({ title: "Tracking link deleted" });
  };

  const getTrackingUrl = (eventId: string, code: string) => {
    return `${window.location.origin}/event/${eventId}?ref=${code}`;
  };

  const copyLink = (eventId: string, code: string) => {
    navigator.clipboard.writeText(getTrackingUrl(eventId, code));
    toast({ title: "Link copied!" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Link2 className="h-5 w-5" /> Tracking Links
        </h2>
        <Button variant="outline" size="sm" className="rounded-full" onClick={() => setCreating(!creating)}>
          <Plus className="h-3.5 w-3.5 mr-1" /> New Link
        </Button>
      </div>

      {creating && (
        <div className="border rounded-xl p-4 mb-4 space-y-3 bg-card">
          <div className="grid grid-cols-3 gap-3">
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
              <Label className="text-xs">Label (e.g. "Instagram Bio")</Label>
              <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Instagram Bio" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Code (auto-generated if empty)</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="insta" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="hero" size="sm" className="rounded-full" onClick={handleCreate} disabled={loading}>
              {loading ? "Creating…" : "Create Link"}
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setCreating(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {!links || links.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tracking links yet. Create shareable links to track where your attendees come from.</p>
      ) : (
        <div className="space-y-2">
          {links.map((link) => {
            const event = events.find((e) => e.id === link.event_id);
            const url = getTrackingUrl(link.event_id, link.code);
            return (
              <div key={link.id} className="flex items-center justify-between border rounded-lg px-4 py-3 text-sm">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="font-semibold">{link.label || link.code}</span>
                  {event && <span className="text-muted-foreground hidden sm:inline">· {event.title.length > 20 ? event.title.slice(0, 18) + "…" : event.title}</span>}
                  <span className="text-xs text-muted-foreground truncate hidden md:inline">{url}</span>
                </div>
                <div className="flex items-center gap-3 ml-2">
                  <span className="font-bold text-primary">{link.clicks}</span>
                  <span className="text-xs text-muted-foreground">clicks</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyLink(link.event_id, link.code)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                    <a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(link.id)}>
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

export default TrackingLinkManager;
