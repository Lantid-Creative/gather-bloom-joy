ALTER TABLE public.organizer_wallets ADD COLUMN stripe_account_id text DEFAULT '';

ALTER TABLE public.organizer_wallets ADD COLUMN stripe_onboarding_complete boolean DEFAULT false;