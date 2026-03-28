-- Allow event organizers to see order items for their events
CREATE POLICY "Organizers can view order items for their events"
ON public.order_items
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = order_items.event_id
    AND events.user_id = auth.uid()
  )
);

-- Allow event organizers to see orders that contain their events
CREATE POLICY "Organizers can view orders for their events"
ON public.orders
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.order_items
    JOIN public.events ON events.id = order_items.event_id
    WHERE order_items.order_id = orders.id
    AND events.user_id = auth.uid()
  )
);