-- Create comprehensive TAL database schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS task_assignments CASCADE;
DROP TABLE IF EXISTS task_attachments CASCADE;
DROP TABLE IF EXISTS daily_reports CASCADE;
DROP TABLE IF EXISTS weekly_reports CASCADE;
DROP TABLE IF EXISTS monthly_reports CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS holidays CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Create user_profiles table (extends the existing profiles)
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  username varchar(50) UNIQUE NOT NULL,
  employee_id varchar(20) UNIQUE,
  full_name varchar(100) NOT NULL,
  position varchar(100),
  division varchar(100),
  branch varchar(100),
  phone varchar(20),
  join_date date DEFAULT CURRENT_DATE,
  resign_date date,
  status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'resigned', 'suspended')),
  user_type varchar(20) DEFAULT 'employee' CHECK (user_type IN ('admin', 'hr', 'auditor', 'employee')),
  must_create_daily boolean DEFAULT true,
  must_create_weekly boolean DEFAULT true,
  must_create_monthly boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tasks table
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task_type varchar(20) NOT NULL CHECK (task_type IN ('daily', 'weekly', 'monthly')),
  
  -- Date fields
  task_date date, -- For daily tasks
  week_start_date date, -- For weekly tasks  
  month_year varchar(7), -- Format: YYYY-MM for monthly tasks
  
  -- Basic task info
  title varchar(200) NOT NULL,
  description text,
  parent_task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
  
  -- Task categorization
  category varchar(20) NOT NULL CHECK (category IN ('result', 'non_result')),
  target_value decimal(15,2),
  target_unit varchar(50), -- 'rupiah', 'noa', 'unit', 'custom'
  priority varchar(10) NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  
  -- Task status and progress
  status varchar(20) DEFAULT 'pending' CHECK (status IN ('pending', 'on_progress', 'done')),
  notes text,
  
  -- Locking and reporting
  is_locked boolean DEFAULT false,
  locked_at timestamptz,
  is_reported boolean DEFAULT false,
  reported_at timestamptz,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create task_assignments table (for multi-user assignments)
CREATE TABLE task_assignments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  assigned_to_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(task_id, assigned_to_id)
);

-- Create task_attachments table
CREATE TABLE task_attachments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  file_name varchar(255) NOT NULL,
  file_path varchar(500) NOT NULL,
  file_type varchar(50),
  file_size bigint,
  uploaded_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create daily_reports table
CREATE TABLE daily_reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  report_date date NOT NULL,
  week_number integer NOT NULL,
  total_tasks integer DEFAULT 0,
  completed_tasks integer DEFAULT 0,
  additional_tasks integer DEFAULT 0,
  planning_score decimal(5,2) DEFAULT 0, -- 100% or 50%
  task_score decimal(5,2) DEFAULT 0, -- Calculated from tasks
  report_score decimal(5,2) DEFAULT 0, -- 100% or 50%
  is_submitted boolean DEFAULT false,
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, report_date)
);

-- Create weekly_reports table
CREATE TABLE weekly_reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start_date date NOT NULL,
  week_number integer NOT NULL,
  month_year varchar(7) NOT NULL,
  total_tasks integer DEFAULT 0,
  completed_tasks integer DEFAULT 0,
  planning_score decimal(5,2) DEFAULT 0,
  task_score decimal(5,2) DEFAULT 0,
  report_score decimal(5,2) DEFAULT 0,
  tal_score decimal(5,2) DEFAULT 0, -- Weekly TAL score
  is_submitted boolean DEFAULT false,
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_start_date)
);

-- Create monthly_reports table
CREATE TABLE monthly_reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month_year varchar(7) NOT NULL,
  total_tasks integer DEFAULT 0,
  completed_tasks integer DEFAULT 0,
  planning_score decimal(5,2) DEFAULT 0,
  task_score decimal(5,2) DEFAULT 0,
  report_score decimal(5,2) DEFAULT 0,
  avg_weekly_tal decimal(5,2) DEFAULT 0,
  monthly_tal_score decimal(5,2) DEFAULT 0,
  is_submitted boolean DEFAULT false,
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Create holidays table
CREATE TABLE holidays (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  holiday_date date NOT NULL UNIQUE,
  name varchar(100) NOT NULL,
  description text,
  is_national boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create system_settings table
CREATE TABLE system_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key varchar(100) NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_task_type ON tasks(task_type);
CREATE INDEX idx_tasks_task_date ON tasks(task_date);
CREATE INDEX idx_tasks_week_start_date ON tasks(week_start_date);
CREATE INDEX idx_tasks_month_year ON tasks(month_year);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_is_locked ON tasks(is_locked);
CREATE INDEX idx_tasks_is_reported ON tasks(is_reported);

CREATE INDEX idx_daily_reports_user_date ON daily_reports(user_id, report_date);
CREATE INDEX idx_weekly_reports_user_week ON weekly_reports(user_id, week_start_date);
CREATE INDEX idx_monthly_reports_user_month ON monthly_reports(user_id, month_year);

CREATE INDEX idx_task_assignments_task_id ON task_assignments(task_id);
CREATE INDEX idx_task_assignments_assigned_to ON task_assignments(assigned_to_id);

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "HR and Admin can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.user_type IN ('admin', 'hr')
    )
  );

CREATE POLICY "Admin can manage all profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.user_type = 'admin'
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

CREATE POLICY "HR and Admin can view all tasks" ON tasks
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

-- Reports policies (similar pattern for all report tables)
CREATE POLICY "Users can manage own daily reports" ON daily_reports
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "HR and Admin can view all daily reports" ON daily_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.user_type IN ('admin', 'hr', 'auditor')
    )
  );

CREATE POLICY "Users can manage own weekly reports" ON weekly_reports
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "HR and Admin can view all weekly reports" ON weekly_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.user_type IN ('admin', 'hr', 'auditor')
    )
  );

CREATE POLICY "Users can manage own monthly reports" ON monthly_reports
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "HR and Admin can view all monthly reports" ON monthly_reports
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

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_reports_updated_at BEFORE UPDATE ON daily_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_reports_updated_at BEFORE UPDATE ON weekly_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
