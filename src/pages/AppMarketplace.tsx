import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import QantidHeader from "@/components/QantidHeader";
import QantidFooter from "@/components/QantidFooter";
import SEOHead from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search, ArrowRight, Star, Sparkles,
  Users, Gift, Smartphone, BarChart3,
  Mail, Megaphone, Wrench, Globe, Ticket,
  CreditCard, Calendar, MessageSquare, Zap,
  Instagram, Music, Youtube, Share2, Link as LinkIcon,
  QrCode, FileText, PieChart, TrendingUp, Palette,
  ShieldCheck, Headphones, MapPin, Clock, Heart
} from "lucide-react";

type CategoryKey = "popular" | "recommended" | "crm" | "email" | "marketing" | "productivity" | "reporting" | "tickets" | "website";

interface AppItem {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  categories: CategoryKey[];
  staffPick?: boolean;
  isNew?: boolean;
  rating?: number;
  installs?: string;
}

const categories: { key: CategoryKey; label: string }[] = [
  { key: "popular", label: "Popular" },
  { key: "recommended", label: "Recommended" },
  { key: "crm", label: "CRM" },
  { key: "email", label: "Email" },
  { key: "marketing", label: "Marketing & Promotion" },
  { key: "productivity", label: "Productivity" },
  { key: "reporting", label: "Reporting" },
  { key: "tickets", label: "Tickets & Onsite" },
  { key: "website", label: "Website" },
];

