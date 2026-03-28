import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import EventFilters from "@/components/EventFilters";
import { mockEvents } from "@/lib/mock-data";
import heroImage from "@/assets/hero-events.jpg";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    return mockEvents.filter((e) => {
      const matchesSearch =
        !search ||
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase()) ||
        e.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCat = category === "All" || e.category === category;
      return matchesSearch && matchesCat;
    });
  }, [search, category]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[480px] overflow-hidden">
        <img
          src={heroImage}
          alt="Discover amazing events"
          className="absolute inset-0 h-full w-full object-cover"
          width={1920}
          height={960}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent" />
        <div className="container relative z-10 flex h-full flex-col justify-end pb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground max-w-2xl leading-tight">
            Discover events that inspire
          </h1>
          <p className="mt-4 text-lg text-primary-foreground/80 max-w-lg">
            Find and book tickets to the best conferences, festivals, workshops, and experiences near you.
          </p>
          <div className="mt-6">
            <Button variant="hero" size="lg" className="rounded-full" asChild>
              <a href="#events">
                Explore Events <ArrowRight className="h-4 w-4 ml-1" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="container py-12 space-y-8">
        <div>
          <h2 className="text-2xl font-bold">Upcoming Events</h2>
          <p className="text-muted-foreground mt-1">Find your next unforgettable experience</p>
        </div>

        <EventFilters onSearch={setSearch} onCategory={setCategory} activeCategory={category} />

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">No events found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t bg-surface py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">E</span>
                </div>
                <span className="text-xl font-bold">Eventio</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                Your destination for discovering and booking the best events around the world.
              </p>
            </div>
            <div className="flex gap-12 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold">Product</h4>
                <p className="text-muted-foreground">Browse Events</p>
                <p className="text-muted-foreground">Create Event</p>
                <p className="text-muted-foreground">Pricing</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Company</h4>
                <p className="text-muted-foreground">About</p>
                <p className="text-muted-foreground">Blog</p>
                <p className="text-muted-foreground">Careers</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t text-sm text-muted-foreground">
            © 2026 Eventio. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
