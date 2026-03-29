
DROP POLICY "System can create conversions" ON public.referral_conversions;
CREATE POLICY "Authenticated users can create conversions" ON public.referral_conversions
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = referral_conversions.order_id AND orders.user_id = auth.uid()
  ));
