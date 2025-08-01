-- LANGKAH 3: Buat user profile untuk user yang sedang login
-- Ganti USER_ID_ANDA dengan ID user Anda yang sebenarnya

-- Cara mendapatkan user ID Anda:
-- SELECT auth.uid(); -- Jalankan ini dulu untuk mendapatkan ID Anda

-- Kemudian jalankan script ini (ganti 'USER_ID_ANDA' dengan ID yang didapat):
INSERT INTO user_profiles (
  id, 
  username, 
  full_name, 
  user_type, 
  status,
  position,
  division,
  branch,
  must_create_daily, 
  must_create_weekly, 
  must_create_monthly
) VALUES (
  auth.uid(), -- Ini akan menggunakan ID user yang sedang login
  'user_' || SUBSTRING(auth.uid()::text, 1, 8), -- Username unik
  'Test User',
  'employee',
  'active',
  'Staff',
  'Operations',
  'Head Office',
  true,
  true,
  false
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  user_type = EXCLUDED.user_type,
  updated_at = now();
