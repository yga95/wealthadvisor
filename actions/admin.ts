'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import {
  adminUpdateSchema, createUserSchema, userIdSchema, firstError, type ActionState,
} from '@/lib/validation/schemas'

// 1. Rôle et conseiller : session de l'admin (RLS politique 6 + trigger), PAS de service role.
export async function updateUserRole(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = adminUpdateSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: firstError(parsed.error) }
  const { id, role } = parsed.data
  const advisorId = role === 'client' ? parsed.data.advisor_id : null // seul un client a un conseiller

  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  if (id === auth?.claims?.sub && role !== 'admin') {
    return { error: 'You cannot remove your own admin role.' }
  }

  if (advisorId) {
    const { data: adv } = await supabase.from('users').select('role').eq('id', advisorId).single()
    if (adv?.role !== 'advisor') return { error: 'The selected user is not an advisor.' }
  }

  const { data: before } = await supabase.from('users').select('role').eq('id', id).single()
  const { data, error } = await supabase
    .from('users').update({ role, advisor_id: advisorId }).eq('id', id).select('id')
  if (error) return { error: error.message }
  if (!data?.length) return { error: 'Not allowed.' }

  // Un conseiller rétrogradé : ses clients repassent « non affectés ».
  if (before?.role === 'advisor' && role !== 'advisor') {
    await supabase.from('users').update({ advisor_id: null }).eq('advisor_id', id)
  }

  revalidatePath('/admin/users')
  return {}
}

// 2. Création de compte : Auth Admin API (service role) après requireAdmin().
export async function createUserAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await requireAdmin())) return { error: 'Forbidden.' }
  const parsed = createUserSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: firstError(parsed.error) }
  const { email, password, full_name } = parsed.data

  // Le trigger handle_new_user crée la ligne public.users avec le rôle 'client'.
  const { error } = await createAdminClient().auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { full_name },
  })
  if (error) return { error: error.message }
  revalidatePath('/admin/users')
  return {}
}

// 3. Suppression de compte : Auth Admin API après requireAdmin(). Cascade §1.3.
export async function deleteUserAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const adminId = await requireAdmin()
  if (!adminId) return { error: 'Forbidden.' }
  const parsed = userIdSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: firstError(parsed.error) }
  if (parsed.data.id === adminId) return { error: 'You cannot delete your own account.' }

  const { error } = await createAdminClient().auth.admin.deleteUser(parsed.data.id)
  if (error) return { error: error.message }
  revalidatePath('/admin/users')
  return {}
}

// 4. Emails pour la liste admin : Auth Admin API après requireAdmin().
//    On ne garde que id + email (§2.8).
export async function getUserEmails(): Promise<Record<string, string>> {
  if (!(await requireAdmin())) return {}
  const { data } = await createAdminClient().auth.admin.listUsers({ perPage: 1000 })
  return Object.fromEntries((data?.users ?? []).map((u) => [u.id, (u.email ?? '').toLowerCase()]))
}
