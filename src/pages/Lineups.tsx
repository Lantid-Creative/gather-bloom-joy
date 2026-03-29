import { useState } from "react";
import { Link } from "react-router-dom";
import { Music, Search, Star, MapPin, Calendar, ExternalLink, Filter } from "lucide-react";
import EventbriteHeader from "@/components/EventbriteHeader";
import EventbriteFooter from "@/components/EventbriteFooter";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import SEOHead from "@/components/SEOHead";

interface ArtistWithEvent {
  id: string;
  name: string;
  photo_url: string;
  bio: string;
  genre: string;
  set_time: string;
  set_end_time: string;
  stage: string;
  headliner: boolean;
  spotify_url: string;
  apple_music_url: string;
  soundcloud_url: string;
  spotify_embed_url: string;
  event_id: string;
  event_title?: string;
  event_date?: string;
  event_location?: string;
  event_image_url?: string;
}

const GENRES = ["All", "Afrobeats", "Amapiano", "Hip-Hop", "R&B", "Reggae", "Dancehall", "Gospel", "Jazz", "Electronic", "Rock", "Pop", "Highlife", "Bongo Flava", "Gqom"];

const Lineups = () => {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");

  const { data: artists, isLoading } = useQuery({
    queryKey: ["lineups-discovery"],
    queryFn: async () => {
      const { data: lineupArtists } = await supabase
        .from("event_lineup_artists")
        .select("*")
        .order("headliner", { ascending: false });

      if (!lineupArtists?.length) return [];

      const eventIds = [...new Set((lineupArtists as any[]).map((a: any) => a.event_id))];
      const { data: events } = await supabase
        .from("events")
        .select("id, title, date, location, image_url")
        .in("id", eventIds)
        .gte("date", new Date().toISOString());

      return (lineupArtists as any[]).map((a: any) => {
        const evt = events?.find((e) => e.id === a.event_id);
        if (!evt) return null;
        return { ...a, event_title: evt.title, event_date: evt.date, event_location: evt.location, event_image_url: evt.image_url };
      }).filter(Boolean) as ArtistWithEvent[];
    },
  });

  const filtered = artists?.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !search || a.name.toLowerCase().includes(q) || (a.event_title?.toLowerCase().includes(q)) || a.genre.toLowerCase().includes(q);
    const matchGenre = genre === "All" || a.genre.toLowerCase() === genre.toLowerCase();
    return matchSearch && matchGenre;
  }) ?? [];

  // Group by event
  const eventGroups = filtered.reduce<Record<string, { event: { id: string; title: string; date: string; location: string; image_url: string }; artists: ArtistWithEvent[] }>>((acc, a) => {
    if (!acc[a.event_id]) {
      acc[a.event_id] = {
        event: { id: a.event_id, title: a.event_title!, date: a.event_date!, location: a.event_location!, image_url: a.event_image_url! },
        artists: [],
      };
    }
    acc[a.event_id].artists.push(a);
    return acc;
  }, {});

  const sortedGroups = Object.values(eventGroups).sort((a, b) => new Date(a.event.date).getTime() - new Date(b.event.date).getTime());

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Lineups | Afritickets" description="Discover upcoming event lineups, artists, and performers across Africa." />
      <EventbriteHeader />

      <div className="container max-w-5xl py-8 space-y-6">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Music className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">LINE UP</h1>
          </div>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Discover artists and performers at upcoming events. Find your favorite acts, preview their music, and grab your tickets.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search artists, events, or genres..." className="pl-10" />
          </div>
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GENRES.map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading lineups...</div>
        ) : sortedGroups.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <Music className="h-12 w-12 mx-auto text-muted-foreground opacity-40" />
            <p className="text-muted-foreground">No lineups found. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedGroups.map(({ event, artists: eventArtists }) => (
              <div key={event.id} className="border rounded-2xl overflow-hidden">
                {/* Event header */}
                <Link to={`/event/${event.id}`} className="block">
                  <div className="relative h-36 bg-muted">
                    {event.image_url && (
                      <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h2 className="text-xl font-bold">{event.title}</h2>
                      <div className="flex flex-wrap items-center gap-3 text-sm opacity-90 mt-1">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(event.date), "EEE, MMM d · h:mm a")}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>
                        <Badge variant="secondary" className="text-[10px]">{eventArtists.length} artists</Badge>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Artists */}
                <div className="p-4 space-y-3">
                  {/* Headliners first */}
                  {eventArtists.filter((a) => a.headliner).map((artist) => (
                    <div key={artist.id} className="flex gap-4 p-3 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border">
                      {artist.photo_url ? (
                        <img src={artist.photo_url} alt={artist.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Music className="h-7 w-7 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{artist.name}</span>
                          <Badge className="text-[10px] h-4 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-0">
                            <Star className="h-2.5 w-2.5 mr-0.5" /> Headliner
                          </Badge>
                        </div>
                        {artist.genre && <p className="text-xs text-primary font-medium">{artist.genre}</p>}
                        {artist.set_time && <p className="text-[11px] text-muted-foreground">🕐 {artist.set_time}{artist.set_end_time && `–${artist.set_end_time}`}{artist.stage && ` · ${artist.stage}`}</p>}
                        <div className="flex flex-wrap gap-2 pt-0.5">
                          {artist.spotify_url && <a href={artist.spotify_url} target="_blank" rel="noopener" className="text-[10px] text-green-600 hover:underline flex items-center gap-0.5"><ExternalLink className="h-2.5 w-2.5" />Spotify</a>}
                          {artist.apple_music_url && <a href={artist.apple_music_url} target="_blank" rel="noopener" className="text-[10px] text-pink-600 hover:underline flex items-center gap-0.5"><ExternalLink className="h-2.5 w-2.5" />Apple Music</a>}
                          {artist.soundcloud_url && <a href={artist.soundcloud_url} target="_blank" rel="noopener" className="text-[10px] text-orange-500 hover:underline flex items-center gap-0.5"><ExternalLink className="h-2.5 w-2.5" />SoundCloud</a>}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Other artists in compact grid */}
                  {eventArtists.filter((a) => !a.headliner).length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {eventArtists.filter((a) => !a.headliner).map((artist) => (
                        <div key={artist.id} className="flex items-center gap-2 p-2 rounded-lg border">
                          {artist.photo_url ? (
                            <img src={artist.photo_url} alt={artist.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <Music className="h-3.5 w-3.5 text-primary" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{artist.name}</p>
                            {artist.genre && <p className="text-[10px] text-muted-foreground">{artist.genre}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Link to={`/event/${event.id}`}>
                    <Button variant="outline" size="sm" className="w-full text-xs mt-2">
                      View Full Lineup & Get Tickets →
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <EventbriteFooter />
    </div>
  );
};

export default Lineups;
