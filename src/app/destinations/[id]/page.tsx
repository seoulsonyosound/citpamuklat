import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/serviceRole'
import { OFFICIAL_PAMUKLAT_STOPS } from '@/lib/pamuklatStops'
import DestinationDetailsClient from './DestinationDetailsClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function DestinationPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceRoleClient()

  // 1. Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // Fetch student profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 2. Fetch specific destination details (service role to bypass RLS on qr_token_hash)
  const { data: destination } = await serviceSupabase
    .from('destinations')
    .select('id, title, description, instructions, representative, stamp_image_url, destination_color, icon, gate_number, estimated_duration, status')
    .eq('id', id)
    .single()

  if (!destination) {
    redirect('/dashboard')
  }

  // 3. Fetch completion status for this gate
  const { data: completion } = await supabase
    .from('student_destinations')
    .select('*')
    .eq('student_id', user.id)
    .eq('destination_id', id)
    .maybeSingle()

  // 4. Sequential gate lock — fetch all active destinations in order
  const { data: allDestinations } = await serviceSupabase
    .from('destinations')
    .select('id, gate_number')
    .eq('status', 'active')
    .order('created_at', { ascending: true })

  // Fall back to official stops order if DB is empty
  // Sort by gate_number numerically for consistent ordering
  const sortedDestinations = (allDestinations && allDestinations.length > 0)
    ? [...allDestinations].sort((a: any, b: any) => {
        const numA = parseInt((a.gate_number || '0').replace(/\D/g, ''), 10)
        const numB = parseInt((b.gate_number || '0').replace(/\D/g, ''), 10)
        return numA - numB
      })
    : null

  const orderedIds = sortedDestinations
    ? sortedDestinations.map((d: { id: string }) => d.id)
    : OFFICIAL_PAMUKLAT_STOPS.map((s) => s.id)


  const destIndex = orderedIds.findIndex((did: string) => did === id)

  // If this is NOT the first gate, verify the previous gate is completed
  if (destIndex > 0) {
    const prevDestId = orderedIds[destIndex - 1]
    const { data: prevCompletion } = await supabase
      .from('student_destinations')
      .select('id')
      .eq('student_id', user.id)
      .eq('destination_id', prevDestId)
      .maybeSingle()

    if (!prevCompletion) {
      // Previous gate not yet completed — redirect back to dashboard
      redirect('/dashboard')
    }
  }

  return (
    <DestinationDetailsClient
      profile={profile}
      destination={destination}
      isCompleted={!!completion}
      completionDate={completion ? completion.completion_date : null}
    />
  )
}
