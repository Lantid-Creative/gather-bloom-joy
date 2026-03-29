import { useState } from "react";
import { Music, Plus, Trash2, Star, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
  sort_order: number;
  spotify_url: string;
  apple_music_url: string;
  soundcloud_url: string;
  instagram_url: string;
  twitter_url: string;
  website_url: string;
  spotify_embed_url: string;
  soundcloud_embed_url: string;
}

const emptyArtist = {
  name: "", photo_url: "", bio: "", genre: "", set_time: "", set_end_time: "",
  stage: "", headliner: false, spotify_url: "", apple_music_url: "", soundcloud_url: "",
  instagram_url: "", twitter_url: "", website_url: "", spotify_embed_url: "", soundcloud_embed_url: "",
};

const LineupManager = ({ eventId }: { eventId: string }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyArtist);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: artists } = useQuery({
    queryKey: ["lineup-artists", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_lineup_artists" as any)
        .select("*")
        .eq("event_id", eventId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data as any[]) as LineupArtist[];
    },
  });

  const updateField = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Artist name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("event_lineup_artists" as any).insert({
        event_id: eventId,
        ...form,
        sort_order: artists?.length ?? 0,
      } as any);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["lineup-artists", eventId] });
      setForm(emptyArtist);
      setAdding(false);
      toast({ title: "Artist added to lineup!" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("event_lineup_artists" as any).delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["lineup-artists", eventId] });
    toast({ title: "Artist removed" });
  };

  const toggleHeadliner = async (id: string, val: boolean) => {
    await supabase.from("event_lineup_artists" as any).update({ headliner: val } as any).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["lineup-artists", eventId] });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">LINE UP · Artist Lineup</h3>
        </div>
        <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setAdding(!adding)}>
          <Plus className="h-3 w-3 mr-1" /> Add Artist
        </Button>
      </div>

      {/* Add artist form */}
      {adding && (
        <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Artist Name *</Label>
              <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="e.g. Burna Boy" className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Genre</Label>
              <Input value={form.genre} onChange={(e) => updateField("genre", e.target.value)} placeholder="e.g. Afrobeats" className="h-8 text-xs" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Set Time</Label>
              <Input type="time" value={form.set_time} onChange={(e) => updateField("set_time", e.target.value)} className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">End Time</Label>
              <Input type="time" value={form.set_end_time} onChange={(e) => updateField("set_end_time", e.target.value)} className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Stage</Label>
              <Input value={form.stage} onChange={(e) => updateField("stage", e.target.value)} placeholder="Main Stage" className="h-8 text-xs" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Photo URL</Label>
            <Input value={form.photo_url} onChange={(e) => updateField("photo_url", e.target.value)} placeholder="https://..." className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Bio</Label>
            <Textarea value={form.bio} onChange={(e) => updateField("bio", e.target.value)} placeholder="Short artist bio..." className="text-xs min-h-[60px]" />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.headliner} onCheckedChange={(v) => updateField("headliner", v)} />
            <Label className="text-xs">Headliner</Label>
          </div>

          <p className="text-xs font-medium text-muted-foreground mt-2">Streaming Links</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Spotify URL</Label>
              <Input value={form.spotify_url} onChange={(e) => updateField("spotify_url", e.target.value)} placeholder="https://open.spotify.com/artist/..." className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Apple Music URL</Label>
              <Input value={form.apple_music_url} onChange={(e) => updateField("apple_music_url", e.target.value)} placeholder="https://music.apple.com/..." className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">SoundCloud URL</Label>
              <Input value={form.soundcloud_url} onChange={(e) => updateField("soundcloud_url", e.target.value)} placeholder="https://soundcloud.com/..." className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Instagram URL</Label>
              <Input value={form.instagram_url} onChange={(e) => updateField("instagram_url", e.target.value)} placeholder="https://instagram.com/..." className="h-8 text-xs" />
            </div>
          </div>

          <p className="text-xs font-medium text-muted-foreground mt-2">Embed URLs (for embedded players)</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Spotify Embed</Label>
              <Input value={form.spotify_embed_url} onChange={(e) => updateField("spotify_embed_url", e.target.value)} placeholder="https://open.spotify.com/embed/artist/..." className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">SoundCloud Embed</Label>
              <Input value={form.soundcloud_embed_url} onChange={(e) => updateField("soundcloud_embed_url", e.target.value)} placeholder="https://w.soundcloud.com/player/..." className="h-8 text-xs" />
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" className="text-xs" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Add to Lineup"}
            </Button>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setAdding(false); setForm(emptyArtist); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Artist list */}
      {artists && artists.length > 0 ? (
        <div className="space-y-2">
          {artists.map((artist) => (
            <div key={artist.id} className="border rounded-lg overflow-hidden">
              <div
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpanded(expanded === artist.id ? null : artist.id)}
              >
                {artist.photo_url ? (
                  <img src={artist.photo_url} alt={artist.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Music className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{artist.name}</span>
                    {artist.headliner && <Badge className="text-[10px] h-4 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-0"><Star className="h-2.5 w-2.5 mr-0.5" /> Headliner</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {artist.genre}{artist.set_time && ` · ${artist.set_time}`}{artist.set_end_time && `-${artist.set_end_time}`}{artist.stage && ` · ${artist.stage}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {artist.spotify_url && <Badge variant="outline" className="text-[10px] h-5 px-1.5">🎵</Badge>}
                  {expanded === artist.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>

              {expanded === artist.id && (
                <div className="px-3 pb-3 space-y-2 border-t bg-muted/10">
                  {artist.bio && <p className="text-xs text-muted-foreground pt-2">{artist.bio}</p>}
                  <div className="flex flex-wrap gap-1">
                    {artist.spotify_url && <a href={artist.spotify_url} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"><ExternalLink className="h-2.5 w-2.5" />Spotify</a>}
                    {artist.apple_music_url && <a href={artist.apple_music_url} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"><ExternalLink className="h-2.5 w-2.5" />Apple Music</a>}
                    {artist.soundcloud_url && <a href={artist.soundcloud_url} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"><ExternalLink className="h-2.5 w-2.5" />SoundCloud</a>}
                    {artist.instagram_url && <a href={artist.instagram_url} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"><ExternalLink className="h-2.5 w-2.5" />Instagram</a>}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex items-center gap-1">
                      <Switch checked={artist.headliner} onCheckedChange={(v) => toggleHeadliner(artist.id, v)} />
                      <span className="text-xs">Headliner</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs h-6 text-destructive ml-auto" onClick={() => handleDelete(artist.id)}>
                      <Trash2 className="h-3 w-3 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : !adding ? (
        <p className="text-xs text-muted-foreground">No artists added. Add performers to showcase your lineup.</p>
      ) : null}

      {/* Cross-posting hint */}
      {artists && artists.length > 0 && (
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-xs font-medium text-primary mb-1">🌐 Cross-Post Your Lineup</p>
          <p className="text-[11px] text-muted-foreground">
            Your lineup is live on the event page and the <a href="/lineups" className="text-primary underline">Lineups Discovery</a> page.
            Share your event link across Songkick, Bandsintown, Resident Advisor, and social media to reach more fans.
          </p>
        </div>
      )}
    </div>
  );
};

export default LineupManager;
