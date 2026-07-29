import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OnboardingForm from './OnboardingForm'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // If already onboarded, redirect to dashboard
  if (profile?.course && profile?.section && profile?.year_level) {
    redirect('/dashboard')
  }

  return (
    <OnboardingForm
      email={user.email || ''}
      fullName={profile?.full_name || user.user_metadata.full_name || 'Freshman Student'}
      avatarUrl={profile?.avatar_url || user.user_metadata.avatar_url || ''}
    />
  )
}
