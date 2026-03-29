import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Star, Users, Instagram, Youtube, Twitter, Filter } from "lucide-react";
import EventbriteHeader from "@/components/EventbriteHeader";
import EventbriteFooter from "@/components/EventbriteFooter";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const serviceCategories = [
  "All",
  "Event Promotion",
  "Product Review",
  "Social Media Campaign",
  "Brand Ambassador",
  "Content Creation",
  "Live Streaming",
  "Photography",
  "Video Production",
];

const regions = [
  "All Regions",
  "West Africa",
  "East Africa",
  "Southern Africa",
  "North Africa",
  "Central Africa",
];

const Influencers = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [showFilters, setShowFilters] = useState(false);

  const { data: influencers, isLoading } = useQuery({
    queryKey: ["influencers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("influencer_profiles")
        .select("*, influencer_services(*)")
        .eq("is_available", true)
        .order("total_jobs", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const totalFollowers = (inf: any) =>
    (inf.instagram_followers || 0) +
    (inf.tiktok_followers || 0) +
    (inf.twitter_followers || 0) +
    (inf.youtube_subscribers || 0) +
    (inf.facebook_followers || 0);

  const formatFollowers = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  };

  const filtered = influencers?.filter((inf) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      inf.display_name.toLowerCase().includes(q) ||
      inf.bio.toLowerCase().includes(q) ||
      inf.city.toLowerCase().includes(q) ||
      inf.country.toLowerCase().includes(q) ||
      inf.categories?.some((c: string) => c.toLowerCase().includes(q));
    const matchesCategory =
      selectedCategory === "All" ||
      inf.categories?.includes(selectedCategory) ||
      (inf as any).influencer_services?.some((s: any) => s.category === selectedCategory);
    const matchesRegion =
      selectedRegion === "All Regions" || inf.region === selectedRegion;
    return matchesSearch && matchesCategory && matchesRegion;
  }) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <EventbriteHeader />

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16">
        <div className="container max-w-5xl text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">Find Influencers</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover talented influencers across Africa to promote your events, products, and brand. Hire with confidence using our secure escrow payment system.
          </p>
          <div className="flex items-center gap-2 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, skill, or location..."
                className="pl-10 h-12 rounded-full"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full shrink-0"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl py-8">
        {/* Filters */}
        {showFilters && (
          <div className="mb-6 p-4 rounded-xl border bg-surface space-y-4">
            <div>
              <p className="text-sm font-semibold mb-2">Category</p>
              <div className="flex flex-wrap gap-2">
                {serviceCategories.map((cat) => (
                  <Badge
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "secondary"}
                    className="cursor-pointer rounded-full"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold mb-2">Region</p>
              <div className="flex flex-wrap gap-2">
                {regions.map((r) => (
                  <Badge
                    key={r}
                    variant={selectedRegion === r ? "default" : "secondary"}
                    className="cursor-pointer rounded-full"
                    onClick={() => setSelectedRegion(r)}
                  >
                    {r}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Category chips (always visible) */}
        <div className="flex flex-wrap gap-2 mb-6">
          {serviceCategories.map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className="cursor-pointer rounded-full"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse rounded-xl border p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-full bg-muted" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
                <div className="h-12 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Users className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">No influencers found</h2>
            <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((inf) => (
              <Link
                key={inf.id}
                to={`/influencer/${inf.id}`}
                className="group border rounded-xl overflow-hidden hover:shadow-md transition-all"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                      {inf.avatar_url ? (
                        <img src={inf.avatar_url} alt={inf.display_name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-primary">{inf.display_name[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                        {inf.display_name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{inf.city}{inf.city && inf.country ? ", " : ""}{inf.country}</span>
                      </div>
                    </div>
                    {inf.avg_rating > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold">{Number(inf.avg_rating).toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">{inf.bio || "Available for hire"}</p>

                  {/* Social stats */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {inf.instagram_followers > 0 && (
                      <span className="flex items-center gap-1">
                        <Instagram className="h-3 w-3" /> {formatFollowers(inf.instagram_followers)}
                      </span>
                    )}
                    {inf.youtube_subscribers > 0 && (
                      <span className="flex items-center gap-1">
                        <Youtube className="h-3 w-3" /> {formatFollowers(inf.youtube_subscribers)}
                      </span>
                    )}
                    {inf.twitter_followers > 0 && (
                      <span className="flex items-center gap-1">
                        <Twitter className="h-3 w-3" /> {formatFollowers(inf.twitter_followers)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {formatFollowers(totalFollowers(inf))} total
                    </span>
                  </div>

                  {/* Categories */}
                  {inf.categories?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {inf.categories.slice(0, 3).map((cat: string) => (
                        <Badge key={cat} variant="secondary" className="text-[10px] rounded-full">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Price + stats */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-semibold text-primary">
                      {inf.min_budget > 0 ? `From $${Number(inf.min_budget).toFixed(0)}` : "Contact for pricing"}
                    </span>
                    <span className="text-xs text-muted-foreground">{inf.total_jobs} jobs completed</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <EventbriteFooter />
    </div>
  );
};

export default Influencers;
