'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { signAdminToken } from '@/lib/adminAuth'
import { createServiceRoleClient } from '@/lib/supabase/serviceRole'

/**
 * Handles Admin authentication check and sets secure session cookie
 */
export async function adminLoginAction(prevState: any, formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  const expectedUsername = process.env.ADMIN_USERNAME || 'ssite2627'
  const expectedPassword = process.env.ADMIN_PASSWORD || 'ssitecitpamuklat'

  if (username !== expectedUsername || password !== expectedPassword) {
    return { error: 'Invalid airport authorization credentials.' }
  }

  // Generate Admin JWT Token
  const token = await signAdminToken(username)

  // Write JWT to secure HTTP-only cookie
  const cookieStore = await cookies()
  cookieStore.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 Hours
  })

  return { success: true }
}

/**
 * Destroys admin session cookie
 */
export async function adminLogoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_token')
  return { success: true }
}

/**
 * Finalizes onboarding registration details for student profile
 */
export async function completeOnboardingAction(data: {
  studentId: string
  course: string
  section: string
  yearLevel: string
}) {
  const supabase = await createClient()
  
  // Get active session user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Authentication required.' }
  }

  // Update profile in DB
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      student_id: data.studentId,
      course: data.course,
      section: data.section,
      year_level: data.yearLevel,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (updateError) {
    return { error: `Failed to issue passport: ${updateError.message}` }
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    user_role: 'student',
    action: 'Onboarding Completed',
    details: {
      student_id: data.studentId,
      course: data.course,
      section: data.section,
      year_level: data.yearLevel,
    },
  })

  // Create initial notification via service role to bypass RLS INSERT restrictions
  const serviceSupabase = createServiceRoleClient()
  await serviceSupabase.from('notifications').insert({
    user_id: user.id,
    user_role: 'student',
    title: 'Passport Issued',
    message: 'Welcome onboard! Your CIT Digital Passport has been issued. Complete destinations to collect stamps.',
  })

  return { success: true }
}
