'use server'

import { createHash } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/serviceRole'
import { revalidatePath } from 'next/cache'

/**
 * Validates a scanned QR token against active destinations.
 * If valid, inserts a student destination completion, creates logs, and notifies the user.
 */
export async function verifyQRTokenAction(token: string, expectedDestinationId?: string) {
  const supabase = await createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Authentication required. Please sign in to scan.' }
  }

  const cleanToken = token.trim()
  const tokenHash = createHash('sha256').update(cleanToken).digest('hex')

  // Use service role client to bypass RLS policies for completions and logs
  const serviceSupabase = createServiceRoleClient()

  // 2. Find matched active destination by tokenHash or fallback
  let { data: destination } = await serviceSupabase
    .from('destinations')
    .select('*')
    .eq('qr_token_hash', tokenHash)
    .eq('status', 'active')
    .maybeSingle()

  if (!destination) {
    // Fallback check if cleanToken directly matches id or gate_number (e.g. GATE 01)
    const { data: destByFallback } = await serviceSupabase
      .from('destinations')
      .select('*')
      .or(`id.eq.${cleanToken},gate_number.ilike.${cleanToken}`)
      .eq('status', 'active')
      .maybeSingle()

    if (destByFallback) {
      destination = destByFallback
    }
  }

  if (!destination) {
    // Write failed scan log
    await serviceSupabase.from('scan_logs').insert({
      student_id: user.id,
      destination_id: expectedDestinationId || '00000000-0000-0000-0000-000000000000',
      status: 'failed',
      error_message: 'Invalid boarding pass token scanned.',
    })
    return { error: 'Access Denied: Invalid or expired gate token.' }
  }

  // 3. Validate gate target if student clicked from a specific destination page
  if (expectedDestinationId && destination.id !== expectedDestinationId) {
    await serviceSupabase.from('scan_logs').insert({
      student_id: user.id,
      destination_id: destination.id,
      status: 'failed',
      error_message: `Mismatched gate scanned. Expected: ${expectedDestinationId}, Found: ${destination.id}`,
    })
    return { 
      error: `Incorrect Gate Scanned. You are at ${destination.title.toUpperCase()} but expected the gate for the other destination.` 
    }
  }

  // 4. Check if already completed
  const { data: existingCompletion } = await serviceSupabase
    .from('student_destinations')
    .select('*')
    .eq('student_id', user.id)
    .eq('destination_id', destination.id)
    .maybeSingle()

  if (existingCompletion) {
    return { 
      error: `Boarding Pass Cleared: You have already cleared the gate for ${destination.title.toUpperCase()} and collected its stamp.` 
    }
  }

  // 5. Insert completion record using serviceRole to bypass RLS restrictions
  const { error: insertError } = await serviceSupabase
    .from('student_destinations')
    .insert({
      student_id: user.id,
      destination_id: destination.id,
    })

  if (insertError) {
    return { error: `Failed to register boarding completion: ${insertError.message}` }
  }

  // 6. Write scan audit logs
  await serviceSupabase.from('scan_logs').insert({
    student_id: user.id,
    destination_id: destination.id,
    status: 'success',
  })

  // Write activity log
  await serviceSupabase.from('activity_logs').insert({
    user_id: user.id,
    user_role: 'student',
    action: 'Destination Cleared',
    details: {
      destination_id: destination.id,
      destination_title: destination.title,
      gate_number: destination.gate_number,
    },
  })

  // 7. Trigger real-time passenger notification
  await serviceSupabase.from('notifications').insert({
    user_id: user.id,
    user_role: 'student',
    title: 'Passport Stamped!',
    message: `Verification complete: You have successfully cleared ${destination.title} (${destination.gate_number}) and earned your stamp.`,
  })

  revalidatePath('/dashboard')
  revalidatePath('/passport')
  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/students')

  return { 
    success: true, 
    destination: {
      id: destination.id,
      title: destination.title,
      gate_number: destination.gate_number,
      destination_color: destination.destination_color,
      representative: destination.representative
    } 
  }
}

