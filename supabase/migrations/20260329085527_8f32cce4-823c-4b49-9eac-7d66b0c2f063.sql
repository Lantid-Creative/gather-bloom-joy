ALTER TABLE public.events ADD COLUMN meeting_platform text DEFAULT '' NOT NULL;
ALTER TABLE public.events ADD COLUMN meeting_url text DEFAULT '' NOT NULL;