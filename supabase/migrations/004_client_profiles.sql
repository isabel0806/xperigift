-- Client profiles: enriched context for content generation
CREATE TABLE client_profiles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL UNIQUE,
  website_url     text,
  website_content text,
  gift_cards      jsonb DEFAULT '[]',
  bundles         jsonb DEFAULT '[]',
  important_dates jsonb DEFAULT '[]',
  target_audience text,
  competitors     jsonb DEFAULT '[]',
  tone            text,
  notes           text,
  scraped_at      timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_client_profiles" ON client_profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
