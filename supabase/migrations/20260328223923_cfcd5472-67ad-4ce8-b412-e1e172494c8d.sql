
-- Add status and currency to events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD';

-- Add ticket type extras
ALTER TABLE public.ticket_types ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;
ALTER TABLE public.ticket_types ADD COLUMN IF NOT EXISTS access_code text;
ALTER TABLE public.ticket_types ADD COLUMN IF NOT EXISTS sales_start timestamp with time zone;
ALTER TABLE public.ticket_types ADD COLUMN IF NOT EXISTS sales_end timestamp with time zone;
ALTER TABLE public.ticket_types ADD COLUMN IF NOT EXISTS is_donation boolean NOT NULL DEFAULT false;
ALTER TABLE public.ticket_types ADD COLUMN IF NOT EXISTS min_price numeric NOT NULL DEFAULT 0;

-- Promo codes
CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  code text NOT NULL,
  discount_type text NOT NULL DEFAULT 'percentage',
  discount_value numeric NOT NULL DEFAULT 0,
  usage_limit integer,
  used_count integer NOT NULL DEFAULT 0,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(event_id, code)
);

-- Waitlist
CREATE TABLE public.waitlist_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'waiting',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Favorites
CREATE TABLE public.event_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Organizer followers
CREATE TABLE public.organizer_followers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid NOT NULL,
  follower_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(organizer_id, follower_id)
);

-- Refund requests
CREATE TABLE public.refund_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  reason text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  resolved_at timestamp with time zone
);

-- Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'info',
  read boolean NOT NULL DEFAULT false,
  link text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tracking links
CREATE TABLE public.tracking_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  code text NOT NULL,
  label text NOT NULL DEFAULT '',
  clicks integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(event_id, code)
);

-- Attendee check-ins
CREATE TABLE public.attendee_check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id uuid REFERENCES public.order_items(id) ON DELETE CASCADE NOT NULL,
  checked_in_by uuid NOT NULL,
  checked_in_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Event feedback
CREATE TABLE public.event_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  comment text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Event add-ons
CREATE TABLE public.event_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  available integer NOT NULL DEFAULT 100,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Event collections
CREATE TABLE public.event_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.event_collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES public.event_collections(id) ON DELETE CASCADE NOT NULL,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  UNIQUE(collection_id, event_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizer_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendee_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_collection_items ENABLE ROW LEVEL SECURITY;

-- PROMO CODES policies
CREATE POLICY "Anyone can view promo codes" ON public.promo_codes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Event owners can manage promo codes" ON public.promo_codes FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM events WHERE events.id = promo_codes.event_id AND events.user_id = auth.uid()));
CREATE POLICY "Event owners can update promo codes" ON public.promo_codes FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM events WHERE events.id = promo_codes.event_id AND events.user_id = auth.uid()));
CREATE POLICY "Event owners can delete promo codes" ON public.promo_codes FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM events WHERE events.id = promo_codes.event_id AND events.user_id = auth.uid()));

-- WAITLIST policies
CREATE POLICY "Users can view own waitlist entries" ON public.waitlist_entries FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Event owners can view waitlist" ON public.waitlist_entries FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM events WHERE events.id = waitlist_entries.event_id AND events.user_id = auth.uid()));
CREATE POLICY "Users can join waitlist" ON public.waitlist_entries FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can leave waitlist" ON public.waitlist_entries FOR DELETE TO authenticated USING (user_id = auth.uid());

-- FAVORITES policies
CREATE POLICY "Users can view own favorites" ON public.event_favorites FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can add favorites" ON public.event_favorites FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can remove favorites" ON public.event_favorites FOR DELETE TO authenticated USING (user_id = auth.uid());

-- FOLLOWERS policies
CREATE POLICY "Anyone can view followers" ON public.organizer_followers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can follow" ON public.organizer_followers FOR INSERT TO authenticated WITH CHECK (follower_id = auth.uid());
CREATE POLICY "Users can unfollow" ON public.organizer_followers FOR DELETE TO authenticated USING (follower_id = auth.uid());

