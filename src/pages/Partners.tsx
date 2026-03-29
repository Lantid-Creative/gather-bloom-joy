import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Calendar, Users, ArrowRight, Handshake, Eye, TrendingUp, Award } from "lucide-react";
import QantidHeader from "@/components/QantidHeader";
import QantidFooter from "@/components/QantidFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

const Partners = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Fetch events that are seeking sponsors, along with their tiers
  const { data: events, isLoading } = useQuery({
    queryKey: ["sponsor-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("seeking_sponsors", true)
        .eq("status", "published")
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: tiers } = useQuery({
    queryKey: ["sponsor-tiers", events?.map((e) => e.id)],
    enabled: !!events && events.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsorship_tiers")
        .select("*")
        .in("event_id", events!.map((e) => e.id))
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const categories = [...new Set(events?.map((e) => e.category).filter(Boolean) ?? [])];

  const filtered = events?.filter((e) => {
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.location.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && e.category !== categoryFilter) return false;
    return true;
  }) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <QantidHeader />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16 md:py-24">
        <div className="container max-w-4xl text-center space-y-6">
          <Badge variant="secondary" className="rounded-full px-4 py-1 text-sm">
            <Handshake className="h-3.5 w-3.5 mr-1.5" /> Partner Program
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Sponsor Events Across <span className="text-primary">Africa</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect your brand with thousands of attendees at Africa's most exciting events. Browse opportunities, choose your tier, and gain unmatched visibility.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {user ? (
              <Button variant="hero" size="lg" className="rounded-full" asChild>
                <Link to="/partner-dashboard">Go to Partner Dashboard</Link>
              </Button>
            ) : (
              <Button variant="hero" size="lg" className="rounded-full" asChild>
                <Link to="/auth">Sign Up as Partner</Link>
              </Button>
            )}
            <Button variant="outline" size="lg" className="rounded-full" asChild>
              <a href="#browse">Browse Events <ArrowRight className="h-4 w-4 ml-1" /></a>
            </Button>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-12 border-b">
        <div className="container max-w-5xl grid md:grid-cols-3 gap-8">
          {[
            { icon: Eye, title: "Brand Visibility", desc: "Get your logo in front of thousands of engaged event attendees across Africa." },
            { icon: TrendingUp, title: "Measurable Impact", desc: "Track views, clicks, and engagement from your sponsorship investment." },
            { icon: Award, title: "Custom Packages", desc: "Choose from preset tiers or propose a custom sponsorship deal." },
          ].map((item) => (
            <div key={item.title} className="text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Browse Events */}
      <section id="browse" className="py-12">
        <div className="container max-w-5xl">
          <h2 className="text-2xl font-bold mb-6">Events Seeking Sponsors</h2>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center rounded-full border bg-background px-3 h-10 gap-2 flex-1 max-w-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 rounded-full border bg-background px-4 text-sm outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {isLoading ? (
            <div className="text-center py-16 text-muted-foreground">Loading sponsorship opportunities...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Handshake className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground">No events seeking sponsors right now. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map((event) => {
                const eventTiers = tiers?.filter((t) => t.event_id === event.id) ?? [];
                const lowestPrice = eventTiers.length > 0 ? Math.min(...eventTiers.map((t) => Number(t.price))) : null;
                return (
                  <div key={event.id} className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-card">
                    <div className="aspect-[2.5/1] overflow-hidden relative">
                      <img
                        src={event.image_url || "/placeholder.svg"}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">{event.category}</Badge>
                    </div>
                    <div className="p-4 space-y-3">
                      <h3 className="font-bold text-lg line-clamp-1">{event.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{format(new Date(event.date), "MMM d, yyyy")}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{event.location.split(",").slice(0, 2).join(",")}</span>
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{event.capacity} capacity</span>
                      </div>
                      {event.sponsor_description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{event.sponsor_description}</p>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        <div>
                          {eventTiers.length > 0 ? (
                            <p className="text-sm font-medium">{eventTiers.length} tier{eventTiers.length !== 1 ? "s" : ""} · from <span className="text-primary font-bold">${lowestPrice}</span></p>
                          ) : (
                            <p className="text-sm text-muted-foreground">Custom offers accepted</p>
                          )}
                        </div>
                        <Button variant="hero" size="sm" className="rounded-full" asChild>
                          <Link to={`/event/${event.id}?sponsor=true`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <QantidFooter />
    </div>
  );
};

export default Partners;
