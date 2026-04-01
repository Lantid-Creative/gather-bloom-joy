import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, X, Sparkles } from "lucide-react";
import QantidHeader from "@/components/QantidHeader";
import QantidFooter from "@/components/QantidFooter";
import CategoryIcons from "@/components/CategoryIcons";
import BrowsingTabs from "@/components/BrowsingTabs";
import QantidCard from "@/components/QantidCard";
import DestinationCards from "@/components/DestinationCards";
import { useEvents } from "@/hooks/useEvents";

import FeaturesShowcase from "@/components/FeaturesShowcase";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import SmartRecommendations from "@/components/SmartRecommendations";
import PromotedEventCard from "@/components/PromotedEventCard";
import { usePromotedEvents } from "@/hooks/usePromotedEvents";
import heroAfro from "@/assets/hero-afro.jpg";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";
  const cityQuery = searchParams.get("city") ?? "";
  const [category, setCategory] = useState("");
  const [city, setCity] = useState(cityQuery);
  const [cityOpen, setCityOpen] = useState(false);
  const [tab, setTab] = useState("All");
  const { data: dbEvents, isLoading } = useEvents();
  const [aiSearchResults, setAiSearchResults] = useState<string[] | null>(null);
  const [aiSearching, setAiSearching] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState("");
  const { data: promotedAds } = usePromotedEvents("homepage");

  const allEvents = useMemo(() => {
    const db = dbEvents ?? [];
    // Merge DB events with mock events, DB takes priority (no duplicates by title)
    const dbTitles = new Set(db.map((e) => e.title.toLowerCase()));
    const uniqueMocks = mockEvents.filter((m) => !dbTitles.has(m.title.toLowerCase()));
    return [...db, ...uniqueMocks];
  }, [dbEvents]);

  // Extract unique cities from events
  const cities = useMemo(() => {
    const citySet = new Set<string>();
    allEvents.forEach((e) => {
      // Extract city from location (typically "Venue, City, Country" or "City, Country")
      const parts = e.location.split(",").map((p) => p.trim());
      if (parts.length >= 2) {
        citySet.add(parts[parts.length - 2]); // second-to-last is usually the city
      }
    });
    return Array.from(citySet).sort();
  }, [allEvents]);

  // Sync city from URL param
  useEffect(() => {
    setCity(cityQuery);
  }, [cityQuery]);

  // Detect if search is "smart" (natural language, 3+ words)
  const isSmartSearch = searchQuery.trim().split(/\s+/).length >= 3;

  // AI search effect
  useEffect(() => {
    if (!isSmartSearch || !searchQuery.trim() || allEvents.length === 0) {
      setAiSearchResults(null);
      setAiInterpretation("");
      return;
    }

    let cancelled = false;
    const runAiSearch = async () => {
      setAiSearching(true);
      try {
        const { data, error } = await supabase.functions.invoke("ai-event-tools", {
          body: {
            action: "smart_search",
            query: searchQuery,
            events: allEvents.slice(0, 50), // limit to avoid token overflow
          },
        });
        if (cancelled) return;
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        setAiSearchResults(data.event_ids || []);
        setAiInterpretation(data.interpretation || "");
      } catch (e) {
        console.error("AI search failed, falling back to basic:", e);
        setAiSearchResults(null);
      } finally {
        if (!cancelled) setAiSearching(false);
      }
    };

    const timeout = setTimeout(runAiSearch, 300); // debounce
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [searchQuery, isSmartSearch, allEvents]);

  const filtered = useMemo(() => {
    // If AI search returned results, use those
    if (aiSearchResults !== null && isSmartSearch) {
      return aiSearchResults
        .map((id) => allEvents.find((e) => e.id === id))
        .filter(Boolean) as typeof allEvents;
    }

    const q = searchQuery.toLowerCase().trim();
    return allEvents.filter((e) => {
      if (category && e.category !== category) return false;
      if (city && !e.location.toLowerCase().includes(city.toLowerCase())) return false;
      if (q) {
        const matchTitle = e.title.toLowerCase().includes(q);
        const matchLocation = e.location.toLowerCase().includes(q);
        const matchTags = e.tags.some((t) => t.toLowerCase().includes(q));
        const matchOrganizer = e.organizer.toLowerCase().includes(q);
        if (!matchTitle && !matchLocation && !matchTags && !matchOrganizer) return false;
      }
      return true;
    });
  }, [category, city, allEvents, searchQuery, aiSearchResults, isSmartSearch]);

  const clearSearch = () => {
    setSearchParams({});
    setAiSearchResults(null);
    setAiInterpretation("");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={searchQuery ? `Search: ${searchQuery}` : undefined}
        description="Africa's #1 event ticketing platform. Discover concerts, festivals, conferences and cultural events across Lagos, Nairobi, Accra, Johannesburg and 50+ African cities."
      />
      <QantidHeader />

      {/* Hero Banner */}
      <section className="relative overflow-hidden mx-4 md:mx-8 mt-2 rounded-xl">
        <div className="relative h-[280px] md:h-[360px]">
          <img
            src={heroAfro}
            alt="Get into Afrobeats"
            className="absolute inset-0 h-full w-full object-cover"
            width={1920}
            height={640}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 to-transparent" />
          <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-16 max-w-xl">
            <p className="text-sm font-bold text-primary-foreground/80 tracking-wider uppercase mb-2">
              Feel the rhythm
            </p>
            <h1 className="text-3xl md:text-5xl font-black text-primary-foreground leading-tight">
              <span className="bg-primary/80 px-2 py-0.5 inline-block mb-1">FROM AFROBEATS</span>
              <br />
              <span className="bg-primary/80 px-2 py-0.5 inline-block">TO AMAPIANO</span>
            </h1>
            <div className="mt-6">
              <button
                onClick={() => { setCategory("Music"); window.scrollTo({ top: document.getElementById("events-section")?.offsetTop ?? 600, behavior: "smooth" }); }}
                className="bg-background text-foreground font-bold text-sm px-6 py-3 rounded-full hover:bg-background/90 transition-colors"
              >
                Get Into Live Music
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Icons */}
      <div id="events-section" className="container">
        <CategoryIcons
          onSelect={(cat) => setCategory(cat === category ? "" : cat)}
          active={category}
        />
      </div>

      {/* Divider */}
      <div className="border-t" />

      {/* Browsing Events Section */}
      <div className="container py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-bold">
              {searchQuery
                ? `Results for "${searchQuery}"`
                : category
                  ? `${category} events`
                  : "Browsing events in"}
            </h2>
            <div className="relative">
              <button
                onClick={() => setCityOpen(!cityOpen)}
                className="flex items-center gap-1 text-2xl font-bold text-primary"
              >
                {city || "All Cities"}
                <ChevronDown className={`h-5 w-5 transition-transform ${cityOpen ? "rotate-180" : ""}`} />
              </button>
              {cityOpen && (
                <div className="absolute top-full left-0 mt-2 bg-card border rounded-xl shadow-lg z-50 py-2 min-w-[200px] max-h-[300px] overflow-y-auto">
                  <button
                    onClick={() => { setCity(""); setCityOpen(false); setSearchParams(prev => { prev.delete("city"); return prev; }); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${!city ? "font-bold text-primary" : ""}`}
                  >
                    All Cities
                  </button>
                  {cities.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setCity(c); setCityOpen(false); setSearchParams(prev => { if (c) prev.set("city", c); else prev.delete("city"); return prev; }); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${city === c ? "font-bold text-primary" : ""}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {(category || searchQuery || city) && (
            <button
              onClick={() => { setCategory(""); setCity(""); setSearchParams(new URLSearchParams()); clearSearch(); }}
              className="text-sm font-medium text-primary hover:underline"
            >
              Clear filter ✕
            </button>
          )}
        </div>

        {(category || searchQuery) && (
          <div className="mb-4 space-y-1">
            <p className="text-sm text-muted-foreground">
              {aiSearching ? (
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse text-primary" />
                  AI is searching for you...
                </span>
              ) : (
                <>Showing {filtered.length} event{filtered.length !== 1 ? "s" : ""}</>
              )}
            </p>
            {aiInterpretation && isSmartSearch && (
              <p className="text-xs text-primary/80 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {aiInterpretation}
              </p>
            )}
          </div>
        )}

        <BrowsingTabs active={tab} onChange={setTab} />

        {/* Promoted Events */}
        {promotedAds && promotedAds.length > 0 && !searchQuery && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Promoted Events</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {promotedAds.map((ad) => {
                const event = allEvents.find((e) => e.id === ad.event_id);
                if (!event) return null;
                return <PromotedEventCard key={ad.ad_id} event={event} adId={ad.ad_id} />;
              })}
            </div>
          </div>
        )}

        {/* Event Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="aspect-[16/9] rounded-lg bg-muted" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="col-span-full text-center py-12 space-y-3">
              <p className="text-lg font-semibold">No events found</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? `No results for "${searchQuery}".`
                  : `No ${category} events right now.`}{" "}
                <button onClick={() => { setCategory(""); clearSearch(); }} className="text-primary hover:underline">Browse all events</button>
              </p>
            </div>
          ) : (
            filtered.map((event) => (
              <QantidCard key={event.id} event={event} />
            ))
          )}
        </div>

        {/* Load more */}
        <div className="flex justify-center mt-10">
          <button className="text-sm font-semibold text-eb-blue hover:underline">
            See more
          </button>
        </div>
      </div>

      {/* Smart Recommendations */}
      <SmartRecommendations allEvents={allEvents} />

      {/* Divider */}
      <div className="border-t" />

      {/* Features Showcase */}
      <FeaturesShowcase />

      {/* Divider */}
      <div className="border-t" />

      {/* Top Destinations */}
      <div className="container">
        <DestinationCards />
      </div>

      {/* Footer */}
      <QantidFooter />
    </div>
  );
};

export default Index;
