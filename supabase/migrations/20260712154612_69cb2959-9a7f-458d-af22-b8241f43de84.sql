
-- Revoke EXECUTE from public/anon/authenticated on internal trigger functions.
-- These are only invoked by triggers (which run regardless of EXECUTE grants)
-- or by service_role from edge functions.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.dispatch_booking_email() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_on_booking() FROM PUBLIC, anon, authenticated;

-- email_deliveries: writes are intentional service-role only. Make this explicit
-- by revoking any table privileges from anon/authenticated and re-granting all
-- to service_role. RLS remains enabled; no policies grant client writes.
REVOKE ALL ON TABLE public.email_deliveries FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.email_deliveries TO service_role;
