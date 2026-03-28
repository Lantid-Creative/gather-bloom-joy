import { useState, useRef } from "react";
import { Plus, Trash2, Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface TicketDraft {
  id?: string;
  name: string;
  price: string;
  description: string;
  available: string;
  max_per_order: string;
}

export interface EventFormData {
  title: string;
  description: string;
  date: string;
  endDate: string;
  time: string;
  location: string;
  imageUrl: string;
  category: string;
  organizer: string;
  capacity: string;
  isOnline: boolean;
  tags: string;
  tickets: TicketDraft[];
}

const emptyTicket: TicketDraft = { name: "", price: "0", description: "", available: "100", max_per_order: "10" };

const categories = ["Music", "Business", "Food & Drink", "Performing & Visual Arts", "Nightlife", "Hobbies", "Festivals", "Culture"];

interface EventFormProps {
  initial?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => Promise<void>;
  submitLabel: string;
  loadingLabel: string;
}

const EventForm = ({ initial, onSubmit, submitLabel, loadingLabel }: EventFormProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initial?.imageUrl || null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [date, setDate] = useState(initial?.date ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [time, setTime] = useState(initial?.time ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [organizer, setOrganizer] = useState(initial?.organizer ?? "");
  const [capacity, setCapacity] = useState(initial?.capacity ?? "100");
  const [isOnline, setIsOnline] = useState(initial?.isOnline ?? false);
  const [tags, setTags] = useState(initial?.tags ?? "");
  const [tickets, setTickets] = useState<TicketDraft[]>(initial?.tickets ?? [{ ...emptyTicket }]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("Image must be under 5MB");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from("event-images").upload(path, file);
    if (error) {
      console.error("Upload error:", error);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("event-images").getPublicUrl(path);
    setImageUrl(urlData.publicUrl);
    setPreviewUrl(urlData.publicUrl);
    setUploading(false);
  };

  const removeImage = () => {
    setImageUrl("");
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addTicket = () => setTickets([...tickets, { ...emptyTicket }]);
  const removeTicket = (i: number) => setTickets(tickets.filter((_, idx) => idx !== i));
  const updateTicket = (i: number, field: keyof TicketDraft, value: string) => {
    const updated = [...tickets];
    updated[i] = { ...updated[i], [field]: value };
    setTickets(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ title, description, date, endDate, time, location, imageUrl, category, organizer, capacity, isOnline, tags, tickets });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Event Details</h2>
        <div className="space-y-2">
          <Label htmlFor="title">Event Title *</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. AfroTech Summit Lagos" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell people what your event is about..." rows={4} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Start Date *</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="time">Time *</Label>
            <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input id="capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Eko Convention Centre, Lagos, Nigeria" required />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="isOnline" checked={isOnline} onChange={(e) => setIsOnline(e.target.checked)} className="rounded" />
          <Label htmlFor="isOnline">This is an online event</Label>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Category & Tags</h2>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. Afrobeats, Lagos, Concert" />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Organizer & Media</h2>
        <div className="space-y-2">
          <Label htmlFor="organizer">Organizer Name</Label>
          <Input id="organizer" value={organizer} onChange={(e) => setOrganizer(e.target.value)} placeholder="Your organization name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Event Image URL</Label>
          <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Tickets</h2>
          <Button type="button" variant="outline" size="sm" onClick={addTicket} className="rounded-full">
            <Plus className="h-4 w-4 mr-1" /> Add Ticket
          </Button>
        </div>
        {tickets.map((ticket, i) => (
          <div key={i} className="border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Ticket {i + 1}</span>
              {tickets.length > 1 && (
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeTicket(i)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input value={ticket.name} onChange={(e) => updateTicket(i, "name", e.target.value)} placeholder="e.g. General Admission" />
              </div>
              <div className="space-y-1">
                <Label>Price ($)</Label>
                <Input type="number" step="0.01" value={ticket.price} onChange={(e) => updateTicket(i, "price", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Available</Label>
                <Input type="number" value={ticket.available} onChange={(e) => updateTicket(i, "available", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Max per order</Label>
                <Input type="number" value={ticket.max_per_order} onChange={(e) => updateTicket(i, "max_per_order", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Input value={ticket.description} onChange={(e) => updateTicket(i, "description", e.target.value)} placeholder="What's included with this ticket?" />
            </div>
          </div>
        ))}
      </div>

      <Button variant="hero" size="lg" type="submit" className="w-full rounded-full" disabled={loading}>
        {loading ? loadingLabel : submitLabel}
      </Button>
    </form>
  );
};

export default EventForm;
