-- Create default users for TAL system

-- First, create auth users (this would typically be done through Supabase Auth)
-- For development purposes, we'll assume these users exist in auth.users

-- Insert or update profiles for default users
INSERT INTO profiles (id, email, full_name, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@tal.com', 'Administrator', now(), now()),
  ('00000000-0000-0000-0000-000000000002', 'hr@tal.com', 'HR Manager', now(), now()),
  ('00000000-0000-0000-0000-000000000003', 'audit@tal.com', 'Auditor', now(), now()),
  ('00000000-0000-0000-0000-000000000004', 'karyawan@tal.com', 'Karyawan', now(), now())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = EXCLUDED.updated_at;

-- Insert user profiles
INSERT INTO user_profiles (id, username, full_name, user_type, status, position, division, branch, must_create_daily, must_create_weekly, must_create_monthly)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin', 'Administrator', 'admin', 'active', 'System Administrator', 'IT', 'Head Office', true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'hr', 'HR Manager', 'hr', 'active', 'HR Manager', 'Human Resources', 'Head Office', true, true, true),
  ('00000000-0000-0000-0000-000000000003', 'audit', 'Auditor', 'auditor', 'active', 'Internal Auditor', 'Audit', 'Head Office', false, false, false),
  ('00000000-0000-0000-0000-000000000004', 'karyawan', 'Karyawan', 'employee', 'active', 'Staff', 'Operations', 'Branch A', true, true, false)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  user_type = EXCLUDED.user_type,
  status = EXCLUDED.status,
  position = EXCLUDED.position,
  division = EXCLUDED.division,
  branch = EXCLUDED.branch,
  must_create_daily = EXCLUDED.must_create_daily,
  must_create_weekly = EXCLUDED.must_create_weekly,
  must_create_monthly = EXCLUDED.must_create_monthly;
