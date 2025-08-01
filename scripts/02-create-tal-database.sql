-- Create complete TAL database schema from scratch
-- Run this after dropping all tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table first (base user table)
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

-- Show created tables
SELECT 'Database tables created successfully:' as message;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

COMMIT;
