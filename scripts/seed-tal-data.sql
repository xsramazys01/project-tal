-- Seed data for TAL system

-- Insert default user profiles
INSERT INTO user_profiles (id, username, full_name, user_type, status, must_create_daily, must_create_weekly, must_create_monthly)
SELECT 
  id,
  CASE 
    WHEN email = 'admin@tal.com' THEN 'admin'
    WHEN email = 'hr@tal.com' THEN 'hr'
    WHEN email = 'audit@tal.com' THEN 'audit'
    WHEN email = 'karyawan@tal.com' THEN 'karyawan'
    ELSE LOWER(SPLIT_PART(email, '@', 1))
  END as username,
  CASE 
    WHEN email = 'admin@tal.com' THEN 'Administrator'
    WHEN email = 'hr@tal.com' THEN 'HR Manager'
    WHEN email = 'audit@tal.com' THEN 'Auditor'
    WHEN email = 'karyawan@tal.com' THEN 'Karyawan'
    ELSE 'User'
  END as full_name,
  CASE 
    WHEN email = 'admin@tal.com' THEN 'admin'
    WHEN email = 'hr@tal.com' THEN 'hr'
    WHEN email = 'audit@tal.com' THEN 'auditor'
    WHEN email = 'karyawan@tal.com' THEN 'employee'
    ELSE 'employee'
  END as user_type,
  'active' as status,
  true as must_create_daily,
  true as must_create_weekly,
  CASE 
    WHEN email IN ('admin@tal.com', 'hr@tal.com') THEN true
    ELSE false
  END as must_create_monthly
FROM profiles
WHERE email IN ('admin@tal.com', 'hr@tal.com', 'audit@tal.com', 'karyawan@tal.com')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  user_type = EXCLUDED.user_type,
  status = EXCLUDED.status,
  must_create_daily = EXCLUDED.must_create_daily,
  must_create_weekly = EXCLUDED.must_create_weekly,
  must_create_monthly = EXCLUDED.must_create_monthly;

-- Insert some sample holidays
INSERT INTO holidays (holiday_date, name, description, is_national) VALUES
('2024-01-01', 'Tahun Baru', 'Tahun Baru Masehi', true),
('2024-02-10', 'Tahun Baru Imlek', 'Tahun Baru Imlek 2575 Kongzili', true),
('2024-03-11', 'Hari Raya Nyepi', 'Hari Raya Nyepi Tahun Saka 1946', true),
('2024-03-29', 'Wafat Isa Al Masih', 'Wafat Isa Al Masih', true),
('2024-04-10', 'Hari Raya Idul Fitri', 'Hari Raya Idul Fitri 1445 H', true),
('2024-04-11', 'Hari Raya Idul Fitri', 'Hari Raya Idul Fitri 1445 H', true),
('2024-05-01', 'Hari Buruh', 'Hari Buruh Internasional', true),
('2024-05-09', 'Kenaikan Isa Al Masih', 'Kenaikan Isa Al Masih', true),
('2024-05-23', 'Hari Raya Waisak', 'Hari Raya Waisak 2568', true),
('2024-06-01', 'Hari Lahir Pancasila', 'Hari Lahir Pancasila', true),
('2024-06-17', 'Hari Raya Idul Adha', 'Hari Raya Idul Adha 1445 H', true),
('2024-07-07', 'Tahun Baru Islam', 'Tahun Baru Islam 1446 H', true),
('2024-08-17', 'Hari Kemerdekaan RI', 'Hari Kemerdekaan Republik Indonesia', true),
('2024-09-16', 'Maulid Nabi Muhammad SAW', 'Maulid Nabi Muhammad SAW', true),
('2024-12-25', 'Hari Raya Natal', 'Hari Raya Natal', true)
ON CONFLICT (holiday_date) DO NOTHING;

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('daily_lock_deadline_hours', '48', 'Deadline untuk lock rencana harian (dalam jam dari awal minggu)'),
('weekly_lock_deadline_hours', '48', 'Deadline untuk lock rencana mingguan (dalam jam dari awal minggu)'),
('monthly_lock_deadline_hours', '48', 'Deadline untuk lock rencana bulanan (dalam jam dari awal bulan)'),
('daily_report_deadline_hours', '34', 'Deadline untuk laporan harian (dalam jam dari akhir hari, max H+1 jam 10:00)'),
('weekly_report_deadline_hours', '34', 'Deadline untuk laporan mingguan (dalam jam dari akhir minggu, max H+1 jam 10:00)'),
('monthly_report_deadline_hours', '34', 'Deadline untuk laporan bulanan (dalam jam dari akhir bulan, max H+1 jam 10:00)'),
('working_days', '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]', 'Hari kerja dalam seminggu'),
('tal_calculation_weights', '{"daily_planning": 0.4, "daily_reporting": 0.2, "weekly_task": 0.3, "weekly_reporting": 0.1}', 'Bobot perhitungan nilai TAL mingguan'),
('monthly_tal_weights', '{"avg_weekly": 0.7, "monthly_task": 0.15, "monthly_reporting": 0.15}', 'Bobot perhitungan nilai TAL bulanan')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description;
