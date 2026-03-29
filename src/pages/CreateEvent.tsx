import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import EventbriteHeader from "@/components/EventbriteHeader";
import EventForm, { type EventFormData } from "@/components/EventForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const CreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const handleCreate = async (data: EventFormData) => {
    if (!data.title || !data.date || !data.time || !data.location) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }

    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        user_id: user.id,
        title: data.title,
        description: data.description,
        date: new Date(`${data.date}T${data.time}`).toISOString(),
        end_date: data.endDate ? new Date(`${data.endDate}T${data.time}`).toISOString() : null,
        time: data.time,
        location: data.location,
        image_url: data.imageUrl || "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800",
        category: data.category,
        organizer: data.organizer || user.user_metadata?.full_name || "Organizer",
        capacity: parseInt(data.capacity) || 100,
        is_online: data.isOnline,
        meeting_platform: data.meetingPlatform || "",
        meeting_url: data.meetingUrl || "",
        tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
        status: data.status || "published",
        recurrence_type: data.recurrenceType || "none",
        recurrence_end_date: data.recurrenceType !== "none" && data.recurrenceEndDate ? new Date(data.recurrenceEndDate).toISOString() : null,
      })
      .select()
      .single();

    if (eventError) throw eventError;

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
    toast({ title: "Event created successfully! 🎉" });
    navigate(`/event/${event.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <EventbriteHeader />
      <div className="container max-w-2xl py-10">
        <Button variant="ghost" size="sm" className="-ml-2 mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h1 className="text-3xl font-bold mb-8">Create Event</h1>
        <EventForm onSubmit={handleCreate} submitLabel="Create Event" loadingLabel="Creating..." />
      </div>
    </div>
  );
};

export default CreateEvent;