/**
 * Validates a scanned student boarding pass QR code (presented by student to Admin/Booth Officer).
 * Supports JSON or string formats: PAMUKLAT_PASS:{studentId}:{destinationId} or raw QR payload.
 */
export async function verifyStudentBoardingPassAction(scannedPayload: string, adminOverrideDestinationId?: string) {
  const serviceSupabase = createServiceRoleClient()
  let studentId: string | null = null
  let destinationId: string | null = adminOverrideDestinationId || null

  try {
    if (scannedPayload.startsWith('{')) {
      const parsed = JSON.parse(scannedPayload)
      studentId = parsed.studentId || parsed.student_id || null
      destinationId = parsed.destinationId || parsed.destination_id || destinationId
    } else if (scannedPayload.startsWith('PAMUKLAT_PASS:')) {
      const parts = scannedPayload.split(':')
      studentId = parts[1] || null
      destinationId = parts[2] || destinationId
    } else {
      // Fallback: search profile by student_id string or UUID
      const { data: profileByCode } = await serviceSupabase
        .from('profiles')
        .select('id')
        .or(`student_id.eq.${scannedPayload},id.eq.${scannedPayload}`)
        .maybeSingle()

      if (profileByCode) {
        studentId = profileByCode.id
      }
    }
  } catch (e) {
    console.error('Failed to parse student boarding pass payload:', e)
  }

  if (!studentId) {
    return { error: 'Invalid Student Boarding Pass QR Code scanned.' }
  }

  // Get student profile details
  const { data: studentProfile } = await serviceSupabase
    .from('profiles')
    .select('*')
    .eq('id', studentId)
    .maybeSingle()

  if (!studentProfile) {
    return { error: 'Student profile record not found in system roster.' }
  }

  if (!destinationId) {
    return { error: 'Destination Gate not specified. Please select a clearance stop before scanning.' }
  }

  // Get destination details
  const { data: destination } = await serviceSupabase
    .from('destinations')
    .select('*')
    .eq('id', destinationId)
    .maybeSingle()

  if (!destination) {
    return { error: 'Target clearance stop / destination gate not found.' }
  }

  // Check if already completed
  const { data: existingCompletion } = await serviceSupabase
    .from('student_destinations')
    .select('*')
    .eq('student_id', studentId)
    .eq('destination_id', destinationId)
    .maybeSingle()

  if (existingCompletion) {
    return {
      error: `Already Cleared: ${studentProfile.full_name} has already received the stamp for ${destination.title.toUpperCase()}.`,
      student: studentProfile,
      destination
    }
  }

  // Insert completion record
  const { error: insertError } = await serviceSupabase
    .from('student_destinations')
    .insert({
      student_id: studentId,
      destination_id: destinationId,
    })

  if (insertError) {
    return { error: `Failed to stamp passport: ${insertError.message}` }
  }

  // Write audit and activity logs
  await serviceSupabase.from('scan_logs').insert({
    student_id: studentId,
    destination_id: destinationId,
    status: 'success',
  })

  await serviceSupabase.from('activity_logs').insert({
    user_id: studentId,
    user_role: 'admin',
    action: 'Student Passport Stamped via Admin Scan',
    details: {
      student_name: studentProfile.full_name,
      student_id: studentProfile.student_id,
      destination_title: destination.title,
      gate_number: destination.gate_number,
    },
  })

  // Trigger passenger notification
  await serviceSupabase.from('notifications').insert({
    user_id: studentId,
    user_role: 'student',
    title: 'Passport Stamped by Admin!',
    message: `Verification complete: ${destination.title} (${destination.gate_number}) has been stamped into your Digital Passport by booth staff.`,
  })

  revalidatePath('/dashboard')
  revalidatePath('/passport')
  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/students')

  return {
    success: true,
    student: studentProfile,
    destination: {
      id: destination.id,
      title: destination.title,
      gate_number: destination.gate_number,
      destination_color: destination.destination_color,
      representative: destination.representative
    }
  }
}
