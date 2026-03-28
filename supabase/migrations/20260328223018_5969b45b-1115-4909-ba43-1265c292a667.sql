
CREATE OR REPLACE FUNCTION public.decrement_ticket_availability()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Decrement available count on ticket_types
  UPDATE public.ticket_types
  SET available = available - NEW.quantity
  WHERE id = NEW.ticket_type_id;

  -- Increment tickets_sold on events
  UPDATE public.events
  SET tickets_sold = tickets_sold + NEW.quantity
  WHERE id = NEW.event_id;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER on_order_item_inserted
  AFTER INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_ticket_availability();
