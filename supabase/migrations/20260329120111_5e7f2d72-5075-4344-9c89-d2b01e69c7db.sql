
-- Event ads / promoted events table
CREATE TABLE public.event_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT '',
  daily_budget numeric NOT NULL DEFAULT 5,
  total_budget numeric NOT NULL DEFAULT 50,
  spent numeric NOT NULL DEFAULT 0,
  cost_per_click numeric NOT NULL DEFAULT 0.10,
  impressions integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  conversions integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  placements text[] NOT NULL DEFAULT '{homepage,search,category,related}'::text[],
  start_date timestamp with time zone NOT NULL DEFAULT now(),
  end_date timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.event_ads ENABLE ROW LEVEL SECURITY;

-- Owners can CRUD their own ads
CREATE POLICY "Users can view own ads" ON public.event_ads FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create ads" ON public.event_ads FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own ads" ON public.event_ads FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own ads" ON public.event_ads FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Public read for the ad placement engine (active ads only)
CREATE POLICY "Anyone can view active ads" ON public.event_ads FOR SELECT TO anon, authenticated USING (status = 'active');

-- Function to record an ad impression
CREATE OR REPLACE FUNCTION public.record_ad_impression(p_ad_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE event_ads SET impressions = impressions + 1 WHERE id = p_ad_id AND status = 'active';
END;
$$;

-- Function to record an ad click
CREATE OR REPLACE FUNCTION public.record_ad_click(p_ad_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE event_ads SET clicks = clicks + 1, spent = spent + cost_per_click WHERE id = p_ad_id AND status = 'active';
  -- Auto-pause if budget exhausted
  UPDATE event_ads SET status = 'paused' WHERE id = p_ad_id AND spent >= total_budget;
END;
$$;
