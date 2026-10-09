import ActionForm from '@/components/ActionForm'
import ConfirmSubmit from '@/components/ConfirmSubmit'
import { Avatar, StatTile } from '@/components/ui'
import type { ActionState } from '@/lib/validation/schemas'

type Act = (state: ActionState, formData: FormData) => Promise<ActionState>
export type AdminUser = { id: string; full_name: string; role: string; advisor_id: string | null }

const ROLE_ORDER = ['admin', 'advisor', 'client'] as const
const ROLE_TITLE: Record<string, string> = { admin: 'Administrators', advisor: 'Advisors', client: 'Clients' }
const ROLE_DOT: Record<string, string> = { admin: 'bg-champagne', advisor: 'bg-mint', client: 'bg-lilac' }

export default function AdminUsersView({
  meId, users, emails, actions,
}: {
  meId: string; users: AdminUser[]; emails: Record<string, string>
  actions: { create: Act; update: Act; remove: Act }
}) {
  const advisors = users.filter((u) => u.role === 'advisor')
  const clients = users.filter((u) => u.role === 'client')
  const unassigned = clients.filter((u) => !u.advisor_id).length

  return (
    <main className="page">
      <h1 className="page-title">Users</h1>
      <p className="mt-2 text-sm text-muted">Create accounts, set roles and assign each client to an advisor.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatTile icon="users" label="Accounts" value={users.length} />
        <StatTile icon="person" label="Advisors" value={advisors.length} />
        <StatTile icon="portfolio" label="Clients" value={clients.length} />
        <StatTile icon="alert" label="Without an advisor" value={unassigned} accent={unassigned > 0}
          hint={unassigned ? 'Assign them below' : 'Every client is assigned'} />
      </div>

      <section className="panel panel-hero mt-6 px-6 py-6">
        <h2 className="section-title">Add a user</h2>
        <ActionForm action={actions.create} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="min-w-40 flex-1 text-sm text-muted">
            Full name
            <input name="full_name" required maxLength={120} className="field mt-1 w-full" />
          </label>
          <label className="min-w-48 flex-1 text-sm text-muted">
            Email
            <input name="email" type="email" required className="field mt-1 w-full" />
          </label>
          <label className="w-44 text-sm text-muted">
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
            <h2 className="section-title flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${ROLE_DOT[role]}`} aria-hidden />
              {ROLE_TITLE[role]} <span className="font-sans text-sm font-normal text-muted">{group.length}</span>
            </h2>
            <ul className="panel mt-3 divide-y divide-edge/70">
              {group.map((u) => (
                <li key={u.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-3.5">
                  <div className="flex min-w-56 flex-1 items-center gap-3">
                    <Avatar name={u.full_name} size="sm" />
                    <div className="min-w-0">
                      <p className="font-medium leading-tight">
                        {u.full_name}
                        {u.id === meId && <span className="chip ml-2 border-champagne/40 py-0 text-champagne">you</span>}
                      </p>
                      <p className="truncate text-xs text-muted">{emails[u.id] ?? 'Email unavailable'}</p>
                    </div>
                  </div>

                  <ActionForm action={actions.update} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={u.id} />
                    <select name="role" defaultValue={u.role} aria-label={`Role of ${u.full_name}`} className="field">
                      <option value="client">Client</option>
                      <option value="advisor">Advisor</option>
                      <option value="admin">Administrator</option>
                    </select>
                    <select name="advisor_id" defaultValue={u.advisor_id ?? ''} aria-label={`Advisor of ${u.full_name}`}
                      className={`field ${u.role === 'client' && !u.advisor_id ? 'border-champagne/70' : ''}`}>
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

      <p className="mt-6 text-xs text-muted">The advisor setting only applies to clients. Financial data never appears on this page.</p>
    </main>
  )
}
