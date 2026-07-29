import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // 2. Get profile details
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // Force onboarding if incomplete
  if (!profile.course || !profile.section || !profile.year_level) {
    redirect('/onboarding')
  }

  // 3. Get all active destinations
  const { data: destinations } = await supabase
    .from('destinations')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: true })

  // 4. Get student completions
  const { data: completions } = await supabase
    .from('student_destinations')
    .select('destination_id, completion_date')
    .eq('student_id', user.id)

  // 5. Get recent notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(15)

  return (
    <DashboardClient
      profile={profile}
      initialDestinations={destinations || []}
      initialCompletions={completions || []}
      initialNotifications={notifications || []}
    />
  )
}
