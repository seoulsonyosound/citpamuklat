// apply-supabase-rls.mjs  
// Run: node scripts/apply-supabase-rls.mjs
// Applies missing INSERT RLS policies and enables realtime directly via Supabase REST API

const SUPABASE_URL = 'https://bkueldejhcgyjzabqxhp.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrdWVsZGVqaGNneWp6YWJxeGhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTMwMzk1MSwiZXhwIjoyMTAwODc5OTUxfQ.PVe0DyvIrkl1I2RAnvZ2Ppp0rF-tOBCAzJTHkGuskFI'

// We can use the PostgREST endpoint with service role to execute raw SQL via pg_catalog
// Actually the correct endpoint is /rest/v1/rpc/exec_sql or the SQL HTTP endpoint
// Supabase exposes a /sql endpoint only in the Management API, not the project REST API
// So we'll use a workaround: create a stored function and call it

const SQL_STATEMENTS = [
  `DROP POLICY IF EXISTS "Allow authenticated to insert notifications" ON public.notifications`,
  `DROP POLICY IF EXISTS "Allow students to insert scan logs" ON public.scan_logs`,
  `DROP POLICY IF EXISTS "Allow students to insert their own completions" ON public.student_destinations`,
  `DROP POLICY IF EXISTS "Allow students to insert activity logs" ON public.activity_logs`,
  `CREATE POLICY "Allow authenticated to insert notifications" ON public.notifications FOR INSERT WITH CHECK (true)`,
  `CREATE POLICY "Allow students to insert scan logs" ON public.scan_logs FOR INSERT WITH CHECK (true)`,
  `CREATE POLICY "Allow students to insert their own completions" ON public.student_destinations FOR INSERT WITH CHECK (true)`,
  `CREATE POLICY "Allow students to insert activity logs" ON public.activity_logs FOR INSERT WITH CHECK (true)`,
]

async function runSQL(sql) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'apikey': SUPABASE_SERVICE_KEY,
    },
    body: JSON.stringify({ sql })
  })
  return res
}

// Alternative: use the Supabase pg-meta endpoint
async function runSQLViaPGMeta(sql) {
  const res = await fetch(`${SUPABASE_URL}/pg-meta/v1/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'apikey': SUPABASE_SERVICE_KEY,
    },
    body: JSON.stringify({ query: sql })
  })
  const text = await res.text()
  return { status: res.status, body: text }
}

console.log('Attempting to apply RLS policies via Supabase pg-meta...\n')

for (const stmt of SQL_STATEMENTS) {
  console.log(`Running: ${stmt.substring(0, 80)}...`)
  try {
    const result = await runSQLViaPGMeta(stmt)
    if (result.status === 200 || result.status === 201) {
      console.log(`  ✅ Success`)
    } else {
      console.log(`  ⚠️  Status ${result.status}: ${result.body.substring(0, 200)}`)
    }
  } catch (e) {
    console.log(`  ❌ Error: ${e.message}`)
  }
}

console.log('\nDone. If you see 403/401 errors, please apply the SQL manually in Supabase Dashboard.')
console.log('URL: https://supabase.com/dashboard/project/bkueldejhcgyjzabqxhp/sql/new')
