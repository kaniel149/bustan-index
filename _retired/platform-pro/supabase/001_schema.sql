-- Bustan Energy Platform — KP Solar Pro 2.0
-- Phase 1: Core Schema
-- Supabase: trvgpgpsqvvdsudpgwpm

-- ============================================
-- 1. USERS / TEAM
-- ============================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'installer' CHECK (role IN ('admin', 'sales', 'installer', 'viewer')),
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. ZONES (areas of Koh Phangan)
-- ============================================
CREATE TABLE IF NOT EXISTS zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_th TEXT,
  color TEXT DEFAULT '#00D68F',
  boundary JSONB, -- GeoJSON polygon
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 3. BUILDINGS (the core entity)
-- ============================================
CREATE TABLE IF NOT EXISTS buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Location
  name TEXT,
  address TEXT,
  zone_id UUID REFERENCES zones(id),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  
  -- Roof specs
  roof_type TEXT CHECK (roof_type IN ('metal', 'concrete', 'tile', 'mixed', 'flat', 'other')),
  roof_area_sqm NUMERIC(10,2),
  roof_orientation TEXT CHECK (roof_orientation IN ('N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'flat')),
  roof_tilt_deg NUMERIC(5,2) DEFAULT 0,
  shading TEXT CHECK (shading IN ('none', 'partial', 'heavy')),
  
  -- Building info
  building_type TEXT CHECK (building_type IN ('villa', 'hotel', 'resort', 'guesthouse', 'restaurant', 'shop', 'factory', 'warehouse', 'office', 'school', 'hospital', 'government', 'residential', 'other')),
  floors INTEGER DEFAULT 1,
  
  -- Solar potential (calculated)
  potential_kwp NUMERIC(10,2),
  potential_panels INTEGER,
  potential_annual_kwh NUMERIC(12,2),
  potential_monthly_savings_thb NUMERIC(10,2),
  potential_grade TEXT CHECK (potential_grade IN ('A', 'B', 'C', 'D')),
  
  -- Current energy
  current_monthly_bill_thb NUMERIC(10,2),
  current_monthly_kwh NUMERIC(10,2),
  electricity_provider TEXT DEFAULT 'PEA',
  
  -- Contact
  owner_name TEXT,
  owner_phone TEXT,
  owner_email TEXT,
  owner_line TEXT,
  
  -- Status
  status TEXT DEFAULT 'identified' CHECK (status IN ('identified', 'surveyed', 'qualified', 'proposal_sent', 'negotiating', 'won', 'lost', 'not_suitable')),
  priority TEXT DEFAULT 'C' CHECK (priority IN ('A', 'B', 'C', 'D')),
  
  -- Notes & media
  notes TEXT,
  photos JSONB DEFAULT '[]'::jsonb, -- array of URLs
  drone_photo_url TEXT,
  
  -- Metadata
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'drone', 'import', 'referral', 'walkin')),
  assigned_to UUID REFERENCES team_members(id),
  created_by UUID REFERENCES team_members(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 4. LEADS (pipeline tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
  
  -- Contact info (can differ from building owner)
  contact_name TEXT NOT NULL,
  contact_phone TEXT,
  contact_email TEXT,
  contact_line TEXT,
  contact_role TEXT, -- owner, manager, tenant, developer
  
  -- Pipeline
  stage TEXT DEFAULT 'new' CHECK (stage IN ('new', 'contacted', 'survey_scheduled', 'survey_done', 'proposal_sent', 'negotiating', 'verbal_yes', 'contract_signed', 'installing', 'completed', 'lost')),
  lost_reason TEXT,
  
  -- Deal
  system_size_kwp NUMERIC(10,2),
  deal_model TEXT CHECK (deal_model IN ('purchase', 'ppa', 'lease', 'community_solar')),
  deal_value_thb NUMERIC(12,2),
  monthly_revenue_thb NUMERIC(10,2),
  
  -- Dates
  first_contact_date DATE,
  survey_date DATE,
  proposal_date DATE,
  expected_close_date DATE,
  actual_close_date DATE,
  installation_start DATE,
  installation_end DATE,
  cod_date DATE, -- commercial operation date
  
  -- Assignment
  assigned_to UUID REFERENCES team_members(id),
  source TEXT DEFAULT 'direct' CHECK (source IN ('direct', 'referral', 'website', 'facebook', 'instagram', 'walkin', 'event', 'cold_outreach')),
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 5. ACTIVITIES (timeline / history)
-- ============================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL CHECK (type IN ('note', 'call', 'meeting', 'email', 'whatsapp', 'site_visit', 'proposal_sent', 'stage_change', 'photo', 'system')),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_by UUID REFERENCES team_members(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 6. PROPOSALS
-- ============================================
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_number TEXT UNIQUE, -- TM-2026-XXX
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
  
  -- System design
  system_size_kwp NUMERIC(10,2),
  panel_count INTEGER,
  panel_model TEXT,
  panel_watt INTEGER,
  inverter_model TEXT,
  inverter_count INTEGER,
  battery_kwh NUMERIC(10,2),
  mounting_type TEXT CHECK (mounting_type IN ('rooftop_rail', 'rooftop_ballast', 'ground_pile', 'ground_ballast', 'carport')),
  
  -- Financials
  total_price_thb NUMERIC(12,2),
  price_per_wp NUMERIC(8,2),
  monthly_production_kwh NUMERIC(10,2),
  annual_production_kwh NUMERIC(12,2),
  monthly_savings_thb NUMERIC(10,2),
  annual_savings_thb NUMERIC(12,2),
  payback_years NUMERIC(5,2),
  roi_percent NUMERIC(5,2),
  irr_percent NUMERIC(5,2),
  
  -- Deal terms
  deal_model TEXT CHECK (deal_model IN ('purchase', 'ppa', 'lease')),
  ppa_rate_thb NUMERIC(8,2),
  ppa_duration_years INTEGER,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired')),
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Tracking
  html_url TEXT, -- link to hosted proposal
  pdf_url TEXT,
  view_count INTEGER DEFAULT 0,
  signature_data JSONB, -- digital signature
  
  -- Options (multiple options per proposal)
  options JSONB DEFAULT '[]'::jsonb,
  selected_option INTEGER,
  
  created_by UUID REFERENCES team_members(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 7. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_buildings_zone ON buildings(zone_id);
CREATE INDEX IF NOT EXISTS idx_buildings_status ON buildings(status);
CREATE INDEX IF NOT EXISTS idx_buildings_grade ON buildings(potential_grade);
CREATE INDEX IF NOT EXISTS idx_buildings_coords ON buildings(lat, lng);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_building ON leads(building_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_activities_lead ON activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_building ON activities(building_id);
CREATE INDEX IF NOT EXISTS idx_proposals_lead ON proposals(lead_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);

-- ============================================
-- 8. RLS POLICIES
-- ============================================
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read everything
CREATE POLICY "Authenticated read all" ON team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON zones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON buildings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON proposals FOR SELECT TO authenticated USING (true);

-- Allow all authenticated users to insert/update (small team, trust-based)
CREATE POLICY "Authenticated write all" ON buildings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write all" ON leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write all" ON activities FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write all" ON proposals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write all" ON zones FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow anon to read buildings + zones (for public map view)
CREATE POLICY "Anon read buildings" ON buildings FOR SELECT TO anon USING (true);
CREATE POLICY "Anon read zones" ON zones FOR SELECT TO anon USING (true);

-- ============================================
-- 9. SEED DATA — Zones
-- ============================================
INSERT INTO zones (name, name_th, color) VALUES
  ('Thong Sala', 'ท้องศาลา', '#00D68F'),
  ('Haad Rin', 'หาดริ้น', '#FFB800'),
  ('Baan Tai', 'บ้านใต้', '#3B82F6'),
  ('Baan Khai', 'บ้านค่าย', '#A855F7'),
  ('Chaloklum', 'เฉลิมลม', '#EF4444'),
  ('Sri Thanu', 'ศรีธนู', '#06B6D4'),
  ('Maehaad', 'แม่หาด', '#F97316'),
  ('Wok Tum', 'วกตุ่ม', '#14B8A6'),
  ('Hin Kong', 'หินกอง', '#8B5CF6'),
  ('Thong Nai Pan', 'ท้องนายปาน', '#EC4899')
ON CONFLICT DO NOTHING;

-- ============================================
-- 10. SEED DATA — Initial team
-- ============================================
INSERT INTO team_members (email, name, role, phone) VALUES
  ('kaniel@bustan-energy.com', 'Kaniel', 'admin', '+66997044944'),
  ('erez@bustan-energy.com', 'Erez', 'installer', NULL)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 11. UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER buildings_updated_at BEFORE UPDATE ON buildings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER proposals_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
