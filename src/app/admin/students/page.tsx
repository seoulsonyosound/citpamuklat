import React from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyAdminToken } from '@/lib/adminAuth'
import { createServiceRoleClient } from '@/lib/supabase/serviceRole'
import StudentsClient from './StudentsClient'

export default async function AdminStudentsPage() {
  // 1. Verify admin token
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  const isValidAdmin = token ? await verifyAdminToken(token) : false

  if (!isValidAdmin) {
    redirect('/admin/login')
  }

  // 2. Fetch student list using service role client
  const supabase = createServiceRoleClient()

  // Fetch all profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('registration_date', { ascending: false })

  // Fetch all active destinations to calculate completion limits
  const { count: activeDestCount } = await supabase
    .from('destinations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Fetch all completed student destinations to map stamp counts
  const studentManifest = []
  if (profiles && profiles.length > 0) {
    for (const profile of profiles) {
      // Get completed stamps for this student
      const { data: completions } = await supabase
        .from('student_destinations')
        .select(`
          destination_id,
          completion_date,
          destinations (
            title,
            gate_number,
            destination_color
          )
        `)
        .eq('student_id', profile.id)

      const clearedStamps = (completions || []).map((comp: any) => ({
        destination_id: comp.destination_id,
        completion_date: comp.completion_date,
        title: comp.destinations?.title || 'Unknown Gate',
        gate_number: comp.destinations?.gate_number || 'N/A',
        color: comp.destinations?.destination_color || '#2563EB',
      }))

      studentManifest.push({
        ...profile,
        stampsCount: clearedStamps.length,
        clearedStamps,
      })
    }
  }

  return (
    <StudentsClient
      students={studentManifest}
      totalGates={activeDestCount || 0}
    />
  )
}