-- REFUND REQUESTS policies
CREATE POLICY "Users can view own refund requests" ON public.refund_requests FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create refund requests" ON public.refund_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Organizers can view refunds for their events" ON public.refund_requests FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM orders JOIN order_items ON order_items.order_id = orders.id JOIN events ON events.id = order_items.event_id WHERE orders.id = refund_requests.order_id AND events.user_id = auth.uid()));
CREATE POLICY "Organizers can update refund status" ON public.refund_requests FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM orders JOIN order_items ON order_items.order_id = orders.id JOIN events ON events.id = order_items.event_id WHERE orders.id = refund_requests.order_id AND events.user_id = auth.uid()));

-- NOTIFICATIONS policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- TRACKING LINKS policies
CREATE POLICY "Anyone can view tracking links" ON public.tracking_links FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Event owners can manage tracking links" ON public.tracking_links FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM events WHERE events.id = tracking_links.event_id AND events.user_id = auth.uid()));
CREATE POLICY "Event owners can update tracking links" ON public.tracking_links FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM events WHERE events.id = tracking_links.event_id AND events.user_id = auth.uid()));
CREATE POLICY "Event owners can delete tracking links" ON public.tracking_links FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM events WHERE events.id = tracking_links.event_id AND events.user_id = auth.uid()));

-- CHECK-IN policies
CREATE POLICY "Event owners can view check-ins" ON public.attendee_check_ins FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM order_items JOIN events ON events.id = order_items.event_id WHERE order_items.id = attendee_check_ins.order_item_id AND events.user_id = auth.uid()));
CREATE POLICY "Event owners can create check-ins" ON public.attendee_check_ins FOR INSERT TO authenticated WITH CHECK (checked_in_by = auth.uid());

-- FEEDBACK policies
CREATE POLICY "Anyone can view feedback" ON public.event_feedback FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can create feedback" ON public.event_feedback FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own feedback" ON public.event_feedback FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- ADDONS policies
CREATE POLICY "Anyone can view addons" ON public.event_addons FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Event owners can manage addons" ON public.event_addons FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM events WHERE events.id = event_addons.event_id AND events.user_id = auth.uid()));
CREATE POLICY "Event owners can update addons" ON public.event_addons FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM events WHERE events.id = event_addons.event_id AND events.user_id = auth.uid()));
CREATE POLICY "Event owners can delete addons" ON public.event_addons FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM events WHERE events.id = event_addons.event_id AND events.user_id = auth.uid()));

-- COLLECTIONS policies
CREATE POLICY "Anyone can view collections" ON public.event_collections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can create collections" ON public.event_collections FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own collections" ON public.event_collections FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own collections" ON public.event_collections FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Anyone can view collection items" ON public.event_collection_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Collection owners can manage items" ON public.event_collection_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM event_collections WHERE event_collections.id = event_collection_items.collection_id AND event_collections.user_id = auth.uid()));
CREATE POLICY "Collection owners can delete items" ON public.event_collection_items FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM event_collections WHERE event_collections.id = event_collection_items.collection_id AND event_collections.user_id = auth.uid()));

-- Function to increment promo code usage
CREATE OR REPLACE FUNCTION public.use_promo_code(p_event_id uuid, p_code text)
RETURNS TABLE(discount_type text, discount_value numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_promo promo_codes%ROWTYPE;
BEGIN
  SELECT * INTO v_promo FROM promo_codes
  WHERE promo_codes.event_id = p_event_id AND promo_codes.code = UPPER(p_code)
  LIMIT 1;

  IF v_promo IS NULL THEN
    RAISE EXCEPTION 'Invalid promo code';
  END IF;

  IF v_promo.expires_at IS NOT NULL AND v_promo.expires_at < NOW() THEN
    RAISE EXCEPTION 'Promo code has expired';
  END IF;

  IF v_promo.usage_limit IS NOT NULL AND v_promo.used_count >= v_promo.usage_limit THEN
    RAISE EXCEPTION 'Promo code usage limit reached';
  END IF;

  UPDATE promo_codes SET used_count = used_count + 1 WHERE id = v_promo.id;

  RETURN QUERY SELECT v_promo.discount_type, v_promo.discount_value;
END;
$$;

-- Increment tracking link clicks
CREATE OR REPLACE FUNCTION public.track_link_click(p_event_id uuid, p_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE tracking_links SET clicks = clicks + 1
  WHERE event_id = p_event_id AND code = p_code;
END;
$$;
