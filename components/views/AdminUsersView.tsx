import ActionForm from '@/components/ActionForm'
import ConfirmSubmit from '@/components/ConfirmSubmit'
import type { ActionState } from '@/lib/validation/schemas'

type Act = (state: ActionState, formData: FormData) => Promise<ActionState>
export type AdminUser = { id: string; full_name: string; role: string; advisor_id: string | null }

const ROLE_ORDER = ['admin', 'advisor', 'client'] as const
const ROLE_TITLE: Record<string, string> = { admin: 'Administrators', advisor: 'Advisors', client: 'Clients' }

export default function AdminUsersView({
  meId, users, emails, actions,
}: {
  meId: string; users: AdminUser[]; emails: Record<string, string>
  actions: { create: Act; update: Act; remove: Act }
}) {
  const advisors = users.filter((u) => u.role === 'advisor')
  const unassigned = users.filter((u) => u.role === 'client' && !u.advisor_id).length

  return (
    <main className="page">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="page-title">Users</h1>
        <p className="text-sm text-muted">
          {users.length} accounts{unassigned > 0 && <>, <span className="text-brass">{unassigned} client{unassigned > 1 ? 's' : ''} without an advisor</span></>}
        </p>
      </div>

      <section className="panel mt-8 px-5 py-5">
        <h2 className="section-title">Add a user</h2>
        <ActionForm action={actions.create} className="mt-3 flex flex-wrap items-end gap-3">
          <label className="min-w-40 flex-1 text-sm font-medium">
            Full name
            <input name="full_name" required maxLength={120} className="field mt-1 w-full" />
          </label>
          <label className="min-w-48 flex-1 text-sm font-medium">
            Email
            <input name="email" type="email" required className="field mt-1 w-full" />
          </label>
          <label className="w-44 text-sm font-medium">
            Temporary password
            <input name="password" type="password" required minLength={8} className="field mt-1 w-full" />
          </label>
          <button className="btn btn-primary">Add user</button>
        </ActionForm>
        <p className="mt-2 text-xs text-muted">New accounts start as clients. Change the role below.</p>
      </section>

      {ROLE_ORDER.map((role) => {
        const group = users.filter((u) => u.role === role)
        if (group.length === 0) return null
        return (
          <section key={role} className="mt-8">
            <h2 className="section-title">{ROLE_TITLE[role]} <span className="text-base text-muted">({group.length})</span></h2>
            <ul className="panel mt-3 divide-y divide-line">
              {group.map((u) => (
                <li key={u.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
                  <div className="min-w-52 flex-1">
                    <p className="font-display text-lg leading-tight">
                      {u.full_name}
                      {u.id === meId && <span className="ml-2 font-sans text-xs text-muted">you</span>}
                    </p>
                    <p className="text-xs text-muted">{emails[u.id] ?? 'Email unavailable'}</p>
                  </div>

                  <ActionForm action={actions.update} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={u.id} />
                    <select name="role" defaultValue={u.role} aria-label={`Role of ${u.full_name}`} className="field">
                      <option value="client">Client</option>
                      <option value="advisor">Advisor</option>
                      <option value="admin">Administrator</option>
                    </select>
                    <select name="advisor_id" defaultValue={u.advisor_id ?? ''} aria-label={`Advisor of ${u.full_name}`}
                      className={`field ${u.role === 'client' && !u.advisor_id ? 'border-brass' : ''}`}>
                      <option value="">No advisor</option>
                      {advisors.map((a) => (
                        <option key={a.id} value={a.id}>{a.full_name}</option>
                      ))}
                    </select>
                    <button className="btn">Save</button>
                  </ActionForm>

                  {u.id !== meId ? (
                    <ActionForm action={actions.remove}>
                      <input type="hidden" name="id" value={u.id} />
                      <ConfirmSubmit message={`Delete ${u.full_name}? Their data will be erased permanently.`} className="btn btn-danger">
                        Delete
                      </ConfirmSubmit>
                    </ActionForm>
                  ) : (
                    <span className="w-16" aria-hidden />
                  )}
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      <p className="mt-6 text-xs text-muted">
        The advisor setting only applies to clients. Financial data never appears on this page.
      </p>
    </main>
  )
}