const apps: AppItem[] = [
  {
    id: "mpesa-payments",
    name: "M-Pesa Payments",
    description: "Accept mobile money payments from M-Pesa, MTN Mobile Money, and Airtel Money across Africa.",
    icon: CreditCard,
    iconBg: "bg-green-500",
    categories: ["popular", "recommended"],
    staffPick: true,
    rating: 4.9,
    installs: "12K+",
  },
  {
    id: "whatsapp-notifications",
    name: "WhatsApp Notifications",
    description: "Send ticket confirmations, reminders, and updates to attendees via WhatsApp Business API.",
    icon: MessageSquare,
    iconBg: "bg-emerald-500",
    categories: ["popular", "recommended", "marketing"],
    rating: 4.8,
    installs: "8K+",
  },
  {
    id: "flutterwave-gateway",
    name: "Flutterwave Gateway",
    description: "Process payments in 150+ currencies with Africa's leading payment infrastructure.",
    icon: Zap,
    iconBg: "bg-orange-500",
    categories: ["popular"],
    rating: 4.7,
    installs: "6K+",
  },
  {
    id: "instagram-promote",
    name: "Instagram Promoter",
    description: "Automatically create Instagram posts and stories to promote your upcoming events.",
    icon: Instagram,
    iconBg: "bg-gradient-to-br from-purple-500 to-pink-500",
    categories: ["popular", "marketing"],
    isNew: true,
    rating: 4.6,
    installs: "3K+",
  },
  {
    id: "spotify-events",
    name: "Spotify Events",
    description: "Promote your shows on Spotify and reach music lovers who follow your artists.",
    icon: Music,
    iconBg: "bg-green-600",
    categories: ["marketing"],
    rating: 4.5,
    installs: "2K+",
  },
  {
    id: "youtube-promo",
    name: "YouTube Promoter",
    description: "Promote your shows on YouTube with automated video ads and event listings.",
    icon: Youtube,
    iconBg: "bg-red-600",
    categories: ["marketing"],
    rating: 4.4,
    installs: "1.5K+",
  },
  {
    id: "mailchimp-sync",
    name: "Mailchimp Sync",
    description: "Sync subscribers from your events to Mailchimp lists for email marketing campaigns.",
    icon: Mail,
    iconBg: "bg-yellow-500",
    categories: ["recommended", "email", "crm"],
    staffPick: true,
    rating: 4.8,
    installs: "10K+",
  },
  {
    id: "constant-contact",
    name: "Constant Contact",
    description: "Sync subscribers from your events and send beautiful email campaigns to your audience.",
    icon: Mail,
    iconBg: "bg-blue-600",
    categories: ["recommended", "email"],
    rating: 4.6,
    installs: "5K+",
  },
  {
    id: "hubspot-crm",
    name: "HubSpot CRM",
    description: "Sync and track leads from your events. Auto-create contacts and deals in HubSpot.",
    icon: Users,
    iconBg: "bg-orange-600",
    categories: ["recommended", "crm"],
    rating: 4.7,
    installs: "4K+",
  },
  {
    id: "salesforce-integration",
    name: "Salesforce",
    description: "Push attendee data to Salesforce CRM. Track event ROI and manage relationships.",
    icon: Users,
    iconBg: "bg-blue-500",
    categories: ["crm"],
    rating: 4.5,
    installs: "2K+",
  },
  {
    id: "gift-cards",
    name: "Gift Up!",
    description: "The simplest way to sell gift cards online for your events and experiences.",
    icon: Gift,
    iconBg: "bg-pink-500",
    categories: ["popular", "recommended"],
    rating: 4.7,
    installs: "7K+",
  },
  {
    id: "mobile-vip",
    name: "Mobile App & VIP Programs",
    description: "Custom mobile apps and VIP programs for venues, festivals, and recurring events.",
    icon: Smartphone,
    iconBg: "bg-indigo-500",
    categories: ["popular", "tickets"],
    rating: 4.6,
    installs: "3K+",
  },
  {
    id: "tixel-resale",
    name: "Tixel",
    description: "Easy, secure ticket resale for your attendees. Fair pricing, no scalping.",
    icon: Ticket,
    iconBg: "bg-teal-500",
    categories: ["popular", "recommended", "tickets"],
    rating: 4.8,
    installs: "5K+",
  },
  {
    id: "qr-checkin-pro",
    name: "QR Check-In Pro",
    description: "Fast QR code scanning for event check-ins. Works offline and syncs automatically.",
    icon: QrCode,
    iconBg: "bg-violet-500",
    categories: ["tickets"],
    staffPick: true,
    rating: 4.9,
    installs: "9K+",
  },
  {
    id: "badge-printer",
    name: "Badge Printer",
    description: "Print professional name badges on-site with custom templates and QR codes.",
    icon: FileText,
    iconBg: "bg-slate-600",
    categories: ["tickets"],
    rating: 4.4,
    installs: "1K+",
  },
  {
    id: "event-analytics",
    name: "Event Analytics Pro",
    description: "Deep analytics and reporting for your events. Track sales, demographics, and ROI.",
    icon: PieChart,
    iconBg: "bg-cyan-500",
    categories: ["reporting"],
    rating: 4.7,
    installs: "4K+",
  },
  {
    id: "revenue-dashboard",
    name: "Revenue Dashboard",
    description: "Real-time revenue tracking, financial reports, and payout management for organizers.",
    icon: TrendingUp,
    iconBg: "bg-emerald-600",
    categories: ["reporting"],
    rating: 4.6,
    installs: "3K+",
  },
  {
    id: "survey-monkey",
    name: "SurveyMonkey",
    description: "Send post-event surveys to attendees and collect valuable feedback automatically.",
    icon: BarChart3,
    iconBg: "bg-green-700",
    categories: ["reporting", "productivity"],
    rating: 4.5,
    installs: "6K+",
  },
  {
    id: "zapier-connect",
    name: "Zapier",
    description: "Connect Qantid to 5,000+ apps. Automate workflows between your favourite tools.",
    icon: Zap,
    iconBg: "bg-orange-500",
    categories: ["productivity", "recommended"],
    rating: 4.8,
    installs: "11K+",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Add events to Google Calendar automatically. Sync schedules for organizers and attendees.",
    icon: Calendar,
    iconBg: "bg-blue-500",
    categories: ["productivity"],
    rating: 4.7,
    installs: "8K+",
  },
  {
    id: "slack-notify",
    name: "Slack Notifications",
    description: "Get real-time sales and check-in notifications in your Slack workspace.",
    icon: MessageSquare,
    iconBg: "bg-purple-600",
    categories: ["productivity"],
    rating: 4.5,
    installs: "2K+",
  },
  {
    id: "wordpress-embed",
    name: "WordPress Widget",
    description: "Embed your Qantid event listings and ticket buttons on your WordPress site.",
    icon: Globe,
    iconBg: "bg-blue-700",
    categories: ["website"],
    rating: 4.6,
    installs: "5K+",
  },
  {
    id: "wix-embed",
    name: "Wix Integration",
    description: "Add event listings, calendars, and ticket purchase buttons to your Wix website.",
    icon: Globe,
    iconBg: "bg-black",
    categories: ["website"],
    rating: 4.4,
    installs: "2K+",
  },
  {
    id: "squarespace-embed",
    name: "Squarespace Embed",
    description: "Beautiful event widgets for your Squarespace site. Matches your site's design.",
    icon: Palette,
    iconBg: "bg-gray-800",
    categories: ["website"],
    rating: 4.5,
    installs: "1.5K+",
  },
  {
    id: "cymbal-marketing",
    name: "Cymbal",
    description: "Automated marketing for live events. Multi-channel campaigns that drive ticket sales.",
    icon: Megaphone,
    iconBg: "bg-red-500",
    categories: ["marketing"],
    rating: 4.5,
    installs: "2K+",
  },
  {
    id: "hive-analytics",
    name: "Hive",
    description: "See how every campaign drives ticket sales. Attribution analytics for event marketers.",
    icon: TrendingUp,
    iconBg: "bg-amber-500",
    categories: ["recommended", "marketing", "reporting"],
    rating: 4.6,
    installs: "3K+",
  },
  {
    id: "social-share-pro",
    name: "Social Share Pro",
    description: "Generate branded social media posts for multiple platforms with one click.",
    icon: Share2,
    iconBg: "bg-violet-600",
    categories: ["marketing"],
    isNew: true,
    rating: 4.3,
    installs: "800+",
  },
  {
    id: "sms-reminders",
    name: "SMS Reminders",
    description: "Send automated SMS reminders to attendees before your event. Reduce no-shows by 40%.",
    icon: MessageSquare,
    iconBg: "bg-sky-500",
    categories: ["marketing", "productivity"],
    rating: 4.7,
    installs: "4K+",
  },
  {
    id: "event-security",
    name: "Event Security Suite",
    description: "Fraud detection, ticket verification, and attendee identity checks for secure events.",
    icon: ShieldCheck,
    iconBg: "bg-red-700",
    categories: ["tickets"],
    rating: 4.8,
    installs: "3K+",
  },
  {
    id: "live-support",
    name: "Live Support Chat",
    description: "Add live chat support to your event pages. Help attendees in real-time.",
    icon: Headphones,
    iconBg: "bg-blue-400",
    categories: ["productivity"],
    rating: 4.4,
    installs: "1K+",
  },
  {
    id: "venue-maps",
    name: "Venue Maps",
    description: "Interactive venue maps with seat selection, floor plans, and wayfinding for attendees.",
    icon: MapPin,
    iconBg: "bg-rose-500",
    categories: ["tickets", "website"],
    isNew: true,
    rating: 4.5,
    installs: "1.2K+",
  },
];

