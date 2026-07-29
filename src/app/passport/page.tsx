import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PassportClient from './PassportClient'
import { OFFICIAL_PAMUKLAT_STOPS } from '@/lib/pamuklatStops'

export default async function PassportPage() {
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

  // Use DB destinations if available, otherwise fall back to 8 official Pamuklat stops
  const activeDestinations = (destinations && destinations.length > 0)
    ? destinations
    : OFFICIAL_PAMUKLAT_STOPS

  // 4. Get completions (to show ink stamps)
  const { data: completions } = await supabase
    .from('student_destinations')
    .select('destination_id, completion_date')
    .eq('student_id', user.id)

  return (
    <PassportClient
      profile={profile}
      destinations={activeDestinations as any}
      completions={completions || []}
    />
  )
}
