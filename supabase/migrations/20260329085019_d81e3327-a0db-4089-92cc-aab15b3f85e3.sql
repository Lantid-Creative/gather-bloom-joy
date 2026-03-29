
-- Partner profiles (company info for sponsors)
CREATE TABLE public.partner_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  company_logo_url text DEFAULT '',
  website text DEFAULT '',
  industry text DEFAULT '',
  description text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.partner_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view partner profiles" ON public.partner_profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can create own partner profile" ON public.partner_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own partner profile" ON public.partner_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Sponsorship tiers (created by event organizers)
CREATE TABLE public.sponsorship_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  benefits text[] NOT NULL DEFAULT '{}',
  max_sponsors integer DEFAULT NULL,
  sponsors_count integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sponsorship_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sponsorship tiers" ON public.sponsorship_tiers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Event owners can create tiers" ON public.sponsorship_tiers FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM events WHERE events.id = sponsorship_tiers.event_id AND events.user_id = auth.uid()));
CREATE POLICY "Event owners can update tiers" ON public.sponsorship_tiers FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM events WHERE events.id = sponsorship_tiers.event_id AND events.user_id = auth.uid()));
CREATE POLICY "Event owners can delete tiers" ON public.sponsorship_tiers FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM events WHERE events.id = sponsorship_tiers.event_id AND events.user_id = auth.uid()));

-- Sponsorship requests (from partners to events)
CREATE TABLE public.sponsorship_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  tier_id uuid REFERENCES public.sponsorship_tiers(id) ON DELETE SET NULL,
  partner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  message text DEFAULT '',
  custom_offer_amount numeric DEFAULT NULL,
  custom_offer_benefits text DEFAULT '',
  stripe_session_id text DEFAULT NULL,
  payment_status text NOT NULL DEFAULT 'unpaid',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sponsorship_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view own requests" ON public.sponsorship_requests FOR SELECT TO authenticated USING (partner_id = auth.uid());
CREATE POLICY "Organizers can view requests for their events" ON public.sponsorship_requests FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM events WHERE events.id = sponsorship_requests.event_id AND events.user_id = auth.uid()));
CREATE POLICY "Partners can create requests" ON public.sponsorship_requests FOR INSERT TO authenticated WITH CHECK (partner_id = auth.uid());
CREATE POLICY "Organizers can update request status" ON public.sponsorship_requests FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM events WHERE events.id = sponsorship_requests.event_id AND events.user_id = auth.uid()));
CREATE POLICY "Partners can update own requests" ON public.sponsorship_requests FOR UPDATE TO authenticated USING (partner_id = auth.uid());

-- Add seeking_sponsors flag to events
ALTER TABLE public.events ADD COLUMN seeking_sponsors boolean NOT NULL DEFAULT false;
ALTER TABLE public.events ADD COLUMN sponsor_description text NOT NULL DEFAULT '';
