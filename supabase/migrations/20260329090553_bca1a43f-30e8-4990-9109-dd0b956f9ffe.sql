
-- Influencer profiles
CREATE TABLE public.influencer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  display_name text NOT NULL,
  bio text NOT NULL DEFAULT '',
  avatar_url text DEFAULT '',
  region text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  categories text[] NOT NULL DEFAULT '{}',
  instagram_url text DEFAULT '',
  instagram_followers integer DEFAULT 0,
  tiktok_url text DEFAULT '',
  tiktok_followers integer DEFAULT 0,
  twitter_url text DEFAULT '',
  twitter_followers integer DEFAULT 0,
  youtube_url text DEFAULT '',
  youtube_subscribers integer DEFAULT 0,
  facebook_url text DEFAULT '',
  facebook_followers integer DEFAULT 0,
  linkedin_url text DEFAULT '',
  linkedin_followers integer DEFAULT 0,
  proof_screenshots text[] NOT NULL DEFAULT '{}',
  hourly_rate numeric DEFAULT 0,
  min_budget numeric DEFAULT 0,
  is_available boolean NOT NULL DEFAULT true,
  total_jobs integer NOT NULL DEFAULT 0,
  avg_rating numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.influencer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view influencer profiles" ON public.influencer_profiles
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Users can create own influencer profile" ON public.influencer_profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own influencer profile" ON public.influencer_profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Influencer services
CREATE TABLE public.influencer_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id uuid NOT NULL REFERENCES public.influencer_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  delivery_days integer NOT NULL DEFAULT 7,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.influencer_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active services" ON public.influencer_services
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Influencers can create services" ON public.influencer_services
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM influencer_profiles WHERE id = influencer_id AND user_id = auth.uid()));

CREATE POLICY "Influencers can update services" ON public.influencer_services
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM influencer_profiles WHERE id = influencer_id AND user_id = auth.uid()));

CREATE POLICY "Influencers can delete services" ON public.influencer_services
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM influencer_profiles WHERE id = influencer_id AND user_id = auth.uid()));

-- Influencer orders (escrow)
CREATE TABLE public.influencer_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES public.influencer_services(id),
  influencer_id uuid NOT NULL REFERENCES public.influencer_profiles(id),
  client_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  escrow_status text NOT NULL DEFAULT 'unfunded',
  stripe_payment_intent_id text,
  client_approved boolean NOT NULL DEFAULT false,
  influencer_submitted boolean NOT NULL DEFAULT false,
  deliverables_url text DEFAULT '',
  deliverables_note text DEFAULT '',
  deadline timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.influencer_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own orders" ON public.influencer_orders
  FOR SELECT TO authenticated USING (client_id = auth.uid());

CREATE POLICY "Influencers can view their orders" ON public.influencer_orders
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM influencer_profiles WHERE id = influencer_id AND user_id = auth.uid()));

CREATE POLICY "Clients can create orders" ON public.influencer_orders
  FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update own orders" ON public.influencer_orders
  FOR UPDATE TO authenticated USING (client_id = auth.uid());

CREATE POLICY "Influencers can update their orders" ON public.influencer_orders
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM influencer_profiles WHERE id = influencer_id AND user_id = auth.uid()));

-- Influencer reviews
CREATE TABLE public.influencer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.influencer_orders(id) ON DELETE CASCADE,
  influencer_id uuid NOT NULL REFERENCES public.influencer_profiles(id),
  reviewer_id uuid NOT NULL,
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(order_id)
);

ALTER TABLE public.influencer_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.influencer_reviews
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Clients can create reviews" ON public.influencer_reviews
  FOR INSERT TO authenticated WITH CHECK (reviewer_id = auth.uid());

-- Storage for proof screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('influencer-proofs', 'influencer-proofs', true);

CREATE POLICY "Authenticated users can upload proofs" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'influencer-proofs');

CREATE POLICY "Anyone can view proofs" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'influencer-proofs');
