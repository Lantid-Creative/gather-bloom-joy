import { Link } from "react-router-dom";
import FeaturePageLayout from "./FeaturePageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles, Bot, TrendingUp, DollarSign, Pen, Users, Handshake,
  Search, MessageSquare, Wand2, BarChart3, Tag, ArrowRight, Zap, Brain
} from "lucide-react";

const aiFeatures = [
  {
    icon: Pen,
    title: "AI Description Generator",
    description: "Automatically writes compelling, SEO-optimized event descriptions from just a title and category. No more blank page syndrome.",
    where: "Event creation form",
    tag: "Content",
  },
  {
    icon: Tag,
    title: "AI Category & Tag Suggester",
    description: "Analyzes your event title and description to suggest the best category and relevant tags for maximum discoverability.",
    where: "Event creation form",
    tag: "Content",
  },
  {
    icon: Search,
    title: "AI Smart Search",
    description: "Natural language search understands intent — 'outdoor music events this weekend near Lagos' returns precisely matched results.",
    where: "Homepage search",
    tag: "Discovery",
  },
  {
    icon: Sparkles,
    title: "AI Smart Recommendations",
    description: "Personalized event suggestions based on viewing history, preferences, and behavioral patterns. Every user sees a unique feed.",
    where: "Homepage",
    tag: "Discovery",
  },
  {
    icon: Bot,
    title: "AI Event Chatbot",
    description: "Instant answers about event details, tickets, venue, and schedule. Reduces support inquiries by up to 80%.",
    where: "Event detail page",
    tag: "Engagement",
  },
  {
    icon: TrendingUp,
    title: "AI Sales Insights & Forecasting",
    description: "Real-time analysis of sales trends with revenue forecasting, peak purchase windows, and actionable recommendations.",
    where: "Creator dashboard",
    tag: "Analytics",
  },
  {
    icon: DollarSign,
    title: "AI Smart Pricing",
    description: "Dynamic pricing recommendations based on demand, capacity, competition, and market data. Optimize revenue automatically.",
    where: "Creator dashboard",
    tag: "Revenue",
  },
  {
    icon: MessageSquare,
    title: "AI Promo Copy Generator",
    description: "Generate platform-specific marketing copy for Twitter, Instagram, LinkedIn, email, and WhatsApp in seconds.",
    where: "Creator dashboard",
    tag: "Marketing",
  },
  {
    icon: Users,
    title: "AI Influencer Matcher",
    description: "Automatically matches your event with the best-fit influencers based on category, location, audience, and budget.",
    where: "Creator dashboard",
    tag: "Marketing",
  },
  {
    icon: Handshake,
    title: "AI Sponsorship Proposal Generator",
    description: "Creates professional sponsorship proposals with tier recommendations, ROI projections, and audience insights.",
    where: "Creator dashboard",
    tag: "Revenue",
  },
  {
    icon: BarChart3,
    title: "AI Event Report Insights",
    description: "Comprehensive event analytics with ticket breakdown, sales velocity, conversion tracking, and capacity utilization.",
    where: "Creator dashboard",
    tag: "Analytics",
  },
  {
    icon: Wand2,
    title: "AI Ad Campaign Optimizer",
    description: "Promoted events with smart placement across homepage, search, categories, and related events. Impression and click tracking built in.",
    where: "Creator dashboard",
    tag: "Marketing",
  },
];

const tagColors: Record<string, string> = {
  Content: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Discovery: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  Engagement: "bg-green-500/10 text-green-600 border-green-500/20",
  Analytics: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Revenue: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Marketing: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

const FeatureAI = () => (
  <FeaturePageLayout
    icon={<Brain className="h-10 w-10" />}
    title="AI-Powered Platform"
    subtitle="12 intelligent features that help organizers sell more tickets, attendees discover better events, and everyone save time."
    heroColor="bg-gradient-to-br from-primary/15 via-background to-violet-500/10 text-foreground"
  >
    {/* Stats */}
    <div className="grid grid-cols-3 gap-4 mb-12 -mt-4">
      <Card className="text-center py-6">
        <CardContent className="p-0">
          <p className="text-3xl font-black text-primary">12</p>
          <p className="text-xs text-muted-foreground mt-1">AI Features</p>
        </CardContent>
      </Card>
      <Card className="text-center py-6">
        <CardContent className="p-0">
          <p className="text-3xl font-black text-primary">6</p>
          <p className="text-xs text-muted-foreground mt-1">Categories</p>
        </CardContent>
      </Card>
      <Card className="text-center py-6">
        <CardContent className="p-0">
          <p className="text-3xl font-black text-primary">0</p>
          <p className="text-xs text-muted-foreground mt-1">Extra Cost</p>
        </CardContent>
      </Card>
    </div>

    {/* Feature grid */}
    <div className="grid md:grid-cols-2 gap-4">
      {aiFeatures.map((f, i) => (
        <Card key={i} className="group hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <CardTitle className="text-sm">{f.title}</CardTitle>
                  <Badge variant="outline" className={`text-[9px] ${tagColors[f.tag] ?? ""}`}>{f.tag}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">Available in: {f.where}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs leading-relaxed">{f.description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* How it works */}
    <div className="mt-16 space-y-6">
      <h2 className="text-2xl font-bold text-center">How It Works</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { step: "1", title: "Create Your Event", desc: "AI generates descriptions, suggests categories, and recommends pricing as you build your listing." },
          { step: "2", title: "Promote & Sell", desc: "AI writes marketing copy, matches influencers, creates sponsorship proposals, and optimizes ad campaigns." },
          { step: "3", title: "Analyze & Grow", desc: "AI provides sales forecasts, attendee insights, and actionable recommendations to grow your next event." },
        ].map((s) => (
          <div key={s.step} className="text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center mx-auto">{s.step}</div>
            <h3 className="font-semibold">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>

    {/* CTA */}
    <div className="mt-16 text-center rounded-2xl bg-primary/5 p-8">
      <Zap className="h-8 w-8 text-primary mx-auto mb-3" />
      <h2 className="text-xl font-bold mb-2">All AI Features. Zero Extra Cost.</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
        Every AI feature is included free with your Afritickets account. No API keys, no upgrades, no limits.
      </p>
      <div className="flex justify-center gap-3">
        <Button className="rounded-full" asChild>
          <Link to="/create-event">Create Event <ArrowRight className="h-4 w-4 ml-1" /></Link>
        </Button>
        <Button variant="outline" className="rounded-full" asChild>
          <Link to="/dashboard">Open Dashboard</Link>
        </Button>
      </div>
    </div>
  </FeaturePageLayout>
);

export default FeatureAI;
