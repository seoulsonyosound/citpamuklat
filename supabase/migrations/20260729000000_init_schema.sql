-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  student_id TEXT,
  course TEXT,
  section TEXT,
  year_level TEXT,
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create destinations table
CREATE TABLE IF NOT EXISTS public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT NOT NULL,
  representative TEXT NOT NULL,
  stamp_image_url TEXT,
  destination_color TEXT DEFAULT '#2563EB',
  icon TEXT DEFAULT 'MapPin',
  status TEXT DEFAULT 'active', -- 'active', 'inactive'
  gate_number TEXT NOT NULL,
  estimated_duration TEXT NOT NULL,
  qr_token_hash TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for destinations
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

-- Create student_destinations table (Completions)
CREATE TABLE IF NOT EXISTS public.student_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE NOT NULL,
  completion_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, destination_id)
);

-- Enable RLS for student_destinations
ALTER TABLE public.student_destinations ENABLE ROW LEVEL SECURITY;

-- Create scan_logs table
CREATE TABLE IF NOT EXISTS public.scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE NOT NULL,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL, -- 'success', 'failed'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for scan_logs
ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_role TEXT, -- 'student', 'admin'
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_role TEXT NOT NULL, -- 'student', 'admin'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-----------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES --
-----------------------------------------

-- Profiles Policies
CREATE POLICY "Allow students to view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow students to update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Destinations Policies
CREATE POLICY "Allow authenticated passengers to view active destinations" ON public.destinations
  FOR SELECT USING (auth.role() = 'authenticated' AND status = 'active');

-- Student Destinations Policies
CREATE POLICY "Allow students to view their own completions" ON public.student_destinations
  FOR SELECT USING (auth.uid() = student_id);

-- Scan Logs Policies
CREATE POLICY "Allow students to view their own scan history" ON public.scan_logs
  FOR SELECT USING (auth.uid() = student_id);

-- Notifications Policies
CREATE POLICY "Allow users to view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id OR (user_id IS NULL AND user_role = 'admin'));

CREATE POLICY "Allow users to update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id OR (user_id IS NULL AND user_role = 'admin'));

-----------------------------------------
-- AUTOMATIC PROFILE CREATION TRIGGER --
-----------------------------------------

-- Create function to handle auto user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Freshman Student'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
