
ALTER TABLE public.organizer_wallets ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'NGN';
ALTER TABLE public.wallet_transactions ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'NGN';
ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'NGN';
