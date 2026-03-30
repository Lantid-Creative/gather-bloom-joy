import { DollarSign, Clock, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const InfluencerOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["my-influencer-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("influencer_profiles").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

  const { data: orders } = useQuery({
    queryKey: ["my-influencer-orders", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data } = await supabase.from("influencer_orders").select("*").eq("influencer_id", profile!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const handleSubmitDeliverable = async (orderId: string, note: string) => {
    await supabase.from("influencer_orders").update({ influencer_submitted: true, deliverables_note: note, status: "delivered", updated_at: new Date().toISOString() }).eq("id", orderId);
    queryClient.invalidateQueries({ queryKey: ["my-influencer-orders"] });
    toast({ title: "Deliverables submitted! 📦" });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Incoming Orders</h2>
      {orders?.length === 0 ? (
        <p className="text-muted-foreground text-sm">No orders yet. Share your profile to start getting hired!</p>
      ) : (
        <div className="space-y-4">
          {orders?.map((order) => (
            <div key={order.id} className="border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{order.title}</h3>
                <div className="flex gap-2">
                  <Badge variant={order.status === "completed" ? "default" : order.status === "delivered" ? "secondary" : "outline"} className="rounded-full">{order.status}</Badge>
                  <Badge variant={order.escrow_status === "funded" ? "default" : "secondary"} className="rounded-full">{order.escrow_status}</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{order.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> ${Number(order.amount).toFixed(0)}</span>
                {order.deadline && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Due {format(new Date(order.deadline), "MMM d")}</span>}
              </div>
              {order.status === "in_progress" && !order.influencer_submitted && (
                <div className="space-y-2">
                  <Textarea placeholder="Describe what you delivered, add links..." id={`deliverable-${order.id}`} />
                  <Button size="sm" variant="hero" className="rounded-full" onClick={() => { const note = (document.getElementById(`deliverable-${order.id}`) as HTMLTextAreaElement)?.value || ""; handleSubmitDeliverable(order.id, note); }}>
                    <Send className="h-3.5 w-3.5 mr-1" /> Submit Deliverables
                  </Button>
                </div>
              )}
              {order.influencer_submitted && order.status === "delivered" && <p className="text-sm text-primary flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Deliverables submitted — awaiting client approval</p>}
              {order.status === "completed" && <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Completed & payment released</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InfluencerOrders;
