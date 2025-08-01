-- Create Row Level Security policies for all tables
-- Run this after creating tables

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

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create simple, non-recursive policies for profiles
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

-- Admin can view all user profiles
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

SELECT 'RLS policies created successfully!' as message;

COMMIT;
