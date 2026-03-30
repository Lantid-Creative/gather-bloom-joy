import { Link } from "react-router-dom";
import { FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  paid: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

const statusIcon: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3.5 w-3.5" />,
  approved: <CheckCircle className="h-3.5 w-3.5" />,
  rejected: <XCircle className="h-3.5 w-3.5" />,
};

const PartnerSponsorships = () => {
  const { user } = useAuth();

  const { data: requests } = useQuery({
    queryKey: ["partner-requests", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("sponsorship_requests").select("*, events(title, date, location, image_url), sponsorship_tiers(name, price)").eq("partner_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My Sponsorships</h2>
      {!requests || requests.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <p className="text-muted-foreground">No sponsorship requests yet.</p>
          <Button variant="hero" size="sm" className="rounded-full" asChild><Link to="/partners">Browse Events to Sponsor</Link></Button>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req: { id: string; events?: { title?: string; date?: string; location?: string }; status: string; tier_id: string | null; custom_offer_amount: number | null; sponsorship_tiers?: { name?: string; price?: number } | null; created_at: string; payment_status: string; message?: string }) => (
            <div key={req.id} className="border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold truncate">{req.events?.title ?? "Unknown Event"}</p>
                  <Badge className={`text-xs rounded-full ${statusColors[req.status] ?? ""}`}>{statusIcon[req.status]} {req.status}</Badge>
                  {req.payment_status === "paid" && <Badge className="text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Paid</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{req.events?.date && format(new Date(req.events.date), "MMM d, yyyy")} · {req.events?.location?.split(",").slice(0, 2).join(",")}</p>
                <p className="text-sm text-muted-foreground">{req.sponsorship_tiers?.name ? `${req.sponsorship_tiers.name} tier · $${req.sponsorship_tiers.price}` : req.custom_offer_amount ? `Custom offer · $${req.custom_offer_amount}` : "Custom proposal"}</p>
                {req.message && <p className="text-sm text-muted-foreground italic">"{req.message}"</p>}
              </div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(req.created_at), "MMM d, yyyy")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PartnerSponsorships;
