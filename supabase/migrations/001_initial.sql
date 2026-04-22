-- ============================================================
-- XPERIGIFT — Initial Schema
-- Run this in Supabase SQL Editor (once)
-- ============================================================

-- ── TABLES ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.clients (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  industry   text,
  is_active  boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Extends auth.users — created automatically via trigger on signup
CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text,
  role       text DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  client_id  uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name         text NOT NULL,
  price_cents  integer,
  product_type text NOT NULL DEFAULT 'one_time' CHECK (product_type IN ('one_time', 'bundle', 'open_amount')),
  is_active    boolean DEFAULT true,
  image_url    text,
  description  text,
  contents     text[] DEFAULT '{}',
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.customers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name        text NOT NULL,
  email       text,
  total_spent integer DEFAULT 0,
  visits      integer DEFAULT 0,
  last_visit  date,
  tags        text[] DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sales (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  customer_id     uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  product_id      uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name    text NOT NULL,
  amount_cents    integer NOT NULL,
  redeemed_cents  integer DEFAULT 0,
  status          text DEFAULT 'sold' CHECK (status IN ('sold', 'partially_redeemed', 'redeemed', 'refunded', 'expired')),
  buyer_name      text,
  card_code       text UNIQUE NOT NULL,
  sold_at         timestamptz DEFAULT now(),
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  subject       text NOT NULL,
  status        text DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'sent', 'rejected')),
  send_date     date,
  segment_type  text DEFAULT 'all' CHECK (segment_type IN ('all', 'tag')),
  segment_tag   text,
  sender_name   text,
  sender_email  text,
  html_content  text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.email_templates (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  tags         text[] DEFAULT '{}',
  html_content text,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_bookings (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name   text NOT NULL,
  business_name  text,
  booked_date    date,
  status         text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed')),
  created_at     timestamptz DEFAULT now()
);

-- ── RLS ─────────────────────────────────────────────────────

ALTER TABLE public.clients          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_bookings   ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's client_id
CREATE OR REPLACE FUNCTION public.get_user_client_id()
RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT client_id FROM public.profiles WHERE id = auth.uid()
$$;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT COALESCE((SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()), false)
$$;

-- Drop existing policies to allow re-running this script
DROP POLICY IF EXISTS "profiles_select_own"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
DROP POLICY IF EXISTS "clients_select"       ON public.clients;
DROP POLICY IF EXISTS "clients_all_admin"    ON public.clients;
DROP POLICY IF EXISTS "products_select"      ON public.products;
DROP POLICY IF EXISTS "products_all"         ON public.products;
DROP POLICY IF EXISTS "customers_select"     ON public.customers;
DROP POLICY IF EXISTS "customers_all"        ON public.customers;
DROP POLICY IF EXISTS "sales_select"         ON public.sales;
DROP POLICY IF EXISTS "sales_all"            ON public.sales;
DROP POLICY IF EXISTS "campaigns_select"     ON public.email_campaigns;
DROP POLICY IF EXISTS "campaigns_all"        ON public.email_campaigns;
DROP POLICY IF EXISTS "templates_select"     ON public.email_templates;
DROP POLICY IF EXISTS "templates_admin"      ON public.email_templates;
DROP POLICY IF EXISTS "bookings_admin"       ON public.audit_bookings;

-- profiles
CREATE POLICY "profiles_select_own"  ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_update_own"  ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT WITH CHECK (true);

-- clients
CREATE POLICY "clients_select"    ON public.clients FOR SELECT USING (id = get_user_client_id() OR is_admin());
CREATE POLICY "clients_all_admin" ON public.clients FOR ALL    USING (is_admin());

-- products
CREATE POLICY "products_select" ON public.products FOR SELECT USING (client_id = get_user_client_id() OR is_admin());
CREATE POLICY "products_all"    ON public.products FOR ALL    USING (client_id = get_user_client_id() OR is_admin());

-- customers
CREATE POLICY "customers_select" ON public.customers FOR SELECT USING (client_id = get_user_client_id() OR is_admin());
CREATE POLICY "customers_all"    ON public.customers FOR ALL    USING (client_id = get_user_client_id() OR is_admin());

-- sales
CREATE POLICY "sales_select" ON public.sales FOR SELECT USING (client_id = get_user_client_id() OR is_admin());
CREATE POLICY "sales_all"    ON public.sales FOR ALL    USING (client_id = get_user_client_id() OR is_admin());

-- email_campaigns
CREATE POLICY "campaigns_select" ON public.email_campaigns FOR SELECT USING (client_id = get_user_client_id() OR is_admin());
CREATE POLICY "campaigns_all"    ON public.email_campaigns FOR ALL    USING (client_id = get_user_client_id() OR is_admin());

-- email_templates (read by all authenticated users, managed by admin)
CREATE POLICY "templates_select" ON public.email_templates FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "templates_admin"  ON public.email_templates FOR ALL    USING (is_admin());

-- audit_bookings (admin only)
CREATE POLICY "bookings_admin" ON public.audit_bookings FOR ALL USING (is_admin());

-- ── TRIGGER: auto-create profile on signup ───────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
