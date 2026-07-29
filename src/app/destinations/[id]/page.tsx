import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DestinationDetailsClient from './DestinationDetailsClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function DestinationPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // 2. Fetch specific destination details
  const { data: destination } = await supabase
    .from('destinations')
    .select('*')
    .eq('id', id)
    .single()

  if (!destination) {
    redirect('/dashboard')
  }

  // 3. Fetch completion status
  const { data: completion } = await supabase
    .from('student_destinations')
    .select('*')
    .eq('student_id', user.id)
    .eq('destination_id', id)
    .single()

  return (
    <DestinationDetailsClient
      destination={destination}
      isCompleted={!!completion}
      completionDate={completion ? completion.completion_date : null}
    />
  )
}
