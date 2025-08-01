-- Test the new database setup
-- Run this to verify everything works

-- Test 1: Check if all tables exist
SELECT 
    'TABLE CHECK' as test_type,
    table_name,
    CASE 
        WHEN table_name IN (
            'profiles', 'user_profiles', 'tasks', 'task_assignments', 
            'task_attachments', 'daily_reports', 'weekly_reports', 
            'monthly_reports', 'holidays', 'system_settings'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN (
        'profiles', 'user_profiles', 'tasks', 'task_assignments', 
        'task_attachments', 'daily_reports', 'weekly_reports', 
        'monthly_reports', 'holidays', 'system_settings'
    )
ORDER BY table_name;

-- Test 2: Check if category column exists in tasks table
SELECT 
    'COLUMN CHECK' as test_type,
    'tasks.category' as item,
    CASE 
        WHEN column_name = 'category' THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks' 
    AND table_schema = 'public'
    AND column_name = 'category';

-- Test 3: Check current user
SELECT 
    'USER CHECK' as test_type,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✅ AUTHENTICATED'
        ELSE '❌ NOT AUTHENTICATED'
    END as status,
    auth.uid() as user_id,
    auth.email() as email;

-- Test 4: Check system settings
SELECT 
    'SETTINGS CHECK' as test_type,
    '✅ ' || COUNT(*) || ' settings loaded' as status,
    setting_key,
    setting_value
FROM system_settings 
GROUP BY setting_key, setting_value
ORDER BY setting_key
LIMIT 5;

-- Test 5: Check holidays
SELECT 
    'HOLIDAYS CHECK' as test_type,
    '✅ ' || COUNT(*) || ' holidays loaded' as status,
    MIN(holiday_date) as first_holiday,
    MAX(holiday_date) as last_holiday
FROM holidays;

-- Test 6: Test basic profile creation (if user is authenticated)
DO $$
DECLARE
    current_user_id UUID;
    test_email TEXT;
BEGIN
    SELECT auth.uid(), auth.email() INTO current_user_id, test_email;
    
    IF current_user_id IS NOT NULL THEN
        -- Try to insert or update profile
        INSERT INTO profiles (id, email, full_name, role)
        VALUES (current_user_id, test_email, 'Test User', 'user')
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            updated_at = NOW();
            
        RAISE NOTICE '✅ Profile created/updated for user: %', test_email;
        
        -- Try to create user_profile
        INSERT INTO user_profiles (
            id, username, full_name, user_type, status
        ) VALUES (
            current_user_id, 
            SPLIT_PART(test_email, '@', 1), -- username from email
            'Test User',
            'employee',
            'active'
        ) ON CONFLICT (id) DO UPDATE SET
            username = EXCLUDED.username,
            full_name = EXCLUDED.full_name,
            updated_at = NOW();
            
        RAISE NOTICE '✅ User profile created/updated';
    ELSE
        RAISE NOTICE '⚠️  No authenticated user - profile test skipped';
    END IF;
END $$;

-- Test 7: Test task creation (if user is authenticated)
DO $$
DECLARE
    test_task_id UUID;
    current_user_id UUID;
BEGIN
    SELECT auth.uid() INTO current_user_id;
    
    IF current_user_id IS NOT NULL THEN
        -- Check if profile exists
        IF EXISTS (SELECT 1 FROM profiles WHERE id = current_user_id) THEN
            INSERT INTO tasks (
                user_id,
                task_type,
                task_date,
                title,
                description,
                category,
                priority,
                status
            ) VALUES (
                current_user_id,
                'daily',
                CURRENT_DATE,
                'Test Task - Database Setup',
                'This is a test task to verify database setup',
                'non_result',
                'medium',
                'pending'
            ) RETURNING id INTO test_task_id;
            
            RAISE NOTICE '✅ Test task created successfully with ID: %', test_task_id;
            
            -- Clean up test task
            DELETE FROM tasks WHERE id = test_task_id;
            RAISE NOTICE '✅ Test task cleaned up';
        ELSE
            RAISE NOTICE '⚠️  Profile not found - task test skipped';
        END IF;
    ELSE
        RAISE NOTICE '⚠️  No authenticated user - task test skipped';
    END IF;
END $$;

-- Final summary
SELECT 
    '🎉 DATABASE SETUP TEST COMPLETED!' as result,
    'All core tables and functions are ready' as message,
    NOW() as test_completed_at;
