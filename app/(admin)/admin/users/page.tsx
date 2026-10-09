import ActionForm from '@/components/ActionForm'
import ConfirmSubmit from '@/components/ConfirmSubmit'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/current-user'
import { updateUserRole, createUserAccount, deleteUserAccount, getUserEmails } from '@/actions/admin'

const input = 'rounded border border-gray-300 px-2 py-1 text-sm'
const btn = 'rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100'

export default async function AdminUsersPage() {
  const me = await requireRole('admin')
  const supabase = await createClient()

  // Comptes : session admin (politique 3), aucune donnée financière.
  // Emails : Auth Admin API derrière requireAdmin().
  const [{ data: users }, emails] = await Promise.all([
    supabase.from('users').select('id, full_name, role, advisor_id').order('role').order('full_name'),
    getUserEmails(),
  ])
  const advisors = (users ?? []).filter((u) => u.role === 'advisor')

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">User management</h1>

      <section className="rounded border border-gray-200 p-4">
        <h2 className="mb-3 font-semibold">New user</h2>
        <ActionForm action={createUserAccount} className="flex flex-wrap items-center gap-2">
          <input name="full_name" placeholder="Full name" required maxLength={120} className={`${input} min-w-0 flex-1`} />
          <input name="email" type="email" placeholder="Email" required className={`${input} min-w-0 flex-1`} />
          <input name="password" type="password" placeholder="Temporary password" required minLength={8} className={`${input} w-44`} />
          <button className={btn}>Create</button>
        </ActionForm>
        <p className="mt-2 text-xs text-gray-500">New accounts start as client; change the role below.</p>
      </section>

      <section className="rounded border border-gray-200 p-4">
        <h2 className="mb-2 font-semibold">Accounts ({users?.length ?? 0})</h2>
        <ul>
          {(users ?? []).map((u) => (
            <li key={u.id} className="flex flex-wrap items-center gap-3 border-b border-gray-100 py-3">
              <div className="min-w-48 flex-1">
                <p className="font-medium">
                  {u.full_name}
                  {u.id === me.id && <span className="text-gray-500"> (you)</span>}
                </p>
                <p className="text-xs text-gray-500">{emails[u.id] ?? '—'}</p>
              </div>

              <ActionForm action={updateUserRole} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={u.id} />
                <select name="role" defaultValue={u.role} className={input}>
                  <option value="client">client</option>
                  <option value="advisor">advisor</option>
                  <option value="admin">admin</option>
                </select>
                <select name="advisor_id" defaultValue={u.advisor_id ?? ''} className={input}>
                  <option value="">No advisor</option>
                  {advisors.map((a) => (
                    <option key={a.id} value={a.id}>{a.full_name}</option>
                  ))}
                </select>
                <button className={btn}>Save</button>
              </ActionForm>

              {u.id !== me.id && (
                <ActionForm action={deleteUserAccount}>
                  <input type="hidden" name="id" value={u.id} />
                  <ConfirmSubmit
                    message={`Delete ${u.full_name}? Their data will be permanently erased.`}
                    className={`${btn} text-red-600`}
                  >
                    Delete
                  </ConfirmSubmit>
                </ActionForm>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-gray-500">
          The advisor field only applies to clients. Financial data is never shown here (separation of duties).
        </p>
      </section>
    </main>
  )
}
