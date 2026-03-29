
-- Flash Sales table
CREATE TABLE public.flash_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name text NOT NULL,
  discount_type text NOT NULL DEFAULT 'percentage',
  discount_value numeric NOT NULL DEFAULT 10,
  starts_at timestamp with time zone NOT NULL,
  ends_at timestamp with time zone NOT NULL,
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  applies_to_ticket_ids uuid[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.flash_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active flash sales" ON public.flash_sales
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Event owners can create flash sales" ON public.flash_sales
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM events WHERE events.id = flash_sales.event_id AND events.user_id = auth.uid()));

CREATE POLICY "Event owners can update flash sales" ON public.flash_sales
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = flash_sales.event_id AND events.user_id = auth.uid()));

CREATE POLICY "Event owners can delete flash sales" ON public.flash_sales
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = flash_sales.event_id AND events.user_id = auth.uid()));

-- Referral / Affiliate program tables
CREATE TABLE public.referral_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  commission_type text NOT NULL DEFAULT 'percentage',
  commission_value numeric NOT NULL DEFAULT 10,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(event_id)
);

ALTER TABLE public.referral_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view referral programs" ON public.referral_programs
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Event owners can manage referral programs" ON public.referral_programs
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM events WHERE events.id = referral_programs.event_id AND events.user_id = auth.uid()));

CREATE POLICY "Event owners can update referral programs" ON public.referral_programs
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = referral_programs.event_id AND events.user_id = auth.uid()));

CREATE POLICY "Event owners can delete referral programs" ON public.referral_programs
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = referral_programs.event_id AND events.user_id = auth.uid()));

CREATE TABLE public.referral_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.referral_programs(id) ON DELETE CASCADE,
  referrer_id uuid NOT NULL,
  code text NOT NULL,
  clicks integer NOT NULL DEFAULT 0,
  conversions integer NOT NULL DEFAULT 0,
  total_earned numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(program_id, referrer_id)
);

ALTER TABLE public.referral_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral links" ON public.referral_links
  FOR SELECT TO authenticated USING (referrer_id = auth.uid());

CREATE POLICY "Anyone can view referral links by code" ON public.referral_links
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Users can create referral links" ON public.referral_links
  FOR INSERT TO authenticated WITH CHECK (referrer_id = auth.uid());

CREATE POLICY "Users can update own referral links" ON public.referral_links
  FOR UPDATE TO authenticated USING (referrer_id = auth.uid());

-- Referral conversions tracking
CREATE TABLE public.referral_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_link_id uuid NOT NULL REFERENCES public.referral_links(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  commission_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referrers can view own conversions" ON public.referral_conversions
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM referral_links WHERE referral_links.id = referral_conversions.referral_link_id AND referral_links.referrer_id = auth.uid()
  ));

CREATE POLICY "System can create conversions" ON public.referral_conversions
  FOR INSERT TO authenticated WITH CHECK (true);

-- Social media posts scheduling
CREATE TABLE public.scheduled_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  platform text NOT NULL,
  content text NOT NULL,
  scheduled_at timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  posted_at timestamp with time zone,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own posts" ON public.scheduled_posts
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can create posts" ON public.scheduled_posts
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own posts" ON public.scheduled_posts
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can delete own posts" ON public.scheduled_posts
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Function to track referral clicks
CREATE OR REPLACE FUNCTION public.track_referral_click(p_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE referral_links SET clicks = clicks + 1 WHERE code = p_code;
END;
$$;

-- Function to use flash sale discount
CREATE OR REPLACE FUNCTION public.get_active_flash_sale(p_event_id uuid, p_ticket_type_id uuid)
RETURNS TABLE(discount_type text, discount_value numeric, sale_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT fs.discount_type, fs.discount_value, fs.name
  FROM flash_sales fs
  WHERE fs.event_id = p_event_id
    AND fs.is_active = true
    AND now() >= fs.starts_at
    AND now() <= fs.ends_at
    AND (fs.max_uses IS NULL OR fs.used_count < fs.max_uses)
    AND (fs.applies_to_ticket_ids = '{}' OR p_ticket_type_id = ANY(fs.applies_to_ticket_ids))
  ORDER BY fs.discount_value DESC
  LIMIT 1;
END;
$$;
