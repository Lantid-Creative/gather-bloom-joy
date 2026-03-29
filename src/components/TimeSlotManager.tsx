import { useState } from "react";
import { Clock, Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface TimeSlot {
  id: string;
  label: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked: number;
  is_active: boolean;
  sort_order: number;
}

const TimeSlotManager = ({ eventId }: { eventId: string }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [capacity, setCapacity] = useState(50);
  const [saving, setSaving] = useState(false);

  const { data: slots } = useQuery({
    queryKey: ["time-slots", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_time_slots")
        .select("*")
        .eq("event_id", eventId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as TimeSlot[];
    },
  });

  const handleAdd = async () => {
    if (!startTime || !endTime) {
      toast({ title: "Please set start and end times", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("event_time_slots").insert({
        event_id: eventId,
        label: label.trim() || `${startTime} - ${endTime}`,
        start_time: startTime,
        end_time: endTime,
        capacity,
        sort_order: (slots?.length ?? 0),
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["time-slots", eventId] });
      setLabel("");
      setStartTime("09:00");
      setEndTime("10:00");
      setCapacity(50);
      setAdding(false);
      toast({ title: "Time slot added!" });
    } catch (err: unknown) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    await supabase.from("event_time_slots").update({ is_active: active }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["time-slots", eventId] });
  };

  const handleDelete = async (id: string) => {
    await supabase.from("event_time_slots").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["time-slots", eventId] });
    toast({ title: "Time slot deleted" });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Timed Entry Slots</h3>
        </div>
        <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setAdding(!adding)}>
          <Plus className="h-3 w-3 mr-1" /> Add Slot
        </Button>
      </div>

      {adding && (
        <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Label (optional)</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Morning Session" className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Capacity</Label>
              <Input type="number" value={capacity} onChange={(e) => setCapacity(+e.target.value)} min={1} className="h-8 text-xs" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Start Time</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">End Time</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="h-8 text-xs" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="text-xs" onClick={handleAdd} disabled={saving}>
              {saving ? "Saving..." : "Save Slot"}
            </Button>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {slots && slots.length > 0 ? (
        <div className="space-y-2">
          {slots.map((slot) => (
            <div key={slot.id} className={`flex items-center gap-3 p-3 border rounded-lg text-sm ${!slot.is_active ? "opacity-50" : ""}`}>
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{slot.label || `${slot.start_time} - ${slot.end_time}`}</p>
                <p className="text-xs text-muted-foreground">
                  {slot.start_time} – {slot.end_time} · {slot.booked}/{slot.capacity} booked
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {slot.booked >= slot.capacity && (
                  <span className="text-xs font-medium text-destructive">Full</span>
                )}
                <Switch checked={slot.is_active} onCheckedChange={(v) => handleToggle(slot.id, v)} />
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(slot.id)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No time slots configured. Attendees will purchase without a specific entry time.</p>
      )}
    </div>
  );
};

export default TimeSlotManager;
