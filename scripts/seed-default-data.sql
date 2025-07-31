-- Seed default categories for new users
-- This will be called when a new user signs up

-- Function to create default categories for a user
CREATE OR REPLACE FUNCTION create_default_categories(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.categories (user_id, name, color, emoji) VALUES
    (user_uuid, 'Work', 'bg-blue-500', '💼'),
    (user_uuid, 'Personal', 'bg-green-500', '🏠'),
    (user_uuid, 'Health', 'bg-red-500', '💪'),
    (user_uuid, 'Learning', 'bg-purple-500', '📚'),
    (user_uuid, 'Finance', 'bg-yellow-500', '💰');
END;
$$ LANGUAGE plpgsql;

-- Function to create user profile and default data
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Create default categories
  PERFORM create_default_categories(NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile and default data for new users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
