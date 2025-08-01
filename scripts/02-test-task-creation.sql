-- Test task creation to verify the category column works
-- Run this after creating your user profile

DO $$
DECLARE
    test_task_id UUID;
    current_user_id UUID;
    current_email TEXT;
BEGIN
    SELECT auth.uid(), auth.email() INTO current_user_id, current_email;
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'ERROR: No authenticated user found. Please login first!';
    END IF;
    
    -- Check if profile exists
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = current_user_id) THEN
        RAISE EXCEPTION 'ERROR: Profile not found. Please run the create-user-profile script first!';
    END IF;
    
    -- Test creating a task with category 'result'
    INSERT INTO tasks (
        user_id,
        task_type,
        task_date,
        title,
        description,
        category,
        target_value,
        target_unit,
        priority,
        status
    ) VALUES (
        current_user_id,
        'daily',
        CURRENT_DATE,
        'Test Result Task',
        'This is a test task with result category',
        'result',
        1000000,
        'rupiah',
        'high',
        'pending'
    ) RETURNING id INTO test_task_id;
    
    RAISE NOTICE '✅ Test RESULT task created successfully with ID: %', test_task_id;
    
    -- Test creating a task with category 'non_result'
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
        'Test Non-Result Task',
        'This is a test task with non-result category',
        'non_result',
        'medium',
        'pending'
    ) RETURNING id INTO test_task_id;
    
    RAISE NOTICE '✅ Test NON-RESULT task created successfully with ID: %', test_task_id;
    
    -- Show created tasks
    RAISE NOTICE '📋 Your test tasks:';
    
    -- Clean up test tasks
    DELETE FROM tasks WHERE user_id = current_user_id AND title LIKE 'Test%Task';
    RAISE NOTICE '✅ Test tasks cleaned up';
    
    RAISE NOTICE '🎉 TASK CREATION TEST PASSED! The category column is working correctly.';
    
END $$;

-- Verify task table structure
SELECT 
    'TASK TABLE STRUCTURE' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' 
    AND table_schema = 'public'
    AND column_name IN ('category', 'target_value', 'target_unit')
ORDER BY column_name;
