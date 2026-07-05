
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO service_role;

DROP POLICY "Anyone can create booking" ON public.bookings;
CREATE POLICY "Anyone can create booking" ON public.bookings
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(trim(owner_name)) > 0
    AND length(trim(email)) > 0
    AND length(trim(phone)) > 0
    AND arrival_date <= departure_date
  );

DROP POLICY "Anyone can create contact" ON public.contacts;
CREATE POLICY "Anyone can create contact" ON public.contacts
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(trim(full_name)) > 0
    AND length(trim(email)) > 0
    AND length(trim(message)) > 0
  );
