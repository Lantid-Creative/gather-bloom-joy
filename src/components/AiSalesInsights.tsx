import { useState } from "react";
import { Sparkles, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  events: Array<{ title: string; revenue: number; tickets: number; date: string }>;
  totalRevenue: number;
  totalTickets: number;
  totalOrders: number;
}

const AiSalesInsights = ({ events, totalRevenue, totalTickets, totalOrders }: Props) => {
  const [insights, setInsights] = useState("");
  const [forecast, setForecast] = useState<Record<string, unknown> | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const { toast } = useToast();

  const eventData = events.map((e) => ({
    title: e.title,
    revenue: e.revenue,
    tickets: e.tickets,
    date: e.date,
  }));

  const getInsights = async () => {
    setLoadingInsights(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-event-tools", {
        body: { action: "sales_insights", events: eventData, totalRevenue, totalTickets, totalOrders },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setInsights(data.content);
    } catch (e: unknown) {
      toast({ title: (e instanceof Error ? e.message : "Unknown error") || "Failed to generate insights", variant: "destructive" });
    } finally {
      setLoadingInsights(false);
    }
  };

  const getForecast = async () => {
    setLoadingForecast(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-event-tools", {
        body: { action: "sales_forecast", events: eventData, totalRevenue, totalTickets },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setForecast(data);
    } catch (e: unknown) {
      toast({ title: (e instanceof Error ? e.message : "Unknown error") || "Failed to generate forecast", variant: "destructive" });
    } finally {
      setLoadingForecast(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">AI Insights</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sales Insights Card */}
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-1.5 text-sm">
              <Sparkles className="h-4 w-4 text-primary" /> Sales Insights
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={getInsights}
              disabled={loadingInsights}
              className="rounded-full text-xs gap-1"
            >
              {loadingInsights ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              {insights ? "Refresh" : "Generate"}
            </Button>
          </div>
          {insights ? (
            <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{insights}</div>
          ) : (
            <p className="text-sm text-muted-foreground">Click generate to get AI-powered analysis of your sales performance.</p>
          )}
        </div>

        {/* Forecast Card */}
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-1.5 text-sm">
              <TrendingUp className="h-4 w-4 text-primary" /> 30-Day Forecast
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={getForecast}
              disabled={loadingForecast}
              className="rounded-full text-xs gap-1"
            >
              {loadingForecast ? <RefreshCw className="h-3 w-3 animate-spin" /> : <TrendingUp className="h-3 w-3" />}
              {forecast ? "Refresh" : "Forecast"}
            </Button>
          </div>
          {forecast ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 rounded-lg bg-primary/5">
                  <p className="text-lg font-bold text-primary">${forecast.projected_revenue?.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Projected Revenue</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-primary/5">
                  <p className="text-lg font-bold text-primary">{forecast.projected_tickets}</p>
                  <p className="text-[10px] text-muted-foreground">Projected Tickets</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-primary/5">
                  <p className="text-lg font-bold text-primary">{forecast.growth_rate}</p>
                  <p className="text-[10px] text-muted-foreground">Growth ({forecast.confidence})</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{forecast.summary}</p>
              {forecast.recommendations?.length > 0 && (
                <ul className="text-xs text-muted-foreground space-y-1">
                  {forecast.recommendations.map((r: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">•</span> {r}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Click forecast to get AI predictions for the next 30 days.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiSalesInsights;
