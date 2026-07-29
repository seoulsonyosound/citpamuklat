'use server'

import crypto from 'crypto'
import { createServiceRoleClient } from '@/lib/supabase/serviceRole'
import { revalidatePath } from 'next/cache'

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
  stampImageUrl?: string
}

/**
 * Creates or edits a Destination.
 * If creating, generates a secure random token, hashes it, and returns the raw token to the client.
 */
export async function saveDestinationAction(input: DestinationInput) {
  const supabase = createServiceRoleClient()
  let rawToken: string | null = null
  let tokenHash: string | null = null

  // If creating new, generate token
  if (!input.id) {
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

  if (input.stampImageUrl) {
    dataToSave.stamp_image_url = input.stampImageUrl
  }

  if (tokenHash) {
    dataToSave.qr_token_hash = tokenHash
  }

  let error: any = null

  if (input.id) {
    // Modify existing
    const { error: err } = await supabase
      .from('destinations')
      .update(dataToSave)
      .eq('id', input.id)
    error = err
  } else {
    // Insert new
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
    rawToken // Returns raw token if newly created so admin can render QR
  }
}

/**
 * Deletes a destination from database
 */
export async function deleteDestinationAction(id: string) {
  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from('destinations')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: `Failed to delete destination: ${error.message}` }
  }

  revalidatePath('/admin/destinations')
  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Generates a new secure QR token, stores its hash, and returns raw token to client.
 */
export async function regenerateQRAction(id: string) {
  const supabase = createServiceRoleClient()
  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

  const { error } = await supabase
    .from('destinations')
    .update({ qr_token_hash: tokenHash })
    .eq('id', id)

  if (error) {
    return { error: `Failed to update QR hash: ${error.message}` }
  }

  revalidatePath('/admin/destinations')
  return { success: true, rawToken }
}
