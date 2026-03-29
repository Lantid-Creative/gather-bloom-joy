
-- Lineup artists table for event performer management
CREATE TABLE public.event_lineup_artists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  photo_url TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  genre TEXT NOT NULL DEFAULT '',
  set_time TEXT NOT NULL DEFAULT '',
  set_end_time TEXT NOT NULL DEFAULT '',
  stage TEXT NOT NULL DEFAULT '',
  headliner BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  spotify_url TEXT NOT NULL DEFAULT '',
  apple_music_url TEXT NOT NULL DEFAULT '',
  soundcloud_url TEXT NOT NULL DEFAULT '',
  instagram_url TEXT NOT NULL DEFAULT '',
  twitter_url TEXT NOT NULL DEFAULT '',
  website_url TEXT NOT NULL DEFAULT '',
  spotify_embed_url TEXT NOT NULL DEFAULT '',
  soundcloud_embed_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.event_lineup_artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lineup artists"
  ON public.event_lineup_artists FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Event owners can create lineup artists"
  ON public.event_lineup_artists FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM events WHERE events.id = event_lineup_artists.event_id AND events.user_id = auth.uid()));

CREATE POLICY "Event owners can update lineup artists"
  ON public.event_lineup_artists FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = event_lineup_artists.event_id AND events.user_id = auth.uid()));

CREATE POLICY "Event owners can delete lineup artists"
  ON public.event_lineup_artists FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = event_lineup_artists.event_id AND events.user_id = auth.uid()));
