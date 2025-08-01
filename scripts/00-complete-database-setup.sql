-- COMPLETE TAL DATABASE SETUP
-- This single script will create everything from scratch
-- Run this ONE script to set up the entire database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop all existing tables and objects first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS update_daily_reports_updated_at ON daily_reports;
DROP TRIGGER IF EXISTS update_weekly_reports_updated_at ON weekly_reports;
DROP TRIGGER IF EXISTS update_monthly_reports_updated_at ON monthly_reports;
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;

DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.is_admin(uuid);

DROP TABLE IF EXISTS task_assignments CASCADE;
DROP TABLE IF EXISTS task_attachments CASCADE;
DROP TABLE IF EXISTS daily_reports CASCADE;
DROP TABLE IF EXISTS weekly_reports CASCADE;
DROP TABLE IF EXISTS monthly_reports CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS holidays CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table (base user table)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    suspended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_profiles table (extends profiles with TAL-specific fields)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    employee_id VARCHAR(20) UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    position VARCHAR(100),
    division VARCHAR(100),
    branch VARCHAR(100),
    phone VARCHAR(20),
    join_date DATE DEFAULT CURRENT_DATE,
    resign_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resigned', 'suspended')),
    user_type VARCHAR(20) DEFAULT 'employee' CHECK (user_type IN ('admin', 'hr', 'auditor', 'employee')),
    must_create_daily BOOLEAN DEFAULT true,
    must_create_weekly BOOLEAN DEFAULT true,
    must_create_monthly BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table with proper category column
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    task_type VARCHAR(20) NOT NULL CHECK (task_type IN ('daily', 'weekly', 'monthly')),
    
    -- Date fields
    task_date DATE, -- For daily tasks
    week_start_date DATE, -- For weekly tasks  
    month_year VARCHAR(7), -- Format: YYYY-MM for monthly tasks
    
    -- Basic task info
    title VARCHAR(200) NOT NULL,
    description TEXT,
    parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    
    -- Task categorization - THIS IS THE IMPORTANT COLUMN
    category VARCHAR(20) NOT NULL CHECK (category IN ('result', 'non_result')),
    target_value DECIMAL(15,2),
    target_unit VARCHAR(50), -- 'rupiah', 'noa', 'unit', 'custom'
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    
    -- Task status and progress
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'on_progress', 'done')),
    notes TEXT,
    
    -- Locking and reporting
    is_locked BOOLEAN DEFAULT false,
    locked_at TIMESTAMPTZ,
    is_reported BOOLEAN DEFAULT false,
    reported_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create task_assignments table (for multi-user assignments)
CREATE TABLE task_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    assigned_to_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_by_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(task_id, assigned_to_id)
);

-- Create task_attachments table
CREATE TABLE task_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create daily_reports table
CREATE TABLE daily_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    week_number INTEGER NOT NULL,
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    additional_tasks INTEGER DEFAULT 0,
    planning_score DECIMAL(5,2) DEFAULT 0,
    task_score DECIMAL(5,2) DEFAULT 0,
    report_score DECIMAL(5,2) DEFAULT 0,
    is_submitted BOOLEAN DEFAULT false,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, report_date)
);

-- Create weekly_reports table
CREATE TABLE weekly_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    week_number INTEGER NOT NULL,
    month_year VARCHAR(7) NOT NULL,
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    planning_score DECIMAL(5,2) DEFAULT 0,
    task_score DECIMAL(5,2) DEFAULT 0,
    report_score DECIMAL(5,2) DEFAULT 0,
    tal_score DECIMAL(5,2) DEFAULT 0,
    is_submitted BOOLEAN DEFAULT false,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, week_start_date)
);

-- Create monthly_reports table
CREATE TABLE monthly_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL,
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    planning_score DECIMAL(5,2) DEFAULT 0,
    task_score DECIMAL(5,2) DEFAULT 0,
    report_score DECIMAL(5,2) DEFAULT 0,
    avg_weekly_tal DECIMAL(5,2) DEFAULT 0,
    monthly_tal_score DECIMAL(5,2) DEFAULT 0,
    is_submitted BOOLEAN DEFAULT false,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, month_year)
);

