
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DO $mig$
DECLARE
  r record;
  new_qual text;
  new_check text;
  stmt text;
BEGIN
  FOR r IN
    SELECT p.schemaname, p.tablename, p.policyname, p.permissive, p.roles, p.cmd AS pcmd, p.qual, p.with_check
    FROM pg_policies p
    WHERE p.schemaname = 'public'
      AND (p.qual LIKE '%has_role%' OR coalesce(p.with_check,'') LIKE '%has_role%')
  LOOP
    new_qual := regexp_replace(coalesce(r.qual,''), '(^|[^a-zA-Z0-9_.])has_role\(', '\1private.has_role(', 'g');
    new_qual := replace(new_qual, 'public.has_role(', 'private.has_role(');
    new_check := regexp_replace(coalesce(r.with_check,''), '(^|[^a-zA-Z0-9_.])has_role\(', '\1private.has_role(', 'g');
    new_check := replace(new_check, 'public.has_role(', 'private.has_role(');

    EXECUTE format('DROP POLICY %I ON %I.%I', r.policyname, r.schemaname, r.tablename);

    stmt := format('CREATE POLICY %I ON %I.%I AS %s FOR %s TO %s',
      r.policyname, r.schemaname, r.tablename,
      CASE WHEN r.permissive = 'PERMISSIVE' THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END,
      r.pcmd,
      array_to_string(r.roles, ', ')
    );
    IF new_qual <> '' THEN
      stmt := stmt || ' USING (' || new_qual || ')';
    END IF;
    IF new_check <> '' THEN
      stmt := stmt || ' WITH CHECK (' || new_check || ')';
    END IF;
    EXECUTE stmt;
  END LOOP;
END $mig$;

-- Now that no policy references public.has_role, drop it from the API-exposed schema.
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
