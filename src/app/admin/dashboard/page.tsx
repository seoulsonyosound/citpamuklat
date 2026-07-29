import React from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyAdminToken } from '@/lib/adminAuth'
import { createServiceRoleClient } from '@/lib/supabase/serviceRole'
import AdminDashboardClient from './AdminDashboardClient'

export default async function AdminDashboardPage() {
  // 1. Verify admin token from cookie session
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  const isValidAdmin = token ? await verifyAdminToken(token) : false

  if (!isValidAdmin) {
    redirect('/admin/login')
  }

  // 2. Query analytics metrics via service-role to bypass student RLS constraints
  const supabase = createServiceRoleClient()

  // Total Students
  const { count: studentCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Total Destinations
  const { count: destCount } = await supabase
    .from('destinations')
    .select('*', { count: 'exact', head: true })

  // Total completions
  const { count: stampCount } = await supabase
    .from('student_destinations')
    .select('*', { count: 'exact', head: true })

  // Newest passenger check-ins
  const { data: newestStudents } = await supabase
    .from('profiles')
    .select('*')
    .order('registration_date', { ascending: false })
    .limit(5)

  // Recent activity logs
  const { data: activityLogs } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  // Load destinations metrics for graphs breakdown
  const { data: destList } = await supabase
    .from('destinations')
    .select('id, title, gate_number, destination_color')
    .eq('status', 'active')

  // Count completions per destination
  const destMetrics = []
  if (destList && destList.length > 0) {
    for (const dest of destList) {
      const { count } = await supabase
        .from('student_destinations')
        .select('*', { count: 'exact', head: true })
        .eq('destination_id', dest.id)
      
      destMetrics.push({
        id: dest.id,
        title: dest.title,
        gate_number: dest.gate_number,
        color: dest.destination_color,
        completions: count || 0,
      })
    }
  }

  return (
    <AdminDashboardClient
      studentsTotal={studentCount || 0}
      destinationsTotal={destCount || 0}
      stampsTotal={stampCount || 0}
      newestStudents={newestStudents || []}
      activityLogs={activityLogs || []}
      destMetrics={destMetrics}
    />
  )
}
