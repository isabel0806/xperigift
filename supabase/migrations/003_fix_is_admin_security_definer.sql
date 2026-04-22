-- Fix circular RLS dependency: profiles_select_admin calls is_admin()
-- which queries profiles (subject to RLS), causing infinite recursion.
-- SECURITY DEFINER makes the function run as the owner, bypassing RLS.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COALESCE((SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()), false)
$$;

-- Same fix for get_user_client_id for consistency
CREATE OR REPLACE FUNCTION public.get_user_client_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT client_id FROM public.profiles WHERE id = auth.uid()
$$;
