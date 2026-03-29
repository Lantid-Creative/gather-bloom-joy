
-- Add extra_images column to events for gallery support
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS extra_images text[] NOT NULL DEFAULT '{}'::text[];
