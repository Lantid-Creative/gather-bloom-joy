import { useState } from "react";
import { Sparkles, DollarSign, Lightbulb, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TicketTier {
  name: string;
  price: number;
  available: number;
}

interface Props {
  eventTitle: string;
  eventCategory: string;
  eventLocation: string;
  capacity: number;
  ticketsSold: number;
  isOnline: boolean;
  currentTickets: TicketTier[];
}

interface PricingSuggestion {
  tier_name: string;
  current_price?: number;
  suggested_price: number;
  reason: string;
}

interface NewTierIdea {
  name: string;
  price: number;
  description: string;
}

interface PricingResult {
  overall_assessment: string;
  suggestions: PricingSuggestion[];
  new_tier_ideas: NewTierIdea[];
  dynamic_pricing_tip: string;
}

const AiSmartPricing = ({ eventTitle, eventCategory, eventLocation, capacity, ticketsSold, isOnline, currentTickets }: Props) => {
  const [result, setResult] = useState<PricingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const analyze = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-event-tools", {
        body: {
          action: "smart_pricing",
          eventTitle,
          eventCategory,
          eventLocation,
          capacity,
          ticketsSold,
          isOnline,
          currentTickets,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      toast({ title: "Pricing analysis failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">AI Smart Pricing</h3>
          <Badge variant="secondary" className="text-[10px]">AI</Badge>
        </div>
        <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={analyze} disabled={loading || currentTickets.length === 0}>
          {loading ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Analyzing...</> : <><Sparkles className="h-3 w-3 mr-1" /> Analyze Pricing</>}
        </Button>
      </div>

      {currentTickets.length === 0 && (
        <p className="text-xs text-muted-foreground">Add ticket types first to get pricing suggestions.</p>
      )}

      {result && (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm">{result.overall_assessment}</p>
            </CardContent>
          </Card>

          {result.suggestions.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Price Adjustments</h4>
              <div className="space-y-2">
                {result.suggestions.map((s, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{s.tier_name}</p>
                      <p className="text-xs text-muted-foreground">{s.reason}</p>
                    </div>
                    <div className="text-right">
                      {s.current_price !== undefined && (
                        <p className="text-xs text-muted-foreground line-through">${s.current_price}</p>
                      )}
                      <p className="text-sm font-bold text-primary">${s.suggested_price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.new_tier_ideas.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><Lightbulb className="h-3 w-3" /> New Tier Ideas</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.new_tier_ideas.map((t, i) => (
                  <div key={i} className="rounded-lg border p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{t.name}</p>
                      <Badge variant="outline">${t.price}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{t.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
            <p className="text-xs font-medium text-primary flex items-center gap-1"><Sparkles className="h-3 w-3" /> Dynamic Pricing Tip</p>
            <p className="text-xs text-muted-foreground mt-1">{result.dynamic_pricing_tip}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiSmartPricing;
