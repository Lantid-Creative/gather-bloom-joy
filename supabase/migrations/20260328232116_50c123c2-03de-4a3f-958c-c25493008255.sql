ALTER TABLE public.events ADD COLUMN IF NOT EXISTS recurrence_type text NOT NULL DEFAULT 'none';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS recurrence_end_date timestamptz;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS parent_event_id uuid REFERENCES public.events(id) ON DELETE SET NULL;