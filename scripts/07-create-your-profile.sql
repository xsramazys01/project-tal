-- Create profile for the current authenticated user
-- Run this after all other scripts to set up your user account

DO $$
DECLARE
    current_user_id UUID;
    current_email TEXT;
    username_from_email TEXT;
BEGIN
    -- Get current authenticated user
    SELECT auth.uid(), auth.email() INTO current_user_id, current_email;
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'No authenticated user found. Please login first.';
    END IF;
    
    IF current_email IS NULL THEN
        RAISE EXCEPTION 'User email not found. Please check your authentication.';
    END IF;
    
    -- Extract username from email
    username_from_email := SPLIT_PART(current_email, '@', 1);
    
    -- Create or update profile
    INSERT INTO profiles (id, email, full_name, role)
    VALUES (
        current_user_id, 
        current_email, 
        INITCAP(REPLACE(username_from_email, '.', ' ')), -- Convert john.doe to John Doe
        'user'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = NOW();
    
    RAISE NOTICE '✅ Profile created for: %', current_email;
    
    -- Create or update user_profile
    INSERT INTO user_profiles (
        id,
        username,
        full_name,
        position,
        division,
        user_type,
        status,
        must_create_daily,
        must_create_weekly,
        must_create_monthly
    ) VALUES (
        current_user_id,
        username_from_email,
        INITCAP(REPLACE(username_from_email, '.', ' ')),
        'Employee', -- Default position
        'General', -- Default division
        'employee', -- Default user type
        'active',
        true,
        true,
        false
    )
    ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        full_name = EXCLUDED.full_name,
        updated_at = NOW();
    
    RAISE NOTICE '✅ User profile created with username: %', username_from_email;
    
    -- Show created profile
    RAISE NOTICE '📋 Your profile details:';
    RAISE NOTICE '   Email: %', current_email;
    RAISE NOTICE '   Username: %', username_from_email;
    RAISE NOTICE '   User Type: employee';
    RAISE NOTICE '   Status: active';
    
END $$;

-- Verify the profile was created
SELECT 
    '✅ PROFILE VERIFICATION' as check_type,
    p.email,
    p.full_name,
    p.role,
    up.username,
    up.user_type,
    up.status,
    'Profile successfully created!' as message
FROM profiles p
JOIN user_profiles up ON p.id = up.id
WHERE p.id = auth.uid();
