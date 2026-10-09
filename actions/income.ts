'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { incomeSchema, rowSchema, firstError, type ActionState } from '@/lib/validation/schemas'

// Même logique que les actifs (RLS : politiques 13-16).

export async function addIncome(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = incomeSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: firstError(parsed.error) }
  const supabase = await createClient()
  const { error } = await supabase.from('income').insert(parsed.data)
  if (error) return { error: error.message }
  revalidatePath(`/clients/${parsed.data.owner_id}`)
  return {}
}

export async function updateIncome(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = incomeSchema.extend(rowSchema.shape).safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: firstError(parsed.error) }
  const { id, owner_id, source, amount } = parsed.data
  const supabase = await createClient()
  const { data, error } = await supabase.from('income').update({ source, amount }).eq('id', id).select('id')
  if (error) return { error: error.message }
  if (!data?.length) return { error: 'Not allowed.' }
  revalidatePath(`/clients/${owner_id}`)
  return {}
}

export async function deleteIncome(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = rowSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: firstError(parsed.error) }
  const supabase = await createClient()
  const { data, error } = await supabase.from('income').delete().eq('id', parsed.data.id).select('id')
  if (error) return { error: error.message }
  if (!data?.length) return { error: 'Not allowed.' }
  revalidatePath(`/clients/${parsed.data.owner_id}`)
  return {}
}
