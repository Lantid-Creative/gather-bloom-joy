import { useState } from "react";
import { Sparkles, Handshake, Copy, Mail, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  eventTitle: string;
  eventCategory: string;
  eventDescription: string;
  eventLocation: string;
  eventDate: string;
  capacity: number;
  ticketsSold: number;
  seekingSponsors: boolean;
  sponsorshipTiers?: { name: string; price: number; benefits: string[] }[];
}

interface SuggestedPackage {
  name: string;
  price: number;
  benefits: string[];
}

interface ProposalResult {
  executive_summary: string;
  audience_profile: string;
  visibility_benefits: string[];
  suggested_packages: SuggestedPackage[];
  roi_projection: string;
  outreach_email: string;
}

const AiSponsorshipProposal = ({ eventTitle, eventCategory, eventDescription, eventLocation, eventDate, capacity, ticketsSold, seekingSponsors, sponsorshipTiers }: Props) => {
  const [result, setResult] = useState<ProposalResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-event-tools", {
        body: {
          action: "generate_sponsorship_proposal",
          eventTitle, eventCategory, eventDescription, eventLocation, eventDate, capacity, ticketsSold, seekingSponsors, sponsorshipTiers,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
    } catch (err: unknown) {
      toast({ title: "Proposal generation failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast({ title: "Copied!" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Handshake className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">AI Sponsorship Proposal</h3>
          <Badge variant="secondary" className="text-[10px]">AI</Badge>
        </div>
        <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={generate} disabled={loading}>
          {loading ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Generating...</> : <><Sparkles className="h-3 w-3 mr-1" /> Generate Proposal</>}
        </Button>
      </div>

      {result && (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-1">Executive Summary</h4>
                <p className="text-sm">{result.executive_summary}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-1">Audience Profile</h4>
                <p className="text-sm">{result.audience_profile}</p>
              </div>
            </CardContent>
          </Card>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">Brand Visibility Benefits</h4>
            <div className="flex flex-wrap gap-1.5">
              {result.visibility_benefits.map((b, i) => (
                <Badge key={i} variant="outline" className="text-xs">{b}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">Suggested Packages</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.suggested_packages.map((pkg, i) => (
                <div key={i} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{pkg.name}</p>
                    <Badge className="bg-primary/10 text-primary">${pkg.price.toLocaleString()}</Badge>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    {pkg.benefits.map((b, j) => <li key={j}>• {b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="pt-4">
              <h4 className="text-xs font-semibold text-muted-foreground mb-1">ROI Projection</h4>
              <p className="text-sm">{result.roi_projection}</p>
            </CardContent>
          </Card>

          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> Outreach Email</h4>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => copyText(result.outreach_email, "email")}>
                {copiedField === "email" ? <><Check className="h-3 w-3 mr-1" /> Copied</> : <><Copy className="h-3 w-3 mr-1" /> Copy</>}
              </Button>
            </div>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">{result.outreach_email}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiSponsorshipProposal;
