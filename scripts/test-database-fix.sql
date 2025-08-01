-- LANGKAH 4: Test apakah database sudah benar
-- Jalankan script ini untuk memastikan semuanya berfungsi

-- 1. Cek struktur tabel tasks
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
ORDER BY ordinal_position;

-- 2. Cek apakah user profile sudah ada
SELECT id, username, full_name, user_type 
FROM user_profiles 
WHERE id = auth.uid();

-- 3. Test insert task sederhana
INSERT INTO tasks (
  user_id,
  task_type,
  title,
  category,
  priority,
  task_date
) VALUES (
  auth.uid(),
  'daily',
  'Test Task',
  'result',
  'medium',
  CURRENT_DATE
);

-- 4. Cek apakah task berhasil dibuat
SELECT id, title, category, task_type, created_at 
FROM tasks 
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 5;
