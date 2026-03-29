import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, Clock, CheckCircle2, Star, Send, XCircle } from "lucide-react";
import EventbriteHeader from "@/components/EventbriteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const MyHires = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-hires", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("influencer_orders")
        .select("*, influencer_profiles(display_name, avatar_url)")
        .eq("client_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleApprove = async (orderId: string, influencerId: string) => {
    await supabase.from("influencer_orders").update({
      client_approved: true,
      status: "completed",
      escrow_status: "released",
      updated_at: new Date().toISOString(),
    }).eq("id", orderId);

    // Update influencer stats
    const { data: profile } = await supabase.from("influencer_profiles").select("total_jobs").eq("id", influencerId).single();
    if (profile) {
      await supabase.from("influencer_profiles").update({
        total_jobs: (profile.total_jobs || 0) + 1,
      }).eq("id", influencerId);
    }

    queryClient.invalidateQueries({ queryKey: ["my-hires"] });
    toast({ title: "Job approved! Payment released ✅" });
    setReviewOrderId(orderId);
  };

  const handleReject = async (orderId: string) => {
    await supabase.from("influencer_orders").update({
      status: "in_progress",
      influencer_submitted: false,
      deliverables_note: "",
      updated_at: new Date().toISOString(),
    }).eq("id", orderId);
    queryClient.invalidateQueries({ queryKey: ["my-hires"] });
    toast({ title: "Sent back for revision" });
  };

  const handleSubmitReview = async (orderId: string, influencerId: string) => {
    if (!user) return;
    const { error } = await supabase.from("influencer_reviews").insert({
      order_id: orderId,
      influencer_id: influencerId,
      reviewer_id: user.id,
      rating,
      comment: comment.trim(),
    });
    if (error) {
      toast({ title: "Already reviewed", variant: "destructive" });
    } else {
      // Update avg rating
      const { data: reviews } = await supabase.from("influencer_reviews").select("rating").eq("influencer_id", influencerId);
      if (reviews && reviews.length > 0) {
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await supabase.from("influencer_profiles").update({ avg_rating: avg }).eq("id", influencerId);
      }
      toast({ title: "Review submitted! ⭐" });
    }
    setReviewOrderId(null);
    setRating(5);
    setComment("");
    queryClient.invalidateQueries({ queryKey: ["my-hires"] });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <EventbriteHeader />
        <div className="container max-w-lg py-20 text-center space-y-4">
          <h1 className="text-2xl font-bold">Sign in to view your hires</h1>
          <Button variant="hero" className="rounded-full" onClick={() => navigate("/auth")}>Sign in</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <EventbriteHeader />
      <div className="container max-w-3xl py-10">
        <h1 className="text-3xl font-bold mb-2">My Hires</h1>
        <p className="text-muted-foreground mb-8">Track influencer jobs and manage escrow payments</p>

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">No hires yet</h2>
            <p className="text-muted-foreground">Browse influencers and hire someone for your next campaign!</p>
            <Button variant="hero" className="rounded-full" onClick={() => navigate("/influencers")}>Find Influencers</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: Record<string, unknown> & { id: string; influencer_profiles?: Record<string, unknown>; title: string; status: string; amount: number; created_at: string; influencer_submitted: boolean; client_approved: boolean }) => (
              <div key={order.id} className="border rounded-xl p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {order.influencer_profiles?.avatar_url ? (
                        <img src={order.influencer_profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-primary">{order.influencer_profiles?.display_name?.[0]}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{order.title}</h3>
                      <p className="text-xs text-muted-foreground">with {order.influencer_profiles?.display_name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={
                      order.status === "completed" ? "default" :
                      order.status === "delivered" ? "secondary" : "outline"
                    } className="rounded-full">{order.status}</Badge>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">{order.description}</p>

                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 font-medium"><DollarSign className="h-3.5 w-3.5" /> ${Number(order.amount).toFixed(0)}</span>
                  <Badge variant="secondary" className="rounded-full text-xs">{order.escrow_status}</Badge>
                  {order.deadline && <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {format(new Date(order.deadline), "MMM d")}</span>}
                </div>

                {/* Delivered — approve or reject */}
                {order.status === "delivered" && (
                  <div className="p-3 rounded-lg bg-surface space-y-2">
                    <p className="text-sm font-medium">Deliverables submitted:</p>
                    <p className="text-sm text-muted-foreground">{order.deliverables_note || "No notes provided"}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="hero" className="rounded-full" onClick={() => handleApprove(order.id, order.influencer_id)}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve & Release Payment
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => handleReject(order.id)}>
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Request Revision
                      </Button>
                    </div>
                  </div>
                )}

                {/* Completed — leave review */}
                {order.status === "completed" && (
                  <div className="space-y-2">
                    <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> Completed — payment released
                    </p>
                    {reviewOrderId === order.id ? (
                      <div className="p-3 rounded-lg border space-y-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button key={n} type="button" onClick={() => setRating(n)}>
                              <Star className={`h-5 w-5 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                            </button>
                          ))}
                        </div>
                        <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How was your experience?" rows={2} />
                        <Button size="sm" variant="hero" className="rounded-full" onClick={() => handleSubmitReview(order.id, order.influencer_id)}>
                          <Send className="h-3.5 w-3.5 mr-1" /> Submit Review
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => setReviewOrderId(order.id)}>
                        <Star className="h-3.5 w-3.5 mr-1" /> Leave a Review
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyHires;
