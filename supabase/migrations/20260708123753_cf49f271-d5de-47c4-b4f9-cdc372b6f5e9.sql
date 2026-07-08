
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON public.bookings(user_id);

-- Ensure authenticated role can read (RLS still gates rows)
GRANT SELECT ON public.bookings TO authenticated;

-- Replace INSERT policy: allow anonymous inserts (user_id null) or authenticated inserts tied to themselves
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

-- Allow authenticated clients to read their own bookings (staff/admin policy already covers them)
DROP POLICY IF EXISTS "Clients can view own bookings" ON public.bookings;
CREATE POLICY "Clients can view own bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (user_id IS NOT NULL AND user_id = auth.uid());
