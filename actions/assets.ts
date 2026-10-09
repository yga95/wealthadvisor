'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { assetSchema, rowSchema, firstError, type ActionState } from '@/lib/validation/schemas'

// Session de l'utilisateur : le RLS (politiques 8-11) vérifie que le client
// est bien affecté à ce conseiller. Zod vérifie les données avant la base.

export async function addAsset(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = assetSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: firstError(parsed.error) }
  const supabase = await createClient()
  const { error } = await supabase.from('assets').insert(parsed.data)
  if (error) return { error: error.message }
  revalidatePath(`/clients/${parsed.data.owner_id}`)
  return {}
}

export async function updateAsset(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = assetSchema.extend(rowSchema.shape).safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: firstError(parsed.error) }
  const { id, owner_id, label, amount } = parsed.data
  const supabase = await createClient()
  const { data, error } = await supabase.from('assets').update({ label, amount }).eq('id', id).select('id')
  if (error) return { error: error.message }
  if (!data?.length) return { error: 'Not allowed.' }
  revalidatePath(`/clients/${owner_id}`)
  return {}
}

export async function deleteAsset(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = rowSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: firstError(parsed.error) }
  const supabase = await createClient()
  const { data, error } = await supabase.from('assets').delete().eq('id', parsed.data.id).select('id')
  if (error) return { error: error.message }
  if (!data?.length) return { error: 'Not allowed.' }
  revalidatePath(`/clients/${parsed.data.owner_id}`)
  return {}
}
