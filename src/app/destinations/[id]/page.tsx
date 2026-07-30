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

  // 4. Sequential gate lock — fetch all active destinations sorted by gate_number
  const { data: allDestinations } = await serviceSupabase
    .from('destinations')
    .select('id, gate_number, title')
    .eq('status', 'active')
    .order('created_at', { ascending: true })

  // Sort by gate_number numerically for consistent ordering
  const sortedDestinations = (allDestinations && allDestinations.length > 0)
    ? [...allDestinations].sort((a: any, b: any) => {
        const numA = parseInt((a.gate_number || '0').replace(/\D/g, ''), 10)
        const numB = parseInt((b.gate_number || '0').replace(/\D/g, ''), 10)
        return numA - numB
      })
    : OFFICIAL_PAMUKLAT_STOPS.map((s) => ({ id: s.id, gate_number: s.gate_number, title: s.title }))

  const orderedIds = sortedDestinations.map((d: { id: string }) => d.id)
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

  // 5. Determine the NEXT gate (if any) to show in the post-scan prompt
  const nextDest = destIndex >= 0 && destIndex < sortedDestinations.length - 1
    ? sortedDestinations[destIndex + 1] as { id: string; gate_number: string; title: string }
    : null

  return (
    <DestinationDetailsClient
      profile={profile}
      destination={destination}
      isCompleted={!!completion}
      completionDate={completion ? completion.completion_date : null}
      nextDestination={nextDest}
    />
  )
}
