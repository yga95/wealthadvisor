'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { noteSchema, noteDeleteSchema, firstError, type ActionState } from '@/lib/validation/schemas'

// Notes privées : RLS politiques 21-24 (auteur + client affecté).

export async function addNote(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = noteSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: firstError(parsed.error) }
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  const authorId = auth?.claims?.sub
  if (!authorId) return { error: 'Not signed in.' }
  const { error } = await supabase.from('notes').insert({ ...parsed.data, author_id: authorId })
  if (error) return { error: error.message }
  revalidatePath(`/clients/${parsed.data.client_id}`)
  return {}
}

export async function deleteNote(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = noteDeleteSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: firstError(parsed.error) }
  const supabase = await createClient()
  const { data, error } = await supabase.from('notes').delete().eq('id', parsed.data.id).select('id')
  if (error) return { error: error.message }
  if (!data?.length) return { error: 'Not allowed.' }
  revalidatePath(`/clients/${parsed.data.client_id}`)
  return {}
}
