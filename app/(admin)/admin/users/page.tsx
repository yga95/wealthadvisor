import AdminUsersView from '@/components/views/AdminUsersView'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/current-user'
import { updateUserRole, createUserAccount, deleteUserAccount, getUserEmails } from '@/actions/admin'

export default async function AdminUsersPage() {
  const me = await requireRole('admin')
  const supabase = await createClient()

  // Comptes : session admin (politique 3), aucune donnée financière.
  // Emails : Auth Admin API derrière requireAdmin() (§2.8).
  const [{ data: users }, emails] = await Promise.all([
    supabase.from('users').select('id, full_name, role, advisor_id').order('full_name'),
    getUserEmails(),
  ])

  return (
    <AdminUsersView
      meId={me.id}
      users={users ?? []}
      emails={emails}
      actions={{ create: createUserAccount, update: updateUserRole, remove: deleteUserAccount }}
    />
  )
}
