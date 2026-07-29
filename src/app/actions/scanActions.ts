'use server'

import { createHash } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/serviceRole'

/**
 * Validates a scanned QR token against active destinations.
 * If valid, inserts a student destination completion, creates logs, and notifies the user.
 */
export async function verifyQRTokenAction(token: string, expectedDestinationId?: string) {
  const supabase = await createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Authentication required.' }
  }

  if (!token || token.trim() === '') {
    return { error: 'Invalid boarding pass token.' }
  }

  // 2. Hash the scanned raw token using SHA-256
  const tokenHash = createHash('sha256').update(token).digest('hex')

  // Use service role client to select qr_token_hash since it's hidden under RLS
  const serviceSupabase = createServiceRoleClient()

  // 3. Find matched active destination
  const { data: destination, error: destError } = await serviceSupabase
    .from('destinations')
    .select('*')
    .eq('qr_token_hash', tokenHash)
    .eq('status', 'active')
    .single()

  if (destError || !destination) {
    // Write failed scan log
    await supabase.from('scan_logs').insert({
      student_id: user.id,
      destination_id: expectedDestinationId || '00000000-0000-0000-0000-000000000000',
      status: 'failed',
      error_message: 'Invalid boarding pass token scanned.',
    })
    return { error: 'Access Denied: Invalid or expired gate token.' }
  }

  // 4. Validate gate target if student clicked from a specific destination page
  if (expectedDestinationId && destination.id !== expectedDestinationId) {
    await supabase.from('scan_logs').insert({
      student_id: user.id,
      destination_id: destination.id,
      status: 'failed',
      error_message: `Mismatched gate scanned. Expected: ${expectedDestinationId}, Found: ${destination.id}`,
    })
    return { 
      error: `Incorrect Gate Scanned. You are at ${destination.title.toUpperCase()} but expected the gate for the other destination.` 
    }
  }

  // 5. Check if already completed
  const { data: existingCompletion } = await supabase
    .from('student_destinations')
    .select('*')
    .eq('student_id', user.id)
    .eq('destination_id', destination.id)
    .single()

  if (existingCompletion) {
    return { 
      error: `Boarding Pass Cleared: You have already cleared the gate for ${destination.title.toUpperCase()} and collected its stamp.` 
    }
  }

  // 6. Insert completion record
  const { error: insertError } = await supabase
    .from('student_destinations')
    .insert({
      student_id: user.id,
      destination_id: destination.id,
    })

  if (insertError) {
    return { error: `Failed to register boarding completion: ${insertError.message}` }
  }

  // 7. Write scan audit logs
  await supabase.from('scan_logs').insert({
    student_id: user.id,
    destination_id: destination.id,
    status: 'success',
  })

  // Write activity log
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    user_role: 'student',
    action: 'Destination Cleared',
    details: {
      destination_id: destination.id,
      destination_title: destination.title,
      gate_number: destination.gate_number,
    },
  })

  // 8. Trigger real-time passenger notification
  await supabase.from('notifications').insert({
    user_id: user.id,
    user_role: 'student',
    title: 'Passport Stamped! 🎫',
    message: `Verification complete: You have successfully cleared ${destination.title} (Gate ${destination.gate_number}) and earned your stamp.`,
  })

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
