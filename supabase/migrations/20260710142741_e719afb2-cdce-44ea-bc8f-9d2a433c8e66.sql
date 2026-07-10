
-- 1. Enable pg_net for outbound HTTP from Postgres
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Persist customer's chosen language on the booking
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS preferred_language text NOT NULL DEFAULT 'en';

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_preferred_language_check;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_preferred_language_check
  CHECK (preferred_language IN ('en','ru','el'));

-- 3. Trigger function: fires backend email delivery via pg_net
CREATE OR REPLACE FUNCTION public.dispatch_booking_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ev text;
  fn_url text := 'https://xhlnrfjfcdvmnybmgmcg.supabase.co/functions/v1/send-booking-email';
BEGIN
  IF TG_OP = 'INSERT' THEN
    ev := 'booking_created';
  ELSIF TG_OP = 'UPDATE'
        AND NEW.status IS DISTINCT FROM OLD.status
        AND NEW.status IN ('confirmed','cancelled','completed') THEN
    ev := 'booking_' || NEW.status;
  ELSE
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := fn_url,
    headers := jsonb_build_object('Content-Type','application/json'),
    body := jsonb_build_object(
      'booking_id', NEW.id::text,
      'event_type', ev
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_dispatch_booking_email_ins ON public.bookings;
CREATE TRIGGER trg_dispatch_booking_email_ins
AFTER INSERT ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.dispatch_booking_email();

DROP TRIGGER IF EXISTS trg_dispatch_booking_email_upd ON public.bookings;
CREATE TRIGGER trg_dispatch_booking_email_upd
AFTER UPDATE OF status ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.dispatch_booking_email();
