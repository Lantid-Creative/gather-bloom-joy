import { Link, useNavigate } from "react-router-dom";
import { Plus, Calendar, MapPin, Users, Pencil, Trash2, Eye, Copy, QrCode } from "lucide-react";
import { format } from "date-fns";
import EventbriteHeader from "@/components/EventbriteHeader";
import EventbriteFooter from "@/components/EventbriteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useMyEvents } from "@/hooks/useMyEvents";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const MyEvents = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: events, isLoading } = useMyEvents();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async (eventId: string, eventTitle: string) => {
    try {
      const { error } = await supabase.from("events").delete().eq("id", eventId);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["my-events"] });
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({ title: `"${eventTitle}" deleted` });
    } catch (err: unknown) {
      toast({ title: "Error deleting event", description: err.message, variant: "destructive" });
    }
  };

  const handleStatusChange = async (eventId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("events").update({ status: newStatus }).eq("id", eventId);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["my-events"] });
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({ title: `Event ${newStatus}` });
    } catch (err: unknown) {
      toast({ title: "Error updating status", description: err.message, variant: "destructive" });
    }
  };

  const handleDuplicate = async (event: any) => {
    if (!user) return;
    try {
      const { data: newEvent, error } = await supabase
        .from("events")
        .insert({
          user_id: user.id,
          title: `${event.title} (Copy)`,
          description: event.description,
          date: event.date,
          end_date: event.end_date,
          time: event.time,
          location: event.location,
          image_url: event.image_url,
          category: event.category,
          organizer: event.organizer,
          capacity: event.capacity,
          is_online: event.is_online,
          tags: event.tags,
          status: "draft",
        })
        .select()
        .single();
      if (error) throw error;

      // Copy tickets
      if (event.ticket_types?.length) {
        await supabase.from("ticket_types").insert(
          event.ticket_types.map((t: any) => ({
            event_id: newEvent.id, name: t.name, price: t.price,
            description: t.description, available: t.available, max_per_order: t.max_per_order,
          }))
        );
      }
      await queryClient.invalidateQueries({ queryKey: ["my-events"] });
      toast({ title: "Event duplicated! Edit it below." });
      navigate(`/edit-event/${newEvent.id}`);
    } catch (err: unknown) {
      toast({ title: "Error duplicating", description: err.message, variant: "destructive" });
    }
  };

  if (authLoading) return <div className="min-h-screen bg-background"><EventbriteHeader /><div className="container py-20 text-center"><div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-48 mx-auto" /></div></div></div>;

  if (!user) return (
    <div className="min-h-screen bg-background"><EventbriteHeader />
      <div className="container max-w-lg py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold">Sign in to manage your events</h1>
        <Button variant="hero" className="rounded-full" onClick={() => navigate("/auth")}>Sign in</Button>
      </div>
      <EventbriteFooter />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <EventbriteHeader />
      <div className="container py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Events</h1>
            <p className="text-muted-foreground mt-1">Create, manage, and track your events</p>
          </div>
          <Button variant="hero" className="rounded-full" asChild>
            <Link to="/create-event"><Plus className="h-4 w-4 mr-2" /> Create Event</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse flex gap-4 p-4 border rounded-xl">
              <div className="w-40 h-24 rounded-lg bg-muted shrink-0" />
              <div className="flex-1 space-y-2"><div className="h-5 bg-muted rounded w-1/3" /><div className="h-4 bg-muted rounded w-1/4" /></div>
            </div>
          ))}</div>
        ) : !events || events.length === 0 ? (
          <div className="text-center py-16 space-y-4 border-2 border-dashed rounded-2xl">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"><Calendar className="h-8 w-8 text-primary" /></div>
            <h2 className="text-xl font-semibold">No events yet</h2>
            <Button variant="hero" className="rounded-full" asChild><Link to="/create-event"><Plus className="h-4 w-4 mr-2" /> Create Your First Event</Link></Button>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const isPast = new Date(event.date) < new Date();
              const status = (event as any).status ?? "published";
              return (
                <div key={event.id} className={`flex flex-col sm:flex-row gap-4 p-4 border rounded-xl transition-colors hover:bg-accent/30 ${isPast ? "opacity-60" : ""}`}>
                  <Link to={`/event/${event.id}`} className="shrink-0">
                    <div className="w-full sm:w-44 h-28 rounded-lg overflow-hidden bg-muted">
                      <img src={event.image_url} alt={event.title} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link to={`/event/${event.id}`} className="hover:text-primary transition-colors">
                          <h3 className="font-semibold text-lg truncate">{event.title}</h3>
                        </Link>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{format(new Date(event.date), "EEE, MMM d, yyyy")}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /><span className="truncate max-w-[200px]">{event.location}</span></span>
                          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{event.tickets_sold}/{event.capacity} sold</span>
                        </div>
                      </div>
                      <Badge variant={status === "draft" ? "secondary" : status === "cancelled" ? "destructive" : isPast ? "secondary" : "default"} className="shrink-0">
                        {status === "draft" ? "Draft" : status === "cancelled" ? "Cancelled" : isPast ? "Past" : "Published"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <Button variant="outline" size="sm" className="rounded-full text-xs" asChild><Link to={`/event/${event.id}`}><Eye className="h-3.5 w-3.5 mr-1" /> View</Link></Button>
                      <Button variant="outline" size="sm" className="rounded-full text-xs" asChild><Link to={`/edit-event/${event.id}`}><Pencil className="h-3.5 w-3.5 mr-1" /> Edit</Link></Button>
                      <Button variant="outline" size="sm" className="rounded-full text-xs" asChild><Link to={`/check-in/${event.id}`}><QrCode className="h-3.5 w-3.5 mr-1" /> Check-In</Link></Button>
                      <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => handleDuplicate(event)}><Copy className="h-3.5 w-3.5 mr-1" /> Duplicate</Button>
                      <select
                        value={status}
                        onChange={(e) => handleStatusChange(event.id, e.target.value)}
                        className="rounded-full border text-xs px-2 py-1 bg-background"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="rounded-full text-xs text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5 mr-1" /> Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{event.title}"?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete this event. This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(event.id, event.title)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <EventbriteFooter />
    </div>
  );
};

export default MyEvents;
