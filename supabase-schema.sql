-- =============================================
-- Schema for IDF Personnel Assignment System
-- Run this in Supabase SQL Editor
-- =============================================

-- Personnel table
CREATE TABLE IF NOT EXISTS personnel (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  personal_number TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Missions table
CREATE TABLE IF NOT EXISTS missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  is_fixed BOOLEAN DEFAULT false,
  display_order INT DEFAULT 999,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mission assignments
CREATE TABLE IF NOT EXISTS mission_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE NOT NULL,
  personnel_id UUID REFERENCES personnel(id) ON DELETE CASCADE NOT NULL,
  mission_start_time TIMESTAMPTZ,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mission_id, personnel_id)
);

-- Mission resets log
CREATE TABLE IF NOT EXISTS mission_resets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE NOT NULL,
  reset_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed 8 fixed missions
INSERT INTO missions (name, is_fixed, display_order) VALUES
  ('גורביץ', true, 1),
  ('דורס', true, 2),
  ('מחסום נגוהות', true, 3),
  ('פילבוקס', true, 4),
  ('כרמל א', true, 5),
  ('חפ"ק פלוגה', true, 6),
  ('כרמל ב', true, 7),
  ('ביום אויב', true, 8)
ON CONFLICT DO NOTHING;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE mission_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE missions;
ALTER PUBLICATION supabase_realtime ADD TABLE mission_resets;
