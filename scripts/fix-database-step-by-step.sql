-- LANGKAH 1: Hapus tabel yang bermasalah dan buat ulang
-- Jalankan script ini di Supabase SQL Editor

-- 1. Hapus tabel tasks yang bermasalah
DROP TABLE IF EXISTS tasks CASCADE;

-- 2. Buat ulang tabel tasks dengan struktur yang benar
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
  
  -- Task categorization - INI YANG PENTING!
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

-- 3. Buat indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_task_type ON tasks(task_type);
CREATE INDEX idx_tasks_task_date ON tasks(task_date);
CREATE INDEX idx_tasks_week_start_date ON tasks(week_start_date);
CREATE INDEX idx_tasks_month_year ON tasks(month_year);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_category ON tasks(category);

-- 4. Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 5. Buat RLS policies
CREATE POLICY "Users can manage own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "HR and Admin can view all tasks" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.user_type IN ('admin', 'hr', 'auditor')
    )
  );

-- 6. Buat trigger untuk updated_at
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
