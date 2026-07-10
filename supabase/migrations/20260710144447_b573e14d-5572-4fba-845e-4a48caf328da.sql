DROP POLICY IF EXISTS "Anyone can create booking" ON public.bookings;
CREATE POLICY "Anyone can create booking"
  ON public.bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);