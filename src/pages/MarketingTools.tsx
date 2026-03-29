import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EventbriteHeader from "@/components/EventbriteHeader";
import EventbriteFooter from "@/components/EventbriteFooter";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart3, Mail, Share2, Megaphone, TrendingUp, Tag, Settings, Search,
  Plus, ArrowRight, CheckCircle2, Sparkles, Users, DollarSign, Ticket,
  Instagram, Globe, Zap, Gift, Target, Percent, Link as LinkIcon,
  Copy, ExternalLink, FileText, MousePointer, Eye
} from "lucide-react";
import PromoCodeManager from "@/components/PromoCodeManager";
import TrackingLinkManager from "@/components/TrackingLinkManager";
import AiPromoCopyGenerator from "@/components/AiPromoCopyGenerator";

type TabKey = "dashboard" | "email" | "social" | "ads" | "growth" | "promotions" | "settings";

const tabs: { key: TabKey; label: string; icon: React.ElementType; badge?: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "email", label: "Email Campaigns", icon: Mail },
  { key: "social", label: "Social Media", icon: Share2, badge: "New" },
  { key: "ads", label: "Paid Social Ads", icon: Megaphone },
  { key: "growth", label: "Instagram Growth", icon: Instagram },
  { key: "promotions", label: "Promotions", icon: Tag },
  { key: "settings", label: "Settings", icon: Settings },
];

