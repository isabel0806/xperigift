-- ============================================================
-- XPERIGIFT — Migration 002
-- Run in Supabase SQL Editor
-- ============================================================

-- ── profiles: add client_role (owner = full access, staff = redeem only) ──
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS client_role text DEFAULT 'owner'
    CHECK (client_role IN ('owner', 'staff'));

-- ── products: optional gratuity / tip percentage ─────────────
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS gratuity_pct integer
    CHECK (gratuity_pct IS NULL OR (gratuity_pct >= 0 AND gratuity_pct <= 100));

-- ── sales: track who redeemed and when ───────────────────────
ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS redeemed_by  text,
  ADD COLUMN IF NOT EXISTS redeemed_at  timestamptz;

-- ── audit_bookings: missing columns referenced in app code ───
ALTER TABLE public.audit_bookings
  ADD COLUMN IF NOT EXISTS meeting_link text,
  ADD COLUMN IF NOT EXISTS email        text,
  ADD COLUMN IF NOT EXISTS notes        text;

-- ── clients: optional Calendly / scheduling link ─────────────
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS calendly_link text;

-- ── RLS: allow admin to manage all profiles ───────────────────
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_admin" ON public.profiles;

CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (is_admin());

CREATE POLICY "profiles_insert_admin" ON public.profiles
  FOR INSERT WITH CHECK (is_admin());
