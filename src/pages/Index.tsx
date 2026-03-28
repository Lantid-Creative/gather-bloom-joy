import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import EventbriteHeader from "@/components/EventbriteHeader";
import EventbriteFooter from "@/components/EventbriteFooter";
import CategoryIcons from "@/components/CategoryIcons";
import BrowsingTabs from "@/components/BrowsingTabs";
import EventbriteCard from "@/components/EventbriteCard";
import DestinationCards from "@/components/DestinationCards";
import { mockEvents } from "@/lib/mock-data";
import heroMusic from "@/assets/hero-music.jpg";

const Index = () => {
  const [category, setCategory] = useState("");
  const [tab, setTab] = useState("All");

  const filtered = useMemo(() => {
    return mockEvents.filter((e) => {
      if (category && e.category !== category) return false;
      return true;
    });
  }, [category]);

  return (
    <div className="min-h-screen bg-background">
      <EventbriteHeader />

      {/* Hero Banner */}
      <section className="relative overflow-hidden mx-4 md:mx-8 mt-2 rounded-xl">
        <div className="relative h-[280px] md:h-[360px]">
          <img
            src={heroMusic}
            alt="Get into live music"
            className="absolute inset-0 h-full w-full object-cover"
            width={1920}
            height={640}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/50 to-transparent" />
          <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-16 max-w-xl">
            <p className="text-sm font-bold text-primary-foreground/80 tracking-wider uppercase mb-2">
              Get into it
            </p>
            <h1 className="text-3xl md:text-5xl font-black text-primary-foreground leading-tight">
              <span className="bg-primary/80 px-2 py-0.5 inline-block mb-1">FROM POP BALLADS</span>
              <br />
              <span className="bg-primary/80 px-2 py-0.5 inline-block">TO EMO ENCORES</span>
            </h1>
            <div className="mt-6">
              <button className="bg-background text-foreground font-bold text-sm px-6 py-3 rounded-full hover:bg-background/90 transition-colors">
                Get Into Live Music
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Icons */}
      <div className="container">
        <CategoryIcons
          onSelect={(cat) => setCategory(cat === category ? "" : cat)}
          active={category}
        />
      </div>

      {/* Divider */}
      <div className="border-t" />

      {/* Browsing Events Section */}
      <div className="container py-8">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold">Browsing events in</h2>
          <button className="flex items-center gap-1 text-2xl font-bold text-eb-blue">
            <ChevronDown className="h-5 w-5" />
            Your Location
          </button>
        </div>

        <BrowsingTabs active={tab} onChange={setTab} />

        {/* Event Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {filtered.map((event) => (
            <EventbriteCard key={event.id} event={event} />
          ))}
        </div>

        {/* Load more */}
        <div className="flex justify-center mt-10">
          <button className="text-sm font-semibold text-eb-blue hover:underline">
            See more
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t" />

      {/* Top Destinations */}
      <div className="container">
        <DestinationCards />
      </div>

      {/* Footer */}
      <EventbriteFooter />
    </div>
  );
};

export default Index;
