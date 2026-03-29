import { useState } from "react";
import { Loader2, Send, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Props {
  eventId: string;
}

const SponsorshipRequestForm = ({ eventId }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tiers } = useQuery({
    queryKey: ["sponsorship-tiers", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsorship_tiers")
        .select("*")
        .eq("event_id", eventId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: existingRequest } = useQuery({
    queryKey: ["my-sponsor-request", eventId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsorship_requests")
        .select("*")
        .eq("event_id", eventId)
        .eq("partner_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [selectedTier, setSelectedTier] = useState<string | "custom">("custom");
  const [message, setMessage] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [customBenefits, setCustomBenefits] = useState("");

  const submitRequest = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("sponsorship_requests").insert({
        event_id: eventId,
        partner_id: user!.id,
        tier_id: selectedTier !== "custom" ? selectedTier : null,
        message,
        custom_offer_amount: selectedTier === "custom" && customAmount ? Number(customAmount) : null,
        custom_offer_benefits: selectedTier === "custom" ? customBenefits : "",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-sponsor-request", eventId] });
      toast({ title: "Sponsorship request sent!", description: "The organizer will review your proposal." });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (!user) {
    return (
      <div className="border rounded-xl p-6 text-center space-y-3 bg-primary/5">
        <Handshake className="h-8 w-8 mx-auto text-primary" />
        <p className="font-semibold">Want to sponsor this event?</p>
        <p className="text-sm text-muted-foreground">Sign in to submit a sponsorship proposal.</p>
        <Button variant="hero" size="sm" className="rounded-full" asChild>
          <Link to="/auth">Sign in</Link>
        </Button>
      </div>
    );
  }

  if (existingRequest) {
    return (
      <div className="border rounded-xl p-6 text-center space-y-2 bg-primary/5">
        <Handshake className="h-8 w-8 mx-auto text-primary" />
        <p className="font-semibold">Sponsorship request submitted</p>
        <p className="text-sm text-muted-foreground">Status: <span className="font-medium capitalize">{existingRequest.status}</span></p>
        <Button variant="outline" size="sm" className="rounded-full" asChild>
          <Link to="/partner-dashboard">View in Partner Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Handshake className="h-5 w-5 text-primary" />
        <h3 className="font-bold">Sponsor This Event</h3>
      </div>

      {/* Tier selection */}
      {tiers && tiers.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Choose a sponsorship tier:</p>
          <div className="space-y-2">
            {tiers.map((tier) => (
              <label key={tier.id} className={`block border rounded-lg p-3 cursor-pointer transition-colors ${selectedTier === tier.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="tier" value={tier.id} checked={selectedTier === tier.id} onChange={() => setSelectedTier(tier.id)} className="accent-primary" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{tier.name}</p>
                      <p className="font-bold text-primary">${Number(tier.price).toLocaleString()}</p>
                    </div>
                    {tier.benefits && tier.benefits.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">{tier.benefits.join(" · ")}</p>
                    )}
                  </div>
                </div>
              </label>
            ))}
            <label className={`block border rounded-lg p-3 cursor-pointer transition-colors ${selectedTier === "custom" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
              <div className="flex items-center gap-3">
                <input type="radio" name="tier" value="custom" checked={selectedTier === "custom"} onChange={() => setSelectedTier("custom")} className="accent-primary" />
                <p className="font-medium text-sm">Propose a custom deal</p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Custom offer fields */}
      {selectedTier === "custom" && (
        <div className="space-y-3 pl-6">
          <Input placeholder="Your offer amount (USD)" type="number" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} />
          <Input placeholder="Desired benefits (e.g., logo on stage, VIP passes)" value={customBenefits} onChange={(e) => setCustomBenefits(e.target.value)} />
        </div>
      )}

      <Textarea placeholder="Message to the organizer (optional)" value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />

      <Button variant="hero" className="rounded-full w-full" onClick={() => submitRequest.mutate()} disabled={submitRequest.isPending}>
        {submitRequest.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
        Submit Sponsorship Request
      </Button>
    </div>
  );
};

export default SponsorshipRequestForm;
