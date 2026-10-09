'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { myNameSchema, firstError, type ActionState } from '@/lib/validation/schemas'

// Chacun modifie son propre nom : politique 4 (id = auth.uid()) + trigger guard_user_cols
// (full_name seulement ; role, advisor_id, age et risk_tolerance restent protégés).
export async function updateMyName(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = myNameSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: firstError(parsed.error) }
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  const id = auth?.claims?.sub
  if (!id) return { error: 'Not signed in.' }
  const { data, error } = await supabase
    .from('users').update({ full_name: parsed.data.full_name }).eq('id', id).select('id')
  if (error) return { error: error.message }
  if (!data?.length) return { error: 'Not allowed.' }
  revalidatePath('/', 'layout')
  return {}
}
