-- Academy user management
CREATE TABLE IF NOT EXISTS academy_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text UNIQUE NOT NULL,
  pin text NOT NULL, -- 4 digit PIN
  full_name text NOT NULL,
  phone text, -- WhatsApp number with country code
  email text,
  role text DEFAULT 'trainee' CHECK (role IN ('trainee', 'admin')),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

CREATE TABLE IF NOT EXISTS academy_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES academy_users(id) ON DELETE CASCADE,
  track text NOT NULL, -- e.g. 'solar-fundamentals', 'sales-bd', 'technical', 'ev-storage', 'management'
  lesson_id text NOT NULL, -- e.g. 'solar-fundamentals-01'
  completed_at timestamptz DEFAULT now(),
  quiz_score integer, -- optional quiz score 0-100
  time_spent_seconds integer, -- time on lesson
  UNIQUE(user_id, lesson_id)
);

-- RLS
ALTER TABLE academy_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon read users for login" ON academy_users FOR SELECT TO anon USING (true);
CREATE POLICY "Anon update last_login" ON academy_users FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon read progress" ON academy_progress FOR SELECT TO anon USING (true);
CREATE POLICY "Anon write progress" ON academy_progress FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon delete progress" ON academy_progress FOR DELETE TO anon USING (true);

-- Create first user: Erez
INSERT INTO academy_users (username, pin, full_name, phone, role) 
VALUES ('erez', '7788', 'ארז (Erez)', '+972547768995', 'trainee');

-- Create admin user
INSERT INTO academy_users (username, pin, full_name, role)
VALUES ('admin', '2626', 'Admin', 'admin');
