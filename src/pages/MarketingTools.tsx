import { Link } from "react-router-dom";
import EventbriteHeader from "@/components/EventbriteHeader";
import EventbriteFooter from "@/components/EventbriteFooter";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Megaphone, Mail, Share2, Tag, Percent, Users, Sparkles, TrendingUp, Zap,
  BarChart3, Target, Gift, ArrowRight, CheckCircle2
} from "lucide-react";

const tools = [
  {
    icon: Megaphone,
    title: "Afritickets Ads",
    description: "Promote events with prominent placement across homepage, search, category pages, and related events. 9x more visibility.",
    stat: "9x visibility",
    link: "/dashboard",
    cta: "Launch Ad Campaign",
    color: "text-primary",
  },
  {
    icon: Mail,
    title: "Email Campaigns",
    description: "Send targeted email blasts to your attendee list with custom templates, merge tags, and delivery tracking.",
    stat: "Built-in",
    link: "/dashboard",
    cta: "Send Campaign",
    color: "text-blue-500",
  },
  {
    icon: Share2,
    title: "Social Post Scheduler",
    description: "Schedule promotional posts across social platforms. Plan your entire marketing calendar in advance.",
    stat: "Multi-platform",
    link: "/dashboard",
    cta: "Schedule Posts",
    color: "text-violet-500",
  },
  {
    icon: Tag,
    title: "Promo Codes",
    description: "Create discount codes with percentage or flat discounts, usage limits, and expiry dates to drive urgency.",
    stat: "Unlimited codes",
    link: "/dashboard",
    cta: "Create Codes",
    color: "text-green-500",
  },
  {
    icon: Percent,
    title: "Flash Sales",
    description: "Time-limited flash deals with countdown timers that create urgency and drive impulse ticket purchases.",
    stat: "Auto-countdown",
    link: "/dashboard",
    cta: "Set Up Flash Sale",
    color: "text-amber-500",
  },
  {
    icon: Users,
    title: "Referral Programs",
    description: "Turn attendees into promoters with commission-based referral links. Track clicks, conversions, and payouts.",
    stat: "Commission tracking",
    link: "/dashboard",
    cta: "Create Program",
    color: "text-rose-500",
  },
  {
    icon: Target,
    title: "Tracking Links",
    description: "Create UTM-powered tracking links for every channel. Measure which sources drive the most ticket sales.",
    stat: "Full attribution",
    link: "/dashboard",
    cta: "Create Links",
    color: "text-cyan-500",
  },
  {
    icon: Sparkles,
    title: "AI Promo Copy",
    description: "Generate compelling promotional copy, email subjects, and social captions with AI tailored to your event.",
    stat: "AI-powered",
    link: "/dashboard",
    cta: "Generate Copy",
    color: "text-purple-500",
  },
];

const MarketingTools = () => (
  <div className="min-h-screen bg-background">
    <SEOHead title="Marketing Tools — Afritickets" description="Premium marketing tools to drive ticket sales. Email campaigns, ads, promo codes, referrals, AI copy and more." />
    <EventbriteHeader />

    {/* Hero */}
    <section className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16 md:py-24">
      <div className="container max-w-5xl text-center">
        <Badge className="mb-4 text-xs" variant="secondary"><Zap className="h-3 w-3 mr-1" /> Premium Tools</Badge>
        <h1 className="text-3xl md:text-5xl font-black mb-4">Marketing Tools That Sell More Tickets</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-2">
          Organizers using Afritickets marketing tools sell <span className="font-bold text-foreground">67% more tickets</span> on average.
        </p>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-8">
          Email campaigns, social scheduling, promo codes, flash sales, referral programs, tracking links, AI copy generation, and promoted ads — all built in.
        </p>
        <div className="flex justify-center gap-3">
          <Button size="lg" className="rounded-full" asChild>
            <Link to="/create-event">Start Selling Tickets</Link>
          </Button>
          <Button size="lg" variant="outline" className="rounded-full" asChild>
            <Link to="/dashboard">Open Dashboard</Link>
          </Button>
        </div>

        {/* Stats bar */}
        <div className="mt-12 grid grid-cols-3 gap-4 max-w-lg mx-auto">
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-black text-primary">67%</p>
            <p className="text-xs text-muted-foreground">More tickets sold</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-black text-primary">9x</p>
            <p className="text-xs text-muted-foreground">More visibility with ads</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-black text-primary">4x</p>
            <p className="text-xs text-muted-foreground">More ticket sales with ads</p>
          </div>
        </div>
      </div>
    </section>

    {/* Tools grid */}
    <section className="container max-w-6xl py-16">
      <h2 className="text-2xl font-bold mb-8 text-center">Everything You Need to Fill Your Event</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool) => (
          <Card key={tool.title} className="hover:shadow-md transition-shadow group">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-1">
                <tool.icon className={`h-5 w-5 ${tool.color}`} />
                <Badge variant="outline" className="text-[9px]">{tool.stat}</Badge>
              </div>
              <CardTitle className="text-base">{tool.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <CardDescription className="text-xs leading-relaxed">{tool.description}</CardDescription>
              <Button size="sm" variant="ghost" className="w-full justify-between text-xs group-hover:text-primary" asChild>
                <Link to={tool.link}>{tool.cta} <ArrowRight className="h-3 w-3" /></Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="bg-primary/5 py-16">
      <div className="container max-w-3xl text-center">
        <h2 className="text-2xl font-bold mb-3">More Tools, More Tickets</h2>
        <p className="text-muted-foreground mb-6">All marketing tools are included in every Afritickets event. No extra fees, no upgrades needed.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-green-500" /> Free for all events</div>
          <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-green-500" /> No per-email fees</div>
          <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-green-500" /> Pay-per-click ads</div>
        </div>
        <Button size="lg" className="rounded-full mt-8" asChild>
          <Link to="/create-event">Create Your Event</Link>
        </Button>
      </div>
    </section>

    <EventbriteFooter />
  </div>
);

export default MarketingTools;
