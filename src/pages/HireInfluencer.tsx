import { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Clock, DollarSign, Star } from "lucide-react";
import EventbriteHeader from "@/components/EventbriteHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const HireInfluencer = () => {
  const { influencerId } = useParams();
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get("service");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState(preselectedServiceId || "custom");
  const [loading, setLoading] = useState(false);

  const { data: influencer } = useQuery({
    queryKey: ["influencer", influencerId],
    enabled: !!influencerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("influencer_profiles")
        .select("*, influencer_services(*)")
        .eq("id", influencerId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const services = ((influencer as Record<string, unknown>)?.influencer_services as Array<Record<string, unknown>> ?? []).filter((s) => s.is_active) ?? [];

  // When a service is selected, auto-fill
  const selectedService = services.find((s) => s.id === selectedServiceId);
  const effectiveAmount = selectedService ? Number(selectedService.price) : parseFloat(amount) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate("/auth"); return; }
    if (!influencer) return;

    if (!title.trim()) {
      toast({ title: "Please provide a job title", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("influencer_orders").insert({
        influencer_id: influencer.id,
        service_id: selectedService ? selectedService.id : null,
        client_id: user.id,
        title: title.trim(),
        description: description.trim(),
        amount: effectiveAmount,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        status: "pending",
        escrow_status: "unfunded",
      });

      if (error) throw error;

      toast({ title: "Hire request sent! 🎉", description: "The influencer will review your request. You'll pay once they accept." });
      navigate("/influencers");
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <EventbriteHeader />
        <div className="container max-w-lg py-20 text-center space-y-4">
          <h1 className="text-2xl font-bold">Sign in to hire influencers</h1>
          <Button variant="hero" className="rounded-full" onClick={() => navigate("/auth")}>Sign in</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <EventbriteHeader />
      <div className="container max-w-2xl py-10">
        <Button variant="ghost" size="sm" className="-ml-2 mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>

        <div className="flex items-center gap-4 mb-8">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
            {influencer?.avatar_url ? (
              <img src={influencer.avatar_url} alt={influencer?.display_name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-primary">{influencer?.display_name?.[0]}</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">Hire {influencer?.display_name}</h1>
            <p className="text-muted-foreground text-sm">
              {influencer?.city}{influencer?.city && influencer?.country ? ", " : ""}{influencer?.country}
              {influencer?.avg_rating > 0 && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {Number(influencer.avg_rating).toFixed(1)}
                </span>
              )}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select service */}
          {services.length > 0 && (
            <div className="space-y-3">
              <Label>Select a Service</Label>
              <div className="space-y-2">
                {services.map((s: Record<string, unknown>) => (
                  <label
                    key={s.id}
                    className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${
                      selectedServiceId === s.id ? "border-primary bg-primary/5" : "hover:bg-accent/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="service"
                        checked={selectedServiceId === s.id}
                        onChange={() => { setSelectedServiceId(s.id); setTitle(s.title); setAmount(String(s.price)); }}
                        className="accent-primary"
                      />
                      <div>
                        <p className="font-medium text-sm">{s.title}</p>
                        <p className="text-xs text-muted-foreground">{s.category} · {s.delivery_days} days delivery</p>
                      </div>
                    </div>
                    <span className="font-bold text-primary">${Number(s.price).toFixed(0)}</span>
                  </label>
                ))}
                <label
                  className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                    selectedServiceId === "custom" ? "border-primary bg-primary/5" : "hover:bg-accent/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="service"
                    checked={selectedServiceId === "custom"}
                    onChange={() => { setSelectedServiceId("custom"); setTitle(""); setAmount(""); }}
                    className="accent-primary"
                  />
                  <div>
                    <p className="font-medium text-sm">Custom Request</p>
                    <p className="text-xs text-muted-foreground">Describe what you need and propose your budget</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Job Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Promote my Lagos music festival on Instagram" required />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe exactly what you need: deliverables, target audience, key messages, any brand guidelines..."
              rows={5}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Budget ($) {selectedService ? "(from service)" : "*"}</Label>
              <Input
                type="number"
                value={selectedService ? String(selectedService.price) : amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                disabled={!!selectedService}
              />
            </div>
            <div className="space-y-2">
              <Label>Deadline</Label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>

          {/* Escrow info */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-sm">How Escrow Works</h3>
            </div>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>You submit this hire request — the influencer reviews it</li>
              <li>Once accepted, you fund the escrow (payment is held securely)</li>
              <li>The influencer completes the work and submits deliverables</li>
              <li>You review and approve — payment is released to the influencer</li>
            </ol>
          </div>

          <Button variant="hero" size="lg" type="submit" className="w-full rounded-full" disabled={loading}>
            {loading ? "Sending..." : `Send Hire Request · $${effectiveAmount.toFixed(0)}`}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default HireInfluencer;
