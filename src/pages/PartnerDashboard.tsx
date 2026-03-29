import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Globe, Briefcase, FileText, Send, CheckCircle, XCircle, Clock, Plus, Loader2 } from "lucide-react";
import EventbriteHeader from "@/components/EventbriteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

const PartnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Partner profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["partner-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Sponsorship requests
  const { data: requests } = useQuery({
    queryKey: ["partner-requests", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsorship_requests")
        .select("*, events(title, date, location, image_url), sponsorship_tiers(name, price)")
        .eq("partner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Profile form state
  const [form, setForm] = useState({
    company_name: "",
    website: "",
    industry: "",
    description: "",
  });

  const [editing, setEditing] = useState(false);

  // Initialize form when profile loads
  const profileReady = profile && !editing;
  if (profile && form.company_name === "" && !editing) {
    setForm({
      company_name: profile.company_name,
      website: profile.website || "",
      industry: profile.industry || "",
      description: profile.description || "",
    });
  }

  const saveProfile = useMutation({
    mutationFn: async () => {
      if (profile) {
        const { error } = await supabase
          .from("partner_profiles")
          .update({ ...form, updated_at: new Date().toISOString() })
          .eq("id", profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("partner_profiles")
          .insert({ ...form, user_id: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-profile"] });
      setEditing(false);
      toast({ title: "Profile saved", description: "Your partner profile has been updated." });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <EventbriteHeader />
        <div className="container max-w-lg py-20 text-center space-y-4">
          <h1 className="text-2xl font-bold">Sign in to access Partner Dashboard</h1>
          <Button variant="hero" className="rounded-full" onClick={() => navigate("/auth")}>Sign in</Button>
        </div>
      </div>
    );
  }

  const showProfileForm = !profile || editing;

  return (
    <div className="min-h-screen bg-background">
      <EventbriteHeader />
      <div className="container max-w-4xl py-10">
        <Button variant="ghost" size="sm" className="-ml-2 mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h1 className="text-3xl font-bold mb-2">Partner Dashboard</h1>
        <p className="text-muted-foreground mb-8">Manage your company profile and track sponsorship requests.</p>

        <Tabs defaultValue={!profile ? "profile" : "requests"} className="space-y-6">
          <TabsList className="rounded-full">
            <TabsTrigger value="profile" className="rounded-full">Company Profile</TabsTrigger>
            <TabsTrigger value="requests" className="rounded-full">My Sponsorships</TabsTrigger>
            <TabsTrigger value="browse" className="rounded-full">Browse Events</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            {profileLoading ? (
              <div className="py-12 text-center text-muted-foreground">Loading...</div>
            ) : showProfileForm ? (
              <div className="border rounded-xl p-6 space-y-5 max-w-lg">
                <h2 className="text-lg font-semibold">{profile ? "Edit" : "Create"} Company Profile</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Company Name *</label>
                    <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="Acme Corp" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Website</label>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Industry</label>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="Technology, Finance, FMCG..." />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">About your company</label>
                    <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tell organizers about your brand..." rows={4} />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="hero" className="rounded-full" onClick={() => saveProfile.mutate()} disabled={!form.company_name || saveProfile.isPending}>
                    {saveProfile.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                    {profile ? "Update Profile" : "Create Profile"}
                  </Button>
                  {profile && <Button variant="outline" className="rounded-full" onClick={() => setEditing(false)}>Cancel</Button>}
                </div>
              </div>
            ) : (
              <div className="border rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">{profile.company_name}</h2>
                      {profile.industry && <p className="text-sm text-muted-foreground">{profile.industry}</p>}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => setEditing(true)}>Edit</Button>
                </div>
                {profile.website && <p className="text-sm"><Globe className="inline h-3.5 w-3.5 mr-1 text-muted-foreground" /><a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{profile.website}</a></p>}
                {profile.description && <p className="text-sm text-muted-foreground">{profile.description}</p>}
              </div>
            )}
          </TabsContent>

          {/* Sponsorship Requests Tab */}
          <TabsContent value="requests">
            {!requests || requests.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground">No sponsorship requests yet.</p>
                <Button variant="hero" size="sm" className="rounded-full" asChild>
                  <Link to="/partners">Browse Events to Sponsor</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req: { id: string; events?: { title?: string; date?: string; location?: string }; status: string; tier_id: string | null; custom_offer_amount: number | null; sponsorship_tiers?: { name?: string; price?: number } | null; created_at: string; payment_status: string; message?: string }) => (
                  <div key={req.id} className="border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold truncate">{req.events?.title ?? "Unknown Event"}</p>
                        <Badge className={`text-xs rounded-full ${statusColors[req.status] ?? ""}`}>
                          {statusIcon[req.status]} {req.status}
                        </Badge>
                        {req.payment_status === "paid" && (
                          <Badge className="text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Paid</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {req.events?.date && format(new Date(req.events.date), "MMM d, yyyy")} · {req.events?.location?.split(",").slice(0, 2).join(",")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {req.sponsorship_tiers?.name
                          ? `${req.sponsorship_tiers.name} tier · $${req.sponsorship_tiers.price}`
                          : req.custom_offer_amount
                            ? `Custom offer · $${req.custom_offer_amount}`
                            : "Custom proposal"}
                      </p>
                      {req.message && <p className="text-sm text-muted-foreground italic">"{req.message}"</p>}
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(req.created_at), "MMM d, yyyy")}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Browse Tab */}
          <TabsContent value="browse">
            <div className="text-center py-8 space-y-3">
              <p className="text-muted-foreground">Discover events looking for sponsors and submit your proposals.</p>
              <Button variant="hero" className="rounded-full" asChild>
                <Link to="/partners">Browse Sponsorship Opportunities</Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PartnerDashboard;
