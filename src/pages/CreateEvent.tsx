import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import EventbriteHeader from "@/components/EventbriteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface TicketDraft {
  name: string;
  price: string;
  description: string;
  available: string;
  max_per_order: string;
}

const emptyTicket: TicketDraft = { name: "", price: "0", description: "", available: "100", max_per_order: "10" };

const categories = ["Music", "Business", "Food & Drink", "Performing & Visual Arts", "Nightlife", "Hobbies", "Festivals", "Culture"];

const CreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [capacity, setCapacity] = useState("100");
  const [isOnline, setIsOnline] = useState(false);
  const [tags, setTags] = useState("");
  const [tickets, setTickets] = useState<TicketDraft[]>([{ ...emptyTicket }]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <EventbriteHeader />
        <div className="container max-w-lg py-20 text-center space-y-4">
          <h1 className="text-2xl font-bold">Sign in to create events</h1>
          <p className="text-muted-foreground">You need an account to create and manage events on Afritickets.</p>
          <Button variant="hero" className="rounded-full" onClick={() => navigate("/auth")}>
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  const addTicket = () => setTickets([...tickets, { ...emptyTicket }]);
  const removeTicket = (i: number) => setTickets(tickets.filter((_, idx) => idx !== i));
  const updateTicket = (i: number, field: keyof TicketDraft, value: string) => {
    const updated = [...tickets];
    updated[i] = { ...updated[i], [field]: value };
    setTickets(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time || !location) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: event, error: eventError } = await supabase
        .from("events")
        .insert({
          user_id: user.id,
          title,
          description,
          date: new Date(`${date}T${time}`).toISOString(),
          end_date: endDate ? new Date(`${endDate}T${time}`).toISOString() : null,
          time,
          location,
          image_url: imageUrl || "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800",
          category,
          organizer: organizer || user.user_metadata?.full_name || "Organizer",
          capacity: parseInt(capacity) || 100,
          is_online: isOnline,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        })
        .select()
        .single();

      if (eventError) throw eventError;

      const validTickets = tickets.filter((t) => t.name.trim());
      if (validTickets.length > 0) {
        const { error: ticketError } = await supabase.from("ticket_types").insert(
          validTickets.map((t) => ({
            event_id: event.id,
            name: t.name,
            price: parseFloat(t.price) || 0,
            description: t.description,
            available: parseInt(t.available) || 100,
            max_per_order: parseInt(t.max_per_order) || 10,
          }))
        );
        if (ticketError) throw ticketError;
      }

      await queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({ title: "Event created successfully! 🎉" });
      navigate(`/event/${event.id}`);
    } catch (err: any) {
      toast({ title: "Error creating event", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <EventbriteHeader />
      <div className="container max-w-2xl py-10">
        <Button variant="ghost" size="sm" className="-ml-2 mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>

        <h1 className="text-3xl font-bold mb-8">Create Event</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
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

          {/* Category & Tags */}
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

          {/* Organizer & Image */}
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

          {/* Tickets */}
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
            {loading ? "Creating..." : "Create Event"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
