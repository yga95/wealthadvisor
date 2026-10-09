'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { profileSchema, firstError, type ActionState } from '@/lib/validation/schemas'

// Âge et profil de risque d'un client : politique 5 + trigger guard_user_cols
// (seul le conseiller affecté peut modifier ces deux colonnes).
export async function updateClientProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = profileSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: firstError(parsed.error) }
  const { client_id, age, risk_tolerance } = parsed.data
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .update({ age, risk_tolerance })
    .eq('id', client_id)
    .select('id')
  if (error) return { error: error.message }
  if (!data?.length) return { error: 'Not allowed.' }
  revalidatePath(`/clients/${client_id}`)
  revalidatePath('/clients')
  return {}
}
