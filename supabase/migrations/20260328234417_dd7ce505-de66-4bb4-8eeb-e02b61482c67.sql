
-- Drop the recursive policy
DROP POLICY IF EXISTS "Organizers can view orders for their events" ON public.orders;

-- Recreate without the recursive join - use a security definer function instead
CREATE OR REPLACE FUNCTION public.is_event_organizer_for_order(p_order_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM order_items oi
    JOIN events e ON e.id = oi.event_id
    WHERE oi.order_id = p_order_id
      AND e.user_id = auth.uid()
  )
$$;

CREATE POLICY "Organizers can view orders for their events"
ON public.orders
FOR SELECT
TO authenticated
USING (public.is_event_organizer_for_order(id));
