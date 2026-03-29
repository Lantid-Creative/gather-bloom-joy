import { useState } from "react";
import { Sparkles, Copy, Check, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  events: Array<{ id: string; title: string; description?: string; date: string; location: string }>;
}

const platforms = [
  { value: "twitter", label: "𝕏 / Twitter" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "linkedin", label: "LinkedIn" },
];

const tones = [
  { value: "exciting", label: "🔥 Exciting" },
  { value: "professional", label: "💼 Professional" },
  { value: "casual", label: "😎 Casual" },
  { value: "urgent", label: "⚡ Urgent/FOMO" },
];

const AiPromoCopyGenerator = ({ events }: Props) => {
  const [selectedEvent, setSelectedEvent] = useState("");
  const [platform, setPlatform] = useState("twitter");
  const [tone, setTone] = useState("exciting");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ copy?: string; hashtags?: string[] } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generate = async () => {
    const event = events.find((e) => e.id === selectedEvent);
    if (!event) {
      toast({ title: "Select an event first", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-event-tools", {
        body: {
          action: "generate_promo_copy",
          eventTitle: event.title,
          eventDescription: event.description || "",
          eventDate: event.date,
          eventLocation: event.location,
          platform,
          tone,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
    } catch (e: unknown) {
      toast({ title: (e instanceof Error ? e.message : "Unknown error") || "Failed to generate copy", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!result?.copy) return;
    const fullText = `${result.copy}\n\n${result.hashtags?.map((h: string) => (h.startsWith("#") ? h : `#${h}`)).join(" ") || ""}`;
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to clipboard! 📋" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">AI Promo Copy Generator</h2>
      </div>

      <div className="rounded-xl border bg-card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Event</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select event...</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {platforms.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {tones.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <Button
          onClick={generate}
          disabled={loading || !selectedEvent}
          className="rounded-full gap-1.5"
          variant="hero"
          size="sm"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {loading ? "Generating..." : "Generate Copy"}
        </Button>

        {result && (
          <div className="space-y-3 pt-2 border-t">
            <div className="relative">
              <div className="rounded-lg bg-muted/50 p-4 text-sm whitespace-pre-wrap leading-relaxed">
                {result.copy}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>

            {result.hashtags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {result.hashtags.map((h: string, i: number) => (
                  <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {h.startsWith("#") ? h : `#${h}`}
                  </span>
                ))}
              </div>
            )}

            {result.call_to_action && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">CTA:</span> {result.call_to_action}
              </p>
            )}
            {result.platform_tips && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">💡 Tip:</span> {result.platform_tips}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiPromoCopyGenerator;
