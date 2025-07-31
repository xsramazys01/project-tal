-- Add role column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_reason TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMP WITH TIME ZONE;

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create admin_logs table for audit trail
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_settings
CREATE POLICY "Admin settings viewable by admins" ON public.admin_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admin settings editable by super admins" ON public.admin_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'super_admin'
    )
  );

-- RLS Policies for admin_logs
CREATE POLICY "Admin logs viewable by admins" ON public.admin_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admin logs insertable by admins" ON public.admin_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Insert default admin settings
INSERT INTO public.admin_settings (key, value, description) VALUES
  ('site_name', '"To-Achieve List"', 'Site name displayed in the application'),
  ('max_tasks_per_user', '1000', 'Maximum number of tasks per user'),
  ('registration_enabled', 'true', 'Whether new user registration is enabled'),
  ('maintenance_mode', 'false', 'Whether the site is in maintenance mode'),
  ('session_timeout', '86400', 'Session timeout in seconds (24 hours)')
ON CONFLICT (key) DO NOTHING;

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action TEXT,
  p_target_type TEXT,
  p_target_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.admin_logs (admin_id, action, target_type, target_id, details)
  VALUES (auth.uid(), p_action, p_target_type, p_target_id, p_details)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id 
    AND role IN ('admin', 'super_admin')
    AND NOT suspended
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id 
    AND role = 'super_admin'
    AND NOT suspended
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
