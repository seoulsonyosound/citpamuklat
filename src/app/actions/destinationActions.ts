'use server'

import crypto from 'crypto'
import { createServiceRoleClient } from '@/lib/supabase/serviceRole'
import { revalidatePath } from 'next/cache'
import { OFFICIAL_PAMUKLAT_STOPS } from '@/lib/pamuklatStops'

interface DestinationInput {
  id?: string
  title: string
  description: string
  instructions: string
  representative: string
  destinationColor: string
  icon: string
  status: string
  gateNumber: string
  estimatedDuration: string
  locationName?: string
  stampImageUrl?: string
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Creates or edits a Destination.
 * If creating, generates a secure random token, hashes it, and returns the raw token to the client.
 */
export async function saveDestinationAction(input: DestinationInput) {
  const supabase = createServiceRoleClient()
  let rawToken: string | null = null
  let tokenHash: string | null = null

  const isUUID = input.id && UUID_REGEX.test(input.id)

  if (!input.id || !isUUID) {
    rawToken = crypto.randomBytes(32).toString('hex')
    tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
  }

  const dataToSave: any = {
    title: input.title,
    description: input.description,
    instructions: input.instructions,
    representative: input.representative,
    destination_color: input.destinationColor,
    icon: input.icon,
    status: input.status,
    gate_number: input.gateNumber,
    estimated_duration: input.estimatedDuration,
  }

  if (input.stampImageUrl !== undefined) {
    dataToSave.stamp_image_url = input.stampImageUrl
  }

  if (tokenHash) {
    dataToSave.qr_token_hash = tokenHash
  }

  let error: any = null

  if (input.id && isUUID) {
    const { error: err } = await supabase
      .from('destinations')
      .update(dataToSave)
      .eq('id', input.id)
    error = err
  } else {
    const { error: err } = await supabase
      .from('destinations')
      .insert(dataToSave)
    error = err
  }

  if (error) {
    return { error: `Failed to save destination: ${error.message}` }
  }

  revalidatePath('/admin/destinations')
  revalidatePath('/dashboard')
  
  return { 
    success: true, 
    rawToken 
  }
}

/**
 * Deletes a destination from database safely
 */
export async function deleteDestinationAction(id: string) {
  const supabase = createServiceRoleClient()
  const isUUID = UUID_REGEX.test(id)

  let error: any = null

  if (isUUID) {
    const { error: err } = await supabase
      .from('destinations')
      .delete()
      .eq('id', id)
    error = err
  } else {
    // Non-UUID fallback (e.g. pamuklat-stop-1), find by gate_number or title
    const stopDef = OFFICIAL_PAMUKLAT_STOPS.find(s => s.id === id)
    const gateNum = stopDef ? stopDef.gate_number : id
    const { error: err } = await supabase
      .from('destinations')
      .delete()
      .ilike('gate_number', `%${gateNum}%`)
    error = err
  }

  if (error) {
    return { error: `Failed to delete destination: ${error.message}` }
  }

  revalidatePath('/admin/destinations')
  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Generates a new secure QR token, stores its hash in DB, and returns raw token to client.
 */
export async function regenerateQRAction(id: string, fallbackGateNumber?: string) {
  const supabase = createServiceRoleClient()
  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

  const isUUID = UUID_REGEX.test(id)
  let error: any = null

  if (isUUID) {
    const { error: err } = await supabase
      .from('destinations')
      .update({ qr_token_hash: tokenHash })
      .eq('id', id)
    error = err
  } else {
    // Non-UUID (e.g. 'pamuklat-stop-1')
    const stopDef = OFFICIAL_PAMUKLAT_STOPS.find(s => s.id === id)
    const searchGate = fallbackGateNumber || (stopDef ? stopDef.gate_number : '')

    // Check if a row with matching gate_number exists in DB
    const { data: existing } = await supabase
      .from('destinations')
      .select('id')
      .ilike('gate_number', `%${searchGate}%`)
      .maybeSingle()

    if (existing) {
      const { error: err } = await supabase
        .from('destinations')
        .update({ qr_token_hash: tokenHash })
        .eq('id', existing.id)
      error = err
    } else if (stopDef) {
      // Create record in Supabase with new tokenHash
      const { error: err } = await supabase
        .from('destinations')
        .insert({
          title: stopDef.title,
          description: stopDef.description,
          instructions: stopDef.instructions,
          representative: stopDef.representative,
          destination_color: stopDef.destination_color,
          icon: stopDef.icon,
          status: stopDef.status,
          gate_number: stopDef.gate_number,
          estimated_duration: stopDef.estimated_duration,
          qr_token_hash: tokenHash
        })
      error = err
    } else {
      error = { message: 'Flight gate destination not found.' }
    }
  }

  if (error) {
    return { error: `Failed to update QR hash: ${error.message}` }
  }

  revalidatePath('/admin/destinations')
  revalidatePath('/dashboard')
  return { success: true, rawToken }
}