const MarketingTools = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: events } = useQuery({
    queryKey: ["marketing-events", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").eq("user_id", user!.id).order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: orderItems } = useQuery({
    queryKey: ["marketing-order-items", user?.id],
    enabled: !!user && !!events && events.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("order_items").select("*").in("event_id", events!.map((e) => e.id));
      if (error) throw error;
      return data;
    },
  });

  const { data: ads } = useQuery({
    queryKey: ["marketing-ads", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("event_ads").select("*").eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
  });

  const totalRevenue = orderItems?.reduce((sum, i) => sum + i.ticket_price * i.quantity, 0) ?? 0;
  const totalTickets = orderItems?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  const totalImpressions = ads?.reduce((sum, a) => sum + a.impressions, 0) ?? 0;
  const totalClicks = ads?.reduce((sum, a) => sum + a.clicks, 0) ?? 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead title="Marketing Tools — Afritickets" description="Premium marketing tools to drive ticket sales." />
        <EventbriteHeader />
        <div className="container max-w-lg py-20 text-center space-y-4">
          <h1 className="text-2xl font-bold">Sign in to access Marketing Tools</h1>
          <p className="text-muted-foreground">Manage campaigns, ads, social media, and promotions for your events.</p>
          <Button className="rounded-full" onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
        <EventbriteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Marketing Tools — Afritickets" description="Premium marketing tools to drive ticket sales. Email campaigns, ads, promo codes, referrals, AI copy and more." />
      <EventbriteHeader />

      <div className="container max-w-6xl py-8">
        {/* Page title */}
        <h1 className="text-3xl md:text-4xl font-black mb-6">Marketing Tools</h1>

        {/* Tabs */}
        <div className="border-b mb-8 -mx-1 overflow-x-auto">
          <nav className="flex gap-0 min-w-max px-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors
                  ${activeTab === tab.key
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {tab.label}
                {tab.badge && (
                  <span className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-destructive text-[8px] text-destructive-foreground font-bold">●</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        {activeTab === "dashboard" && <DashboardTab events={events ?? []} totalRevenue={totalRevenue} totalTickets={totalTickets} totalImpressions={totalImpressions} totalClicks={totalClicks} />}
        {activeTab === "email" && <EmailTab events={events ?? []} />}
        {activeTab === "social" && <SocialTab events={events ?? []} />}
        {activeTab === "ads" && <AdsTab events={events ?? []} totalImpressions={totalImpressions} totalClicks={totalClicks} />}
        {activeTab === "growth" && <GrowthTab />}
        {activeTab === "promotions" && <PromotionsTab events={events ?? []} />}
        {activeTab === "settings" && <SettingsTab />}
      </div>

      <EventbriteFooter />
    </div>
  );
};

/* ─── Dashboard Tab ─── */
const DashboardTab = ({ events, totalRevenue, totalTickets, totalImpressions, totalClicks }: {
  events: Array<{ id: string; title: string; date: string; revenue: number; tickets: number }>; totalRevenue: number; totalTickets: number; totalImpressions: number; totalClicks: number;
}) => (
  <div className="space-y-8">
    <div>
      <h2 className="text-2xl font-bold mb-2">Marketing Overview</h2>
      <p className="text-muted-foreground">Track all your marketing performance in one place.</p>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatBox icon={DollarSign} label="Revenue" value={`$${totalRevenue.toLocaleString()}`} color="text-green-600" />
      <StatBox icon={Ticket} label="Tickets Sold" value={totalTickets.toString()} color="text-primary" />
      <StatBox icon={Eye} label="Ad Impressions" value={totalImpressions.toLocaleString()} color="text-blue-500" />
      <StatBox icon={MousePointer} label="Ad Clicks" value={totalClicks.toLocaleString()} color="text-violet-500" />
    </div>

    <div className="grid md:grid-cols-3 gap-4">
      <QuickAction icon={Mail} title="Send Campaign" desc="Email your attendees" link="email" color="bg-blue-500/10 text-blue-600" />
      <QuickAction icon={Share2} title="Share on Social" desc="Post to TikTok, IG & more" link="social" color="bg-violet-500/10 text-violet-600" />
      <QuickAction icon={Megaphone} title="Promote Event" desc="Run ads on Afritickets" link="ads" color="bg-primary/10 text-primary" />
    </div>

    {events.length === 0 && (
      <div className="text-center py-16 border rounded-2xl bg-muted/30">
        <h3 className="text-lg font-bold mb-2">No events yet</h3>
        <p className="text-muted-foreground mb-4">Create your first event to start using marketing tools.</p>
        <Button className="rounded-full" asChild><Link to="/create-event">Create Event</Link></Button>
      </div>
    )}
  </div>
);

/* ─── Email Tab ─── */
const EmailTab = ({ events }: { events: Array<{ id: string; title: string }> }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Connect with your audience through custom newsletters and event announcements</h2>
        <p className="text-muted-foreground">Deliver newsletters to your entire audience, send event invites to past attendees, and re-engage subscribers with customizable email campaigns.</p>
      </div>

      {/* Daily limit banner */}
      <div className="rounded-xl border bg-card p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14">
            <Progress value={0} className="h-14 w-14 rounded-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-muted-foreground">0%</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Daily limit</p>
            <p className="text-xl font-bold"><span className="text-primary">0</span><span className="text-muted-foreground">/250</span></p>
          </div>
        </div>
        <div className="h-px md:h-12 md:w-px w-full bg-border" />
        <div className="flex-1">
          <p className="text-sm">Send emails to more people when you <span className="font-bold">subscribe to Afritickets Pro.</span></p>
        </div>
        <Button variant="outline" className="rounded-full whitespace-nowrap" asChild>
          <Link to="/pricing">Subscribe now</Link>
        </Button>
      </div>

      {/* Campaigns / Subscriber lists tabs */}
      <div>
        <div className="flex gap-6 border-b mb-6">
          <button className="pb-3 text-sm font-medium text-primary border-b-2 border-primary">Campaigns</button>
          <button className="pb-3 text-sm font-medium text-muted-foreground hover:text-foreground">Subscriber lists</button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
          <Button className="rounded-full bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-1" /> New campaign
          </Button>
        </div>

        {/* Campaign table */}
        <div className="rounded-xl border">
          <div className="grid grid-cols-4 gap-4 p-4 text-sm font-medium text-muted-foreground border-b">
            <span>Campaigns</span>
            <span className="text-center">Opened</span>
            <span className="text-center">Clicks</span>
            <span className="text-center">Status</span>
          </div>
          <div className="p-12 text-center">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No results found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Create your first email campaign to reach your audience.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Social Media Tab ─── */
const SocialTab = ({ events }: { events: Array<{ id: string; title: string }> }) => {
  const [subTab, setSubTab] = useState<"share" | "facebook">("share");

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex flex-col gap-2 md:w-48 shrink-0">
          <button
            onClick={() => setSubTab("share")}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-left transition-colors ${subTab === "share" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
          >
            Share on social
          </button>
          <button
            onClick={() => setSubTab("facebook")}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-left transition-colors ${subTab === "facebook" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
          >
            Facebook event
          </button>
        </div>

        <div className="flex-1">
          {subTab === "share" && (
            <div className="rounded-2xl bg-muted/30 p-8 md:p-10 space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold">Share on social</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Sell more tickets by tapping into your followers on TikTok, LinkedIn and Instagram</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Use AI to create compelling content that speaks to your audience</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Easily create posts in just a few clicks and share across multiple social platforms at once</span>
                </li>
              </ul>
              <Button className="rounded-full">Start sharing</Button>

              <div className="grid md:grid-cols-2 gap-4 pt-4">
                <Card className="bg-card">
                  <CardContent className="p-6 space-y-3">
                    <Globe className="h-8 w-8 text-muted-foreground/50" />
                    <h4 className="font-semibold">Share your event</h4>
                    <p className="text-sm text-muted-foreground">Invite your followers to your next event.</p>
                    <div className="border-t pt-3">
                      <Link to="/create-event" className="text-sm text-primary hover:underline font-medium">Create an Event to share on social</Link>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="p-6 space-y-3">
                    <FileText className="h-8 w-8 text-muted-foreground/50" />
                    <h4 className="font-semibold">Share a collection</h4>
                    <p className="text-sm text-muted-foreground">Get more eyes on all the events in your collection.</p>
                    <div className="border-t pt-3">
                      <Link to="/dashboard" className="text-sm text-primary hover:underline font-medium">Create a Collection to share on social</Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {subTab === "facebook" && (
            <div className="rounded-2xl bg-muted/30 p-8 md:p-10 space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold">Facebook Events</h2>
              <p className="text-muted-foreground">Connect your Facebook page to automatically create and sync Facebook events when you publish on Afritickets.</p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Auto-publish events to your Facebook page</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Reach your existing Facebook audience</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Track RSVPs and engagement</span>
                </li>
              </ul>
              <Button variant="outline" className="rounded-full">Connect Facebook Page</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Paid Ads Tab ─── */
const AdsTab = ({ events, totalImpressions, totalClicks }: { events: Array<{ id: string; title: string }>; totalImpressions: number; totalClicks: number }) => (
  <div className="space-y-8">
    <div>
      <h2 className="text-2xl font-bold mb-2">Afritickets Ads</h2>
      <p className="text-muted-foreground">Promote your events with prominent placement across homepage, search, category pages, and related events. Get up to 9x more visibility.</p>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatBox icon={Eye} label="Total Impressions" value={totalImpressions.toLocaleString()} color="text-blue-500" />
      <StatBox icon={MousePointer} label="Total Clicks" value={totalClicks.toLocaleString()} color="text-violet-500" />
      <StatBox icon={Target} label="CTR" value={totalImpressions > 0 ? `${((totalClicks / totalImpressions) * 100).toFixed(2)}%` : "0%"} color="text-green-500" />
      <StatBox icon={Megaphone} label="Active Campaigns" value={String(0)} color="text-primary" />
    </div>

    {events.length > 0 ? (
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Your Ad Campaigns</h3>
          <Button className="rounded-full" asChild><Link to="/dashboard">Manage Ads in Dashboard</Link></Button>
        </div>
        <p className="text-sm text-muted-foreground">Create and manage ad campaigns from your event dashboard. Select an event and expand it to find the Ads Manager.</p>
      </div>
    ) : (
      <EmptyState icon={Megaphone} title="No events yet" desc="Create an event first, then launch ad campaigns from your event dashboard." cta="Create Event" link="/create-event" />
    )}

    <div className="rounded-2xl border bg-primary/5 p-8">
      <h3 className="font-bold text-xl mb-4">How Afritickets Ads work</h3>
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { step: "1", title: "Create", desc: "Set your budget, choose placements, and launch your ad." },
          { step: "2", title: "Promote", desc: "Your event appears prominently across Afritickets — homepage, search, categories." },
          { step: "3", title: "Sell", desc: "Pay per click. Track impressions, clicks, and conversions in real-time." },
        ].map((s) => (
          <div key={s.step} className="space-y-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">{s.step}</div>
            <h4 className="font-semibold">{s.title}</h4>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ─── Instagram Growth Tab ─── */
const GrowthTab = () => (
  <div className="space-y-8">
    <div>
      <h2 className="text-2xl font-bold mb-2">Instagram Growth</h2>
      <p className="text-muted-foreground">Grow your Instagram following and convert followers into ticket buyers.</p>
    </div>

    <div className="rounded-2xl bg-muted/30 p-8 md:p-10 space-y-6">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
          <Instagram className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold mb-1">Connect your Instagram</h3>
          <p className="text-muted-foreground">Link your Instagram Business account to unlock insights, schedule posts, and drive ticket sales from your followers.</p>
        </div>
      </div>

      <ul className="space-y-4 pl-16">
        <li className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <span className="text-muted-foreground">See follower analytics and engagement trends</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <span className="text-muted-foreground">Schedule Instagram posts directly from Afritickets</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <span className="text-muted-foreground">Add a "Link in Bio" page to sell tickets directly</span>
        </li>
      </ul>

      <Button variant="outline" className="rounded-full ml-16">Connect Instagram</Button>
    </div>
  </div>
);

/* ─── Promotions Tab ─── */
const PromotionsTab = ({ events }: { events: Array<{ id: string; title: string }> }) => (
  <div className="space-y-10">
    <div>
      <h2 className="text-2xl font-bold mb-2">Promotions</h2>
      <p className="text-muted-foreground">Manage promo codes, tracking links, referral programs, flash sales, and AI-generated copy for your events.</p>
    </div>

    {/* AI Promo Copy */}
    <AiPromoCopyGenerator events={events.map((e) => ({ id: e.id, title: e.title, description: e.description, date: e.date, location: e.location }))} />

    {/* Promo Codes */}
    <PromoCodeManager events={events.map((e) => ({ id: e.id, title: e.title }))} />

    {/* Tracking Links */}
    <TrackingLinkManager events={events.map((e) => ({ id: e.id, title: e.title }))} />
  </div>
);

/* ─── Settings Tab ─── */
const SettingsTab = () => (
  <div className="space-y-8">
    <div>
      <h2 className="text-2xl font-bold mb-2">Marketing Settings</h2>
      <p className="text-muted-foreground">Configure your marketing preferences and integrations.</p>
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-6 space-y-3">
          <Mail className="h-8 w-8 text-blue-500" />
          <h4 className="font-semibold">Email Sender Settings</h4>
          <p className="text-sm text-muted-foreground">Configure your sender name and reply-to email for campaigns.</p>
          <Button variant="outline" size="sm" className="rounded-full">Configure</Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 space-y-3">
          <LinkIcon className="h-8 w-8 text-cyan-500" />
          <h4 className="font-semibold">Tracking & Attribution</h4>
          <p className="text-sm text-muted-foreground">Set up UTM parameters and conversion tracking for campaigns.</p>
          <Button variant="outline" size="sm" className="rounded-full">Configure</Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 space-y-3">
          <Share2 className="h-8 w-8 text-violet-500" />
          <h4 className="font-semibold">Social Accounts</h4>
          <p className="text-sm text-muted-foreground">Connect your social media accounts for scheduling and analytics.</p>
          <Button variant="outline" size="sm" className="rounded-full">Connect</Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 space-y-3">
          <Sparkles className="h-8 w-8 text-purple-500" />
          <h4 className="font-semibold">AI Preferences</h4>
          <p className="text-sm text-muted-foreground">Customize tone, language, and style for AI-generated marketing copy.</p>
          <Button variant="outline" size="sm" className="rounded-full">Customize</Button>
        </CardContent>
      </Card>
    </div>
  </div>
);

/* ─── Shared Components ─── */
const StatBox = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) => (
  <div className="rounded-xl border bg-card p-5 space-y-1">
    <div className="flex items-center gap-2 text-muted-foreground text-sm"><Icon className={`h-4 w-4 ${color}`} />{label}</div>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const QuickAction = ({ icon: Icon, title, desc, link, color }: { icon: React.ElementType; title: string; desc: string; link: string; color: string }) => (
  <Card className="hover:shadow-md transition-shadow cursor-pointer group">
    <CardContent className="p-5 flex items-center gap-4">
      <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </CardContent>
  </Card>
);

const EmptyState = ({ icon: Icon, title, desc, cta, link }: { icon: React.ElementType; title: string; desc: string; cta: string; link: string }) => (
  <div className="text-center py-16 border rounded-2xl bg-muted/30">
    <Icon className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-muted-foreground mb-4 max-w-md mx-auto">{desc}</p>
    <Button className="rounded-full" asChild><Link to={link}>{cta}</Link></Button>
  </div>
);

export default MarketingTools;
