
-- Event time slots table
CREATE TABLE public.event_time_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT '',
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 100,
  booked INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.event_time_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view time slots"
  ON public.event_time_slots FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Event owners can create time slots"
  ON public.event_time_slots FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM events WHERE events.id = event_time_slots.event_id AND events.user_id = auth.uid()));

CREATE POLICY "Event owners can update time slots"
  ON public.event_time_slots FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = event_time_slots.event_id AND events.user_id = auth.uid()));

CREATE POLICY "Event owners can delete time slots"
  ON public.event_time_slots FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = event_time_slots.event_id AND events.user_id = auth.uid()));

-- Add time_slot_id to order_items to track which slot was booked
ALTER TABLE public.order_items ADD COLUMN time_slot_id UUID REFERENCES public.event_time_slots(id) DEFAULT NULL;
ALTER TABLE public.order_items ADD COLUMN time_slot_label TEXT DEFAULT NULL;
