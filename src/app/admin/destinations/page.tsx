import React from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyAdminToken } from '@/lib/adminAuth'
import { createServiceRoleClient } from '@/lib/supabase/serviceRole'
import DestinationsClient from './DestinationsClient'

export default async function AdminDestinationsPage() {
  // 1. Verify admin token
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  const isValidAdmin = token ? await verifyAdminToken(token) : false

  if (!isValidAdmin) {
    redirect('/admin/login')
  }

  // 2. Fetch all destinations
  const supabase = createServiceRoleClient()
  const { data: destinations } = await supabase
    .from('destinations')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <DestinationsClient
      initialDestinations={destinations || []}
    />
  )
}
