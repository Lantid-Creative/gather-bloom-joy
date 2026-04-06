
-- Organizer wallet: tracks available and pending balances
CREATE TABLE public.organizer_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  available_balance numeric NOT NULL DEFAULT 0,
  pending_balance numeric NOT NULL DEFAULT 0,
  total_earned numeric NOT NULL DEFAULT 0,
  total_withdrawn numeric NOT NULL DEFAULT 0,
  bank_name text NOT NULL DEFAULT '',
  account_number text NOT NULL DEFAULT '',
  account_name text NOT NULL DEFAULT '',
  bank_code text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.organizer_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet" ON public.organizer_wallets
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can update own wallet bank details" ON public.organizer_wallets
  FOR UPDATE TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can create own wallet" ON public.organizer_wallets
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all wallets" ON public.organizer_wallets
  FOR SELECT TO authenticated USING (public.is_admin());

-- Wallet transactions ledger
CREATE TABLE public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES public.organizer_wallets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'credit',
  amount numeric NOT NULL DEFAULT 0,
  fee_amount numeric NOT NULL DEFAULT 0,
  net_amount numeric NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT '',
  order_id uuid REFERENCES public.orders(id),
  available_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.wallet_transactions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can view all transactions" ON public.wallet_transactions
  FOR SELECT TO authenticated USING (public.is_admin());

-- Withdrawal requests
CREATE TABLE public.withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  wallet_id uuid NOT NULL REFERENCES public.organizer_wallets(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  bank_name text NOT NULL DEFAULT '',
  account_number text NOT NULL DEFAULT '',
  account_name text NOT NULL DEFAULT '',
  bank_code text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  admin_note text NOT NULL DEFAULT '',
  processed_at timestamptz,
  processed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own withdrawals" ON public.withdrawal_requests
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can create withdrawals" ON public.withdrawal_requests
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all withdrawals" ON public.withdrawal_requests
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can update withdrawals" ON public.withdrawal_requests
  FOR UPDATE TO authenticated USING (public.is_admin());

-- Function to release pending funds that are past 7-day hold
CREATE OR REPLACE FUNCTION public.release_pending_funds()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update transactions from pending to available
  UPDATE wallet_transactions
  SET status = 'available'
  WHERE status = 'pending' AND available_at <= now();

  -- Recalculate wallet balances
  UPDATE organizer_wallets w
  SET 
    available_balance = COALESCE((
      SELECT SUM(net_amount) FROM wallet_transactions 
      WHERE wallet_id = w.id AND status = 'available' AND type = 'credit'
    ), 0) - COALESCE((
      SELECT SUM(amount) FROM withdrawal_requests 
      WHERE wallet_id = w.id AND status IN ('pending', 'approved', 'processed')
    ), 0),
    pending_balance = COALESCE((
      SELECT SUM(net_amount) FROM wallet_transactions 
      WHERE wallet_id = w.id AND status = 'pending' AND type = 'credit'
    ), 0),
    updated_at = now();
END;
$$;
