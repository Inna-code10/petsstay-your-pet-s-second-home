-- Restore the strict INSERT policy
DROP POLICY IF EXISTS "Anyone can create booking" ON public.bookings;
CREATE POLICY "Anyone can create booking"
  ON public.bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(btrim(owner_name)) > 0
    AND length(btrim(email)) > 0
    AND length(btrim(phone)) > 0
    AND arrival_date <= departure_date
    AND (
      (auth.uid() IS NULL AND user_id IS NULL)
      OR (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()))
    )
  );

-- Restore email dispatch triggers
DROP TRIGGER IF EXISTS trg_dispatch_booking_email_ins ON public.bookings;
CREATE TRIGGER trg_dispatch_booking_email_ins
AFTER INSERT ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.dispatch_booking_email();

DROP TRIGGER IF EXISTS trg_dispatch_booking_email_upd ON public.bookings;
CREATE TRIGGER trg_dispatch_booking_email_upd
AFTER UPDATE OF status ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.dispatch_booking_email();