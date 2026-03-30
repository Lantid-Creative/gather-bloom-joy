import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import QantidHeader from "@/components/QantidHeader";
import EventForm, { type EventFormData, type TicketDraft } from "@/components/EventForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useEvent } from "@/hooks/useEvents";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const EditEvent = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: event, isLoading } = useEvent(id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <QantidHeader />
        <div className="container max-w-lg py-20 text-center space-y-4">
          <h1 className="text-2xl font-bold">Sign in to edit events</h1>
          <Button variant="hero" className="rounded-full" onClick={() => navigate("/auth")}>
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <QantidHeader />
        <div className="container max-w-2xl py-20">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <QantidHeader />
        <div className="container max-w-lg py-20 text-center space-y-4">
          <h1 className="text-2xl font-bold">Event not found</h1>
          <Button variant="link" onClick={() => navigate("/my-events")}>← Back to My Events</Button>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const initialData: Partial<EventFormData> = {
    title: event.title,
    description: event.description,
    date: format(eventDate, "yyyy-MM-dd"),
    endDate: event.end_date ? format(new Date(event.end_date), "yyyy-MM-dd") : "",
    time: event.time || format(eventDate, "HH:mm"),
    location: event.location,
    imageUrl: event.image_url,
    extraImages: event.extra_images ?? [],
    category: event.category,
    organizer: event.organizer,
    capacity: String(event.capacity),
    isOnline: event.is_online,
    meetingPlatform: event.meeting_platform ?? "",
    meetingUrl: event.meeting_url ?? "",
    tags: event.tags.join(", "),
    status: event.status ?? "published",
    recurrenceType: event.recurrence_type ?? "none",
    recurrenceEndDate: event.recurrence_end_date ? format(new Date(event.recurrence_end_date), "yyyy-MM-dd") : "",
    currency: event.currency ?? "USD",
    tickets: event.ticket_types.length > 0
      ? event.ticket_types.map((t) => ({
          id: t.id,
          name: t.name,
          price: String(t.price),
          description: t.description,
          available: String(t.available),
          max_per_order: String(t.max_per_order),
        }))
      : [{ name: "", price: "0", description: "", available: "100", max_per_order: "10" }],
  };

  const handleUpdate = async (data: EventFormData) => {
    if (!data.title || !data.date || !data.time || !data.location) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }

    // Update event
    const { error: eventError } = await supabase
      .from("events")
      .update({
        title: data.title,
        description: data.description,
        date: new Date(`${data.date}T${data.time}`).toISOString(),
        end_date: data.endDate ? new Date(`${data.endDate}T${data.time}`).toISOString() : null,
        time: data.time,
        location: data.location,
        image_url: data.imageUrl || event.image_url,
        extra_images: data.extraImages || [],
        category: data.category,
        organizer: data.organizer,
        capacity: parseInt(data.capacity) || 100,
        is_online: data.isOnline,
        meeting_platform: data.meetingPlatform || "",
        meeting_url: data.meetingUrl || "",
        tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
        status: data.status || "published",
        currency: data.currency || "USD",
        recurrence_type: data.recurrenceType || "none",
        recurrence_end_date: data.recurrenceType !== "none" && data.recurrenceEndDate ? new Date(data.recurrenceEndDate).toISOString() : null,
      })
      .eq("id", event.id);

    if (eventError) throw eventError;

    // Delete existing tickets and re-insert
    await supabase.from("ticket_types").delete().eq("event_id", event.id);

    const validTickets = data.tickets.filter((t) => t.name.trim());
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
    await queryClient.invalidateQueries({ queryKey: ["event", event.id] });
    await queryClient.invalidateQueries({ queryKey: ["my-events"] });
    toast({ title: "Event updated successfully! ✅" });
    navigate(`/event/${event.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <QantidHeader />
      <div className="container max-w-2xl py-10">
        <Button variant="ghost" size="sm" className="-ml-2 mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h1 className="text-3xl font-bold mb-8">Edit Event</h1>
        <EventForm initial={initialData} onSubmit={handleUpdate} submitLabel="Save Changes" loadingLabel="Saving..." />
      </div>
    </div>
  );
};

export default EditEvent;