const AppMarketplace = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("popular");

  const filteredApps = useMemo(() => {
    let result = apps.filter((app) => app.categories.includes(activeCategory));
    if (search.trim()) {
      const q = search.toLowerCase();
      result = apps.filter(
        (app) =>
          app.name.toLowerCase().includes(q) ||
          app.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, activeCategory]);

  const staffPicks = apps.filter((a) => a.staffPick);
  const marketingApps = apps.filter((a) => a.categories.includes("marketing")).slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="App Marketplace — Qantid"
        description="Find the right app to create unforgettable events. Easy to use, made just for you."
      />
      <QantidHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 md:py-24">
        <div className="container max-w-6xl">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-primary">
              Find the right app to create unforgettable events
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-medium">
              Easy to use. Made just for you.
            </p>
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search apps"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12 rounded-full text-base border-2 border-primary/20 focus-visible:ring-primary"
              />
            </div>
          </div>
        </div>
        {/* Decorative dots */}
        <div className="absolute top-8 right-12 w-3 h-3 rounded-full bg-primary/30 hidden lg:block" />
        <div className="absolute top-20 right-28 w-2 h-2 rounded-full bg-primary/20 hidden lg:block" />
        <div className="absolute bottom-12 right-20 w-4 h-4 rounded-full bg-accent/40 hidden lg:block" />
      </section>

      {/* Category Navigation */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b">
        <div className="container max-w-6xl">
          <nav className="flex gap-0 overflow-x-auto py-0">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => {
                  setActiveCategory(cat.key);
                  setSearch("");
                }}
                className={`px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2
                  ${activeCategory === cat.key && !search
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:border-muted-foreground/30"
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="container max-w-6xl py-10 space-y-16">
        {/* Search results or category view */}
        {search.trim() ? (
          <section>
            <h2 className="text-2xl font-bold mb-6">
              Results for "{search}" <span className="text-muted-foreground font-normal text-lg">({filteredApps.length})</span>
            </h2>
            <AppGrid apps={filteredApps} />
            {filteredApps.length === 0 && (
              <div className="text-center py-16">
                <Search className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">No apps found matching "{search}"</p>
              </div>
            )}
          </section>
        ) : (
          <>
            {/* Active category section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{categories.find((c) => c.key === activeCategory)?.label}</h2>
              </div>
              <AppGrid apps={filteredApps} />
              {filteredApps.length === 0 && (
                <div className="text-center py-16">
                  <Wrench className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground">No apps in this category yet.</p>
                </div>
              )}
            </section>

            {/* Staff Picks (only show on popular/recommended) */}
            {(activeCategory === "popular" || activeCategory === "recommended") && (
              <section>
                <h2 className="text-2xl font-bold mb-2">Staff Picks</h2>
                <p className="text-muted-foreground mb-6">Hand-picked by the Qantid team.</p>
                <div className="grid md:grid-cols-2 gap-6">
                  {staffPicks.map((app) => (
                    <StaffPickCard key={app.id} app={app} />
                  ))}
                </div>
              </section>
            )}

            {/* Marketing & Promotion section (only on popular) */}
            {activeCategory === "popular" && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Marketing & Promotion</h2>
                  <button
                    onClick={() => setActiveCategory("marketing")}
                    className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    See all <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <AppGrid apps={marketingApps} />
              </section>
            )}

            {/* Categories to explore (bottom) */}
            {activeCategory === "popular" && (
              <section>
                <h2 className="text-2xl font-bold mb-6">Categories to explore</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {categories.filter((c) => !["popular", "recommended"].includes(c.key)).map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setActiveCategory(cat.key)}
                      className="rounded-xl border bg-card p-6 text-left hover:shadow-md hover:border-primary/30 transition-all group"
                    >
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{cat.label}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {apps.filter((a) => a.categories.includes(cat.key)).length} apps
                      </p>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <QantidFooter />
    </div>
  );
};

/* ─── App Grid ─── */
const AppGrid = ({ apps }: { apps: AppItem[] }) => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {apps.map((app) => (
      <AppCard key={app.id} app={app} />
    ))}
  </div>
);

/* ─── App Card ─── */
const AppCard = ({ app }: { app: AppItem }) => (
  <Card className="hover:shadow-md transition-all hover:border-primary/20 cursor-pointer group">
    <CardContent className="p-5 flex items-start gap-4">
      <div className={`h-12 w-12 rounded-xl ${app.iconBg} flex items-center justify-center shrink-0`}>
        <app.icon className="h-6 w-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">{app.name}</h3>
          {app.isNew && (
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary">New</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{app.description}</p>
        {app.rating && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium">{app.rating}</span>
            </div>
            {app.installs && (
              <span className="text-xs text-muted-foreground">{app.installs} installs</span>
            )}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

/* ─── Staff Pick Card ─── */
const StaffPickCard = ({ app }: { app: AppItem }) => (
  <Card className="overflow-hidden hover:shadow-lg transition-all border-2 hover:border-primary/30 cursor-pointer group">
    <CardContent className="p-0">
      <div className={`${app.iconBg} p-6 flex items-center gap-4`}>
        <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <app.icon className="h-7 w-7 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg">{app.name}</h3>
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="h-3.5 w-3.5 fill-white/80 text-white/80" />
            <span className="text-white/90 text-sm font-medium">{app.rating}</span>
            <span className="text-white/60 text-sm ml-1">{app.installs} installs</span>
          </div>
        </div>
      </div>
      <div className="p-5">
        <p className="text-sm text-muted-foreground leading-relaxed">{app.description}</p>
        <Button variant="outline" size="sm" className="rounded-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          Get app
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default AppMarketplace;
