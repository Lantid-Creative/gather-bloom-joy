import { useState, useRef } from "react";
import { Plus, Trash2, Upload, X, Image as ImageIcon, Sparkles, Wand2, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { SUPPORTED_CURRENCIES } from "@/lib/currencies";

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
  extraImages: string[];
  category: string;
  organizer: string;
  capacity: string;
  isOnline: boolean;
  meetingPlatform: string;
  meetingUrl: string;
  tags: string;
  tickets: TicketDraft[];
  status: string;
  recurrenceType: string;
  recurrenceEndDate: string;
  currency: string;
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
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [suggestingCats, setSuggestingCats] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initial?.imageUrl || null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [date, setDate] = useState(initial?.date ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [time, setTime] = useState(initial?.time ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [extraImages, setExtraImages] = useState<string[]>(initial?.extraImages ?? []);
  const [category, setCategory] = useState(initial?.category ?? "");
  const [organizer, setOrganizer] = useState(initial?.organizer ?? "");
  const [capacity, setCapacity] = useState(initial?.capacity ?? "100");
  const [isOnline, setIsOnline] = useState(initial?.isOnline ?? false);
  const [meetingPlatform, setMeetingPlatform] = useState(initial?.meetingPlatform ?? "");
  const [meetingUrl, setMeetingUrl] = useState(initial?.meetingUrl ?? "");
  const [tags, setTags] = useState(initial?.tags ?? "");
  const [tickets, setTickets] = useState<TicketDraft[]>(initial?.tickets ?? [{ ...emptyTicket }]);
  const [status, setStatus] = useState(initial?.status ?? "published");
  const [recurrenceType, setRecurrenceType] = useState(initial?.recurrenceType ?? "none");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(initial?.recurrenceEndDate ?? "");
  const [currency, setCurrency] = useState(initial?.currency ?? "USD");

  const uploadFile = async (file: File) => {
    if (!user) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("Image must be under 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const removeImage = () => {
    setImageUrl("");
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const generateDescription = async () => {
    if (!title.trim()) {
      toast({ title: "Enter a title first", variant: "destructive" });
      return;
    }
    setGeneratingDesc(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-event-tools", {
        body: { action: "generate_description", title, category, location, date, isOnline },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setDescription(data.content);
      toast({ title: "✨ Description generated!" });
    } catch (e: unknown) {
      toast({ title: (e instanceof Error ? e.message : "Unknown error") || "Failed to generate description", variant: "destructive" });
    } finally {
      setGeneratingDesc(false);
    }
  };

  const suggestCategoryTags = async () => {
    if (!title.trim()) {
      toast({ title: "Enter a title first", variant: "destructive" });
      return;
    }
    setSuggestingCats(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-event-tools", {
        body: { action: "suggest_categories", title, description },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data.category) setCategory(data.category);
      if (data.tags?.length) setTags(data.tags.join(", "));
      toast({ title: `🏷️ Suggested: ${data.category} (${data.tags?.length || 0} tags)` });
    } catch (e: unknown) {
      toast({ title: (e instanceof Error ? e.message : "Unknown error") || "Failed to suggest categories", variant: "destructive" });
    } finally {
      setSuggestingCats(false);
    }
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
      await onSubmit({ title, description, date, endDate, time, location, imageUrl, extraImages, category, organizer, capacity, isOnline, meetingPlatform, meetingUrl, tags, tickets, status, recurrenceType, recurrenceEndDate, currency });
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
          <div className="flex items-center justify-between">
            <Label htmlFor="description">Description</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateDescription}
              disabled={generatingDesc}
              className="text-xs gap-1.5 rounded-full border-primary/30 text-primary hover:bg-primary/10"
            >
              <Wand2 className="h-3.5 w-3.5" />
              {generatingDesc ? "Generating..." : "AI Generate"}
            </Button>
          </div>
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
          <LocationAutocomplete id="location" value={location} onChange={setLocation} placeholder="e.g. Eko Convention Centre, Lagos, Nigeria" required />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="isOnline" checked={isOnline} onChange={(e) => setIsOnline(e.target.checked)} className="rounded" />
          <Label htmlFor="isOnline">This is an online event</Label>
        </div>
        {isOnline && (
          <div className="space-y-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
            <h3 className="text-sm font-semibold text-primary">Virtual Event Platform</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="meetingPlatform">Platform</Label>
                <select
                  id="meetingPlatform"
                  value={meetingPlatform}
                  onChange={(e) => setMeetingPlatform(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select platform</option>
                  <option value="zoom">Zoom</option>
                  <option value="google_meet">Google Meet</option>
                  <option value="microsoft_teams">Microsoft Teams</option>
                  <option value="webex">Cisco Webex</option>
                  <option value="youtube_live">YouTube Live</option>
                  <option value="facebook_live">Facebook Live</option>
                  <option value="twitter_spaces">X (Twitter) Spaces</option>
                  <option value="discord">Discord</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meetingUrl">Meeting Link</Label>
                <Input
                  id="meetingUrl"
                  type="url"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  placeholder="https://zoom.us/j/123456789"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Attendees will see the join link after purchasing their ticket.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Event Status & Recurrence</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="recurrence">Recurrence</Label>
            <select id="recurrence" value={recurrenceType} onChange={(e) => setRecurrenceType(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="none">No recurrence</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Biweekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
        {recurrenceType !== "none" && (
          <div className="space-y-2">
            <Label htmlFor="recurrenceEndDate">Recurrence ends on</Label>
            <Input id="recurrenceEndDate" type="date" value={recurrenceEndDate} onChange={(e) => setRecurrenceEndDate(e.target.value)} />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Category & Tags</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={suggestCategoryTags}
            disabled={suggestingCats}
            className="text-xs gap-1.5 rounded-full border-primary/30 text-primary hover:bg-primary/10"
          >
            <Tags className="h-3.5 w-3.5" />
            {suggestingCats ? "Suggesting..." : "AI Suggest"}
          </Button>
        </div>
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
          <Label>Event Cover Image</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          {previewUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-border">
              <img src={previewUrl} alt="Event cover" className="w-full h-48 object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              disabled={uploading}
              className={`w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors ${
                dragging
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {uploading ? (
                <span className="text-sm">Uploading...</span>
              ) : (
                <>
                  <Upload className="h-8 w-8" />
                  <span className="text-sm font-medium">
                    {dragging ? "Drop image here" : "Drag & drop or click to upload"}
                  </span>
                  <span className="text-xs">JPG, PNG, WebP · Max 5MB</span>
                </>
              )}
            </button>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ImageIcon className="h-3 w-3" />
            <span>Or paste a URL:</span>
            <Input
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setPreviewUrl(e.target.value || null);
              }}
              placeholder="https://example.com/image.jpg"
              className="h-7 text-xs flex-1"
            />
          </div>

          {/* Extra gallery images */}
          <div className="space-y-2 pt-2">
            <Label className="text-xs font-medium text-muted-foreground">Additional Gallery Images</Label>
            <div className="flex flex-wrap gap-2">
              {extraImages.map((img, i) => (
                <div key={i} className="relative w-20 h-14 rounded-lg overflow-hidden border group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setExtraImages(extraImages.filter((_, idx) => idx !== i))}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={async () => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.multiple = true;
                  input.onchange = async (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (!files || !user) return;
                    const urls: string[] = [];
                    for (const file of Array.from(files).slice(0, 5)) {
                      const ext = file.name.split(".").pop();
                      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
                      const { error } = await supabase.storage.from("event-images").upload(path, file);
                      if (!error) {
                        const { data: urlData } = supabase.storage.from("event-images").getPublicUrl(path);
                        urls.push(urlData.publicUrl);
                      }
                    }
                    setExtraImages([...extraImages, ...urls]);
                  };
                  input.click();
                }}
                className="w-20 h-14 rounded-lg border-2 border-dashed border-border hover:border-primary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground">Add up to 5 extra images for the event gallery</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Currency & Tickets</h2>
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-primary">{SUPPORTED_CURRENCIES.find(c => c.code === currency)?.symbol ?? "$"}</span>
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="currency" className="font-semibold">Event Currency</Label>
              <p className="text-xs text-muted-foreground">Choose the currency for all ticket prices. We support major African currencies — pick the one that works best for your audience.</p>
            </div>
          </div>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} — {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">All ticket prices below are in <strong>{currency}</strong></span>
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
                <Label>Price ({SUPPORTED_CURRENCIES.find(c => c.code === currency)?.symbol ?? currency})</Label>
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
