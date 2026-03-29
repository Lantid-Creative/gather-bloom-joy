
-- DP Templates table for organizer-uploaded flyer templates
CREATE TABLE public.dp_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  template_image_url TEXT NOT NULL DEFAULT '',
  photo_x NUMERIC NOT NULL DEFAULT 0,
  photo_y NUMERIC NOT NULL DEFAULT 0,
  photo_width NUMERIC NOT NULL DEFAULT 200,
  photo_height NUMERIC NOT NULL DEFAULT 200,
  photo_shape TEXT NOT NULL DEFAULT 'circle',
  is_preset BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dp_templates ENABLE ROW LEVEL SECURITY;

-- Anyone can view active templates (attendees need access)
CREATE POLICY "Anyone can view active dp templates"
  ON public.dp_templates FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Event owners can manage templates
CREATE POLICY "Event owners can create dp templates"
  ON public.dp_templates FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM events WHERE events.id = dp_templates.event_id AND events.user_id = auth.uid()));

CREATE POLICY "Event owners can update dp templates"
  ON public.dp_templates FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = dp_templates.event_id AND events.user_id = auth.uid()));

CREATE POLICY "Event owners can delete dp templates"
  ON public.dp_templates FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = dp_templates.event_id AND events.user_id = auth.uid()));

-- Storage bucket for dp template images and generated DPs
INSERT INTO storage.buckets (id, name, public) VALUES ('dp-templates', 'dp-templates', true);

CREATE POLICY "Anyone can view dp template files"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'dp-templates');

CREATE POLICY "Authenticated users can upload dp template files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'dp-templates');

CREATE POLICY "Users can delete own dp template files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'dp-templates' AND (auth.uid())::text = (storage.foldername(name))[1]);
