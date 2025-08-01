-- LANGKAH 2: Pastikan tabel user_profiles ada
-- Jalankan script ini setelah langkah 1

-- Cek apakah tabel user_profiles sudah ada, jika belum buat
CREATE TABLE IF NOT EXISTS user_profiles (
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

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create trigger
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
