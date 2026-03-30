import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Building2, Globe, Briefcase, Send, MessageSquare, Filter } from "lucide-react";
import QantidHeader from "@/components/QantidHeader";
import QantidFooter from "@/components/QantidFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const FindPartners = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [proposalMessage, setProposalMessage] = useState("");
  const [proposalAmount, setProposalAmount] = useState("");
  const [proposalBenefits, setProposalBenefits] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [sending, setSending] = useState(false);

  // Fetch all partner profiles
  const { data: partners, isLoading } = useQuery({
    queryKey: ["all-partner-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch organizer's events (for attaching a proposal to an event)
  const { data: myEvents } = useQuery({
    queryKey: ["my-events-for-proposal", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, date")
        .eq("user_id", user!.id)
        .eq("status", "published")
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const industries = [...new Set(partners?.map((p) => p.industry).filter(Boolean) ?? [])];

  const filtered = partners?.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      if (!p.company_name.toLowerCase().includes(q) && !(p.description || "").toLowerCase().includes(q) && !(p.industry || "").toLowerCase().includes(q)) return false;
    }
    if (industryFilter && p.industry !== industryFilter) return false;
    return true;
  }) ?? [];

  const handleSendProposal = async () => {
    if (!user) {
      toast.error("Please sign in to send proposals");
      return;
    }
    if (!selectedEventId) {
      toast.error("Please select an event for this proposal");
      return;
    }
    if (!proposalMessage.trim()) {
      toast.error("Please write a message for the partner");
      return;
    }

    setSending(true);
    try {
      // Create a sponsorship request from the organizer to the partner
      const { error } = await supabase.from("sponsorship_requests").insert({
        event_id: selectedEventId,
        partner_id: selectedPartner.user_id,
        message: proposalMessage.trim(),
        custom_offer_amount: proposalAmount ? Number(proposalAmount) : null,
        custom_offer_benefits: proposalBenefits.trim() || null,
        status: "pending",
      });

      if (error) throw error;

      toast.success(`Proposal sent to ${selectedPartner.company_name}!`);
      setSelectedPartner(null);
      setProposalMessage("");
      setProposalAmount("");
      setProposalBenefits("");
      setSelectedEventId("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send proposal");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <QantidHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-12 md:py-20">
        <div className="container max-w-4xl text-center space-y-4">
          <Badge variant="secondary" className="rounded-full px-4 py-1 text-sm">
            <Building2 className="h-3.5 w-3.5 mr-1.5" /> Find Partners
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            Find <span className="text-primary">Sponsors</span> for Your Events
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse verified brand partners and send sponsorship proposals directly. Connect your event with the right sponsors across Africa.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8">
        <div className="container max-w-5xl">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex items-center rounded-full border bg-background px-3 h-10 gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Search by company name, industry..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0 sm:hidden" />
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="h-10 rounded-full border bg-background px-4 text-sm outline-none w-full sm:w-auto"
              >
                <option value="">All Industries</option>
                {industries.map((i) => <option key={i} value={i!}>{i}</option>)}
              </select>
            </div>
          </div>

          {/* Partners Grid */}
          {isLoading ? (
            <div className="text-center py-16 text-muted-foreground">Loading partners...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground">No partners found. Try adjusting your search.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((partner) => (
                <div key={partner.id} className="border rounded-xl p-5 hover:shadow-md transition-shadow bg-card space-y-4">
                  <div className="flex items-start gap-3">
                    {partner.company_logo_url ? (
                      <img
                        src={partner.company_logo_url}
                        alt={partner.company_name}
                        className="w-12 h-12 rounded-lg object-cover border shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold text-base truncate">{partner.company_name}</h3>
                      {partner.industry && (
                        <Badge variant="secondary" className="text-xs mt-1">{partner.industry}</Badge>
                      )}
                    </div>
                  </div>

                  {partner.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{partner.description}</p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {partner.website && (
                      <a href={partner.website.startsWith("http") ? partner.website : `https://${partner.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                        <Globe className="h-3 w-3" /> Website
                      </a>
                    )}
                    {partner.industry && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" /> {partner.industry}
                      </span>
                    )}
                  </div>

                  <Button
                    variant="hero"
                    size="sm"
                    className="w-full rounded-full"
                    onClick={() => {
                      if (!user) {
                        toast.error("Please sign in to send proposals");
                        return;
                      }
                      setSelectedPartner(partner);
                    }}
                  >
                    <Send className="h-3.5 w-3.5 mr-1.5" /> Send Proposal
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Proposal Dialog */}
      <Dialog open={!!selectedPartner} onOpenChange={(open) => { if (!open) setSelectedPartner(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Send Proposal to {selectedPartner?.company_name}
            </DialogTitle>
            <DialogDescription>
              Invite this partner to sponsor one of your upcoming events.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Select Event *</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none"
              >
                <option value="">Choose an event...</option>
                {myEvents?.map((ev) => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
              {myEvents?.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  You don't have any upcoming events. <Link to="/create-event" className="text-primary underline">Create one first</Link>.
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Proposed Amount (USD)</label>
              <Input
                type="number"
                placeholder="e.g. 5000"
                value={proposalAmount}
                onChange={(e) => setProposalAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Benefits You're Offering</label>
              <Textarea
                placeholder="e.g. Logo on event banner, 2 VIP tables, social media mentions..."
                value={proposalBenefits}
                onChange={(e) => setProposalBenefits(e.target.value)}
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Message *</label>
              <Textarea
                placeholder="Introduce your event and why this partnership would be valuable..."
                value={proposalMessage}
                onChange={(e) => setProposalMessage(e.target.value)}
                rows={4}
              />
            </div>

            <Button
              variant="hero"
              className="w-full rounded-full"
              disabled={sending || !selectedEventId || !proposalMessage.trim()}
              onClick={handleSendProposal}
            >
              {sending ? "Sending..." : "Send Proposal"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <QantidFooter />
    </div>
  );
};

export default FindPartners;