-- Create holidays table
CREATE TABLE holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    holiday_date DATE NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_national BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create system_settings table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_task_type ON tasks(task_type);
CREATE INDEX idx_tasks_task_date ON tasks(task_date);
CREATE INDEX idx_tasks_week_start_date ON tasks(week_start_date);
CREATE INDEX idx_tasks_month_year ON tasks(month_year);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_is_locked ON tasks(is_locked);
CREATE INDEX idx_tasks_is_reported ON tasks(is_reported);
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_user_type ON user_profiles(user_type);
CREATE INDEX idx_user_profiles_status ON user_profiles(status);
CREATE INDEX idx_daily_reports_user_date ON daily_reports(user_id, report_date);
CREATE INDEX idx_weekly_reports_user_week ON weekly_reports(user_id, week_start_date);
CREATE INDEX idx_monthly_reports_user_month ON monthly_reports(user_id, month_year);
CREATE INDEX idx_task_assignments_task_id ON task_assignments(task_id);
CREATE INDEX idx_task_assignments_assigned_to ON task_assignments(assigned_to_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = user_id 
        AND user_type = 'admin'
    );
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_reports_updated_at
    BEFORE UPDATE ON daily_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_reports_updated_at
    BEFORE UPDATE ON weekly_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_reports_updated_at
    BEFORE UPDATE ON monthly_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User profiles policies
CREATE POLICY "Users can view own user profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own user profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own user profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can view all user profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.user_type IN ('admin', 'hr', 'auditor')
        )
    );

-- Tasks policies
CREATE POLICY "Users can manage own tasks" ON tasks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view assigned tasks" ON tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM task_assignments ta 
            WHERE ta.task_id = tasks.id 
            AND ta.assigned_to_id = auth.uid()
        )
    );

CREATE POLICY "Admin can view all tasks" ON tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.user_type IN ('admin', 'hr', 'auditor')
        )
    );

-- Task assignments policies
CREATE POLICY "Users can view own assignments" ON task_assignments
    FOR SELECT USING (
        auth.uid() = assigned_to_id OR 
        auth.uid() = assigned_by_id OR
        EXISTS (
            SELECT 1 FROM tasks t 
            WHERE t.id = task_assignments.task_id 
            AND t.user_id = auth.uid()
        )
    );

CREATE POLICY "Task owners can manage assignments" ON task_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tasks t 
            WHERE t.id = task_assignments.task_id 
            AND t.user_id = auth.uid()
        )
    );

-- Reports policies
CREATE POLICY "Users can manage own daily reports" ON daily_reports
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all daily reports" ON daily_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.user_type IN ('admin', 'hr', 'auditor')
        )
    );

CREATE POLICY "Users can manage own weekly reports" ON weekly_reports
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all weekly reports" ON weekly_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.user_type IN ('admin', 'hr', 'auditor')
        )
    );

CREATE POLICY "Users can manage own monthly reports" ON monthly_reports
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all monthly reports" ON monthly_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.user_type IN ('admin', 'hr', 'auditor')
        )
    );

-- Holidays policies (read-only for all users)
CREATE POLICY "All users can view holidays" ON holidays
    FOR SELECT USING (true);

CREATE POLICY "Admin can manage holidays" ON holidays
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.user_type = 'admin'
        )
    );

-- System settings policies
CREATE POLICY "All users can view settings" ON system_settings
    FOR SELECT USING (true);

CREATE POLICY "Admin can manage settings" ON system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.user_type = 'admin'
        )
    );

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

-- Insert Indonesian national holidays for 2024-2025
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
('2024-12-25', 'Hari Raya Natal', 'Christmas Day', true),
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

-- Show completion message
SELECT 'Database setup completed successfully!' as message;
SELECT 'Tables created: ' || COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';
SELECT 'System settings: ' || COUNT(*) as settings_count FROM system_settings;
SELECT 'Holidays: ' || COUNT(*) as holidays_count FROM holidays;

COMMIT;
