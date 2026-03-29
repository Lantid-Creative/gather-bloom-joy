import { Music, Star, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface LineupArtist {
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
  instagram_url: string;
  spotify_embed_url: string;
  soundcloud_embed_url: string;
}

const EventLineupDisplay = ({ eventId }: { eventId: string }) => {
  const { data: artists } = useQuery({
    queryKey: ["lineup-display", eventId],
    queryFn: async () => {
      const { data } = await supabase
        .from("event_lineup_artists")
        .select("*")
        .eq("event_id", eventId)
        .order("sort_order", { ascending: true });
      return (data ?? []) as LineupArtist[];
    },
  });

  if (!artists || artists.length === 0) return null;

  const headliners = artists.filter((a) => a.headliner);
  const others = artists.filter((a) => !a.headliner);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Music className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">LINE UP</h2>
        <Badge variant="secondary" className="text-xs">{artists.length} artists</Badge>
      </div>

      {/* Headliners */}
      {headliners.length > 0 && (
        <div className="space-y-3">
          {headliners.map((artist) => (
            <div key={artist.id} className="border rounded-xl overflow-hidden bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex gap-4 p-4">
                {artist.photo_url ? (
                  <img src={artist.photo_url} alt={artist.name} className="w-24 h-24 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Music className="h-10 w-10 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">{artist.name}</h3>
                    <Badge className="text-[10px] h-5 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-0">
                      <Star className="h-3 w-3 mr-0.5" /> Headliner
                    </Badge>
                  </div>
                  {artist.genre && <p className="text-sm text-primary font-medium">{artist.genre}</p>}
                  {artist.set_time && (
                    <p className="text-xs text-muted-foreground">
                      🕐 {artist.set_time}{artist.set_end_time && ` – ${artist.set_end_time}`}
                      {artist.stage && ` · ${artist.stage}`}
                    </p>
                  )}
                  {artist.bio && <p className="text-sm text-muted-foreground line-clamp-2">{artist.bio}</p>}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {artist.spotify_url && (
                      <a href={artist.spotify_url} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs text-green-600 hover:underline">
                        <ExternalLink className="h-3 w-3" /> Spotify
                      </a>
                    )}
                    {artist.apple_music_url && (
                      <a href={artist.apple_music_url} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs text-pink-600 hover:underline">
                        <ExternalLink className="h-3 w-3" /> Apple Music
                      </a>
                    )}
                    {artist.soundcloud_url && (
                      <a href={artist.soundcloud_url} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs text-orange-500 hover:underline">
                        <ExternalLink className="h-3 w-3" /> SoundCloud
                      </a>
                    )}
                    {artist.instagram_url && (
                      <a href={artist.instagram_url} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs text-purple-500 hover:underline">
                        <ExternalLink className="h-3 w-3" /> Instagram
                      </a>
                    )}
                  </div>
                </div>
              </div>
              {/* Embedded player */}
              {artist.spotify_embed_url && (
                <div className="px-4 pb-4">
                  <iframe
                    src={artist.spotify_embed_url}
                    width="100%"
                    height="80"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="rounded-lg"
                    title={`${artist.name} on Spotify`}
                  />
                </div>
              )}
              {!artist.spotify_embed_url && artist.soundcloud_embed_url && (
                <div className="px-4 pb-4">
                  <iframe
                    width="100%"
                    height="80"
                    scrolling="no"
                    frameBorder="no"
                    allow="autoplay"
                    src={artist.soundcloud_embed_url}
                    className="rounded-lg"
                    title={`${artist.name} on SoundCloud`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Other artists */}
      {others.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {others.map((artist) => (
            <div key={artist.id} className="border rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-3">
                {artist.photo_url ? (
                  <img src={artist.photo_url} alt={artist.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Music className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm">{artist.name}</h4>
                  {artist.genre && <p className="text-xs text-primary">{artist.genre}</p>}
                  {artist.set_time && (
                    <p className="text-[11px] text-muted-foreground">
                      🕐 {artist.set_time}{artist.set_end_time && `–${artist.set_end_time}`}
                      {artist.stage && ` · ${artist.stage}`}
                    </p>
                  )}
                </div>
              </div>
              {artist.bio && <p className="text-xs text-muted-foreground line-clamp-2">{artist.bio}</p>}
              <div className="flex flex-wrap gap-2">
                {artist.spotify_url && <a href={artist.spotify_url} target="_blank" rel="noopener" className="text-[10px] text-green-600 hover:underline">Spotify</a>}
                {artist.apple_music_url && <a href={artist.apple_music_url} target="_blank" rel="noopener" className="text-[10px] text-pink-600 hover:underline">Apple Music</a>}
                {artist.soundcloud_url && <a href={artist.soundcloud_url} target="_blank" rel="noopener" className="text-[10px] text-orange-500 hover:underline">SoundCloud</a>}
              </div>
              {/* Compact embedded player */}
              {artist.spotify_embed_url && (
                <iframe
                  src={artist.spotify_embed_url}
                  width="100%"
                  height="80"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded-lg"
                  title={`${artist.name} on Spotify`}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventLineupDisplay;
