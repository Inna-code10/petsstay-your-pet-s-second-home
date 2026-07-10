
-- Add read_at column
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS read_at timestamptz;

-- Rework SELECT policies: clients only own; staff/admin see operational (user_id IS NULL)
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins manage notifications" ON public.notifications;

CREATE POLICY "view own or operational" ON public.notifications
FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR (user_id IS NULL AND (public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin')))
);

CREATE POLICY "update own or operational" ON public.notifications
FOR UPDATE TO authenticated
USING (
  auth.uid() = user_id
  OR (user_id IS NULL AND (public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin')))
)
WITH CHECK (
  auth.uid() = user_id
  OR (user_id IS NULL AND (public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin')))
);

CREATE POLICY "admins full access" ON public.notifications
FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin'))
WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Trigger function to auto-create internal notifications on booking events
CREATE OR REPLACE FUNCTION public.notify_on_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_msg text;
  price_txt text;
BEGIN
  price_txt := CASE WHEN NEW.total_price IS NOT NULL THEN ' • €' || NEW.total_price::text ELSE '' END;
  base_msg := NEW.owner_name || ' • ' || NEW.pet_type || ' • ' || NEW.arrival_date::text || ' → ' || NEW.departure_date::text || price_txt;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications(user_id, type, title, message, status)
    VALUES (NULL, 'booking_created', 'New booking request', base_msg, 'sent');
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.notifications(user_id, type, title, message, status)
    VALUES (NULL, 'booking_' || NEW.status, 'Booking ' || NEW.status, base_msg, 'sent');
    IF NEW.user_id IS NOT NULL THEN
      INSERT INTO public.notifications(user_id, type, title, message, status)
      VALUES (NEW.user_id, 'booking_' || NEW.status, 'Your booking is ' || NEW.status, base_msg, 'sent');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_on_booking_ins ON public.bookings;
DROP TRIGGER IF EXISTS trg_notify_on_booking_upd ON public.bookings;
CREATE TRIGGER trg_notify_on_booking_ins
AFTER INSERT ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.notify_on_booking();
CREATE TRIGGER trg_notify_on_booking_upd
AFTER UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.notify_on_booking();
