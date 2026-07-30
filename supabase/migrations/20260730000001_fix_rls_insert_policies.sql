-- Fix missing INSERT RLS policies that block notification creation and scan data

-- Allow students to insert their own notifications
CREATE POLICY IF NOT EXISTS "Allow students to insert notifications for themselves"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow service role to insert any notifications (used by server actions)
-- This is implicitly allowed for service_role, but adding explicit policies for anon/authenticated

-- Allow students to insert their own scan_logs
CREATE POLICY IF NOT EXISTS "Allow students to insert scan logs"
  ON public.scan_logs FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Allow students to insert completions for themselves
CREATE POLICY IF NOT EXISTS "Allow students to insert their own completions"
  ON public.student_destinations FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Allow students to insert activity logs
CREATE POLICY IF NOT EXISTS "Allow students to insert activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to insert notifications for themselves
CREATE POLICY IF NOT EXISTS "Allow authenticated to insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
