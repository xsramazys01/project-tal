-- Drop all existing tables and start fresh
-- Run this first to clean up everything

-- Disable RLS first to avoid dependency issues
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS weekly_focus_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS task_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS task_attachments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS daily_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS weekly_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS monthly_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS holidays DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS system_settings DISABLE ROW LEVEL SECURITY;

-- Drop all triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS create_default_categories_trigger ON public.profiles;
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS handle_updated_at ON public.categories;
DROP TRIGGER IF EXISTS handle_updated_at ON public.tasks;
DROP TRIGGER IF EXISTS handle_updated_at ON public.weekly_focus_goals;
DROP TRIGGER IF EXISTS handle_updated_at ON public.admin_settings;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS update_daily_reports_updated_at ON daily_reports;
DROP TRIGGER IF EXISTS update_weekly_reports_updated_at ON weekly_reports;
DROP TRIGGER IF EXISTS update_monthly_reports_updated_at ON monthly_reports;
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;

-- Drop all functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_updated_at();
DROP FUNCTION IF EXISTS public.create_default_categories();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS is_admin(uuid);

-- Drop all tables in correct order (child tables first)
DROP TABLE IF EXISTS task_assignments CASCADE;
DROP TABLE IF EXISTS task_attachments CASCADE;
DROP TABLE IF EXISTS daily_reports CASCADE;
DROP TABLE IF EXISTS weekly_reports CASCADE;
DROP TABLE IF EXISTS monthly_reports CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS admin_logs CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS weekly_focus_goals CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS holidays CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS admin_settings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Show what tables remain
SELECT 'Cleanup completed. Remaining tables:' as message;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

COMMIT;
