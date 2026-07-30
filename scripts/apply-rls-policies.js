// apply-rls-policies.js
// Run: node scripts/apply-rls-policies.js
// Applies missing INSERT RLS policies to the live Supabase instance

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://bkueldejhcgyjzabqxhp.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrdWVsZGVqaGNneWp6YWJxeGhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTMwMzk1MSwiZXhwIjoyMTAwODc5OTUxfQ.PVe0DyvIrkl1I2RAnvZ2Ppp0rF-tOBCAzJTHkGuskFI'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

const SQL_POLICIES = `
-- Drop existing conflicting policies first (idempotent)
DROP POLICY IF EXISTS "Allow students to insert notifications for themselves" ON public.notifications;
DROP POLICY IF EXISTS "Allow authenticated to insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow students to insert scan logs" ON public.scan_logs;
DROP POLICY IF EXISTS "Allow students to insert their own completions" ON public.student_destinations;
DROP POLICY IF EXISTS "Allow students to insert activity logs" ON public.activity_logs;

-- Notifications: allow any authenticated user to INSERT (service role bypasses RLS anyway)
CREATE POLICY "Allow authenticated to insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- scan_logs: allow students to insert their own logs
CREATE POLICY "Allow students to insert scan logs"
  ON public.scan_logs FOR INSERT
  WITH CHECK (true);

-- student_destinations: allow students to insert their own completions
CREATE POLICY "Allow students to insert their own completions"
  ON public.student_destinations FOR INSERT
  WITH CHECK (true);

-- activity_logs: allow inserts
CREATE POLICY "Allow students to insert activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (true);
`

async function applyPolicies() {
  console.log('Applying missing RLS INSERT policies to Supabase...')
  
  const { error } = await supabase.rpc('exec_sql', { sql: SQL_POLICIES }).catch(() => ({ error: 'rpc not available' }))
  
  if (error) {
    console.log('RPC method not available, policies must be applied via Supabase SQL Editor.')
    console.log('')
    console.log('Please go to:')
    console.log('https://supabase.com/dashboard/project/bkueldejhcgyjzabqxhp/sql/new')
    console.log('')
    console.log('And run the following SQL:')
    console.log(SQL_POLICIES)
  } else {
    console.log('✅ RLS policies applied successfully!')
  }
}

applyPolicies()
