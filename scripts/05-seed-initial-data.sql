-- Seed initial data for the TAL system
-- Run this after creating all tables, policies, and functions

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('app_name', '"TAL System"', 'Application name'),
('app_version', '"1.0.0"', 'Application version'),
('max_daily_tasks', '10', 'Maximum daily tasks per user'),
('max_weekly_tasks', '5', 'Maximum weekly tasks per user'),
('max_monthly_tasks', '3', 'Maximum monthly tasks per user'),
('task_lock_time', '"17:00"', 'Time when daily tasks are locked'),
('report_deadline', '"23:59"', 'Daily report submission deadline'),
('scoring_weights', '{"planning": 0.3, "task": 0.4, "report": 0.3}', 'Scoring calculation weights'),
('target_units', '["rupiah", "noa", "unit", "custom"]', 'Available target units for result tasks'),
('working_days', '[1,2,3,4,5]', 'Working days (1=Monday, 7=Sunday)');

-- Insert Indonesian national holidays for 2024
INSERT INTO holidays (holiday_date, name, description, is_national) VALUES
('2024-01-01', 'Tahun Baru', 'New Year Day', true),
('2024-02-10', 'Tahun Baru Imlek', 'Chinese New Year', true),
('2024-03-11', 'Hari Raya Nyepi', 'Nyepi (Balinese New Year)', true),
('2024-03-29', 'Wafat Isa Al Masih', 'Good Friday', true),
('2024-04-10', 'Hari Raya Idul Fitri', 'Eid al-Fitr Day 1', true),
('2024-04-11', 'Hari Raya Idul Fitri', 'Eid al-Fitr Day 2', true),
('2024-05-01', 'Hari Buruh', 'Labor Day', true),
('2024-05-09', 'Kenaikan Isa Al Masih', 'Ascension of Jesus Christ', true),
('2024-05-23', 'Hari Raya Waisak', 'Vesak Day', true),
('2024-06-01', 'Hari Lahir Pancasila', 'Pancasila Day', true),
('2024-06-17', 'Hari Raya Idul Adha', 'Eid al-Adha', true),
('2024-07-07', 'Tahun Baru Islam', 'Islamic New Year', true),
('2024-08-17', 'Hari Kemerdekaan RI', 'Indonesian Independence Day', true),
('2024-09-16', 'Maulid Nabi Muhammad', 'Prophet Muhammad Birthday', true),
('2024-12-25', 'Hari Raya Natal', 'Christmas Day', true);

-- Insert holidays for 2025
INSERT INTO holidays (holiday_date, name, description, is_national) VALUES
('2025-01-01', 'Tahun Baru', 'New Year Day', true),
('2025-01-29', 'Tahun Baru Imlek', 'Chinese New Year', true),
('2025-03-14', 'Hari Raya Nyepi', 'Nyepi (Balinese New Year)', true),
('2025-03-30', 'Hari Raya Idul Fitri', 'Eid al-Fitr Day 1', true),
('2025-03-31', 'Hari Raya Idul Fitri', 'Eid al-Fitr Day 2', true),
('2025-04-18', 'Wafat Isa Al Masih', 'Good Friday', true),
('2025-05-01', 'Hari Buruh', 'Labor Day', true),
('2025-05-12', 'Hari Raya Waisak', 'Vesak Day', true),
('2025-05-29', 'Kenaikan Isa Al Masih', 'Ascension of Jesus Christ', true),
('2025-06-01', 'Hari Lahir Pancasila', 'Pancasila Day', true),
('2025-06-06', 'Hari Raya Idul Adha', 'Eid al-Adha', true),
('2025-06-26', 'Tahun Baru Islam', 'Islamic New Year', true),
('2025-08-17', 'Hari Kemerdekaan RI', 'Indonesian Independence Day', true),
('2025-09-05', 'Maulid Nabi Muhammad', 'Prophet Muhammad Birthday', true),
('2025-12-25', 'Hari Raya Natal', 'Christmas Day', true);

SELECT 'Initial data seeded successfully!' as message;
SELECT 'System settings count: ' || COUNT(*) FROM system_settings;
SELECT 'Holidays count: ' || COUNT(*) FROM holidays;

COMMIT;
