import Link from 'next/link'
import ActionForm from '@/components/ActionForm'
import Ledger, { type LedgerRow } from '@/components/Ledger'
import { eur, shortDate, RISK_LABEL } from '@/lib/format'
import type { ActionState } from '@/lib/validation/schemas'

type Act = (state: ActionState, formData: FormData) => Promise<ActionState>

export type ClientFileProps = {
  client: { id: string; full_name: string; age: number | null; risk_tolerance: string }
  assets: LedgerRow[]
  income: LedgerRow[]
  notes: { id: string; content: string; created_at: string }[]
  actions: {
    updateProfile: Act
    addAsset: Act; updateAsset: Act; deleteAsset: Act
    addIncome: Act; updateIncome: Act; deleteIncome: Act
    addNote: Act; deleteNote: Act
  }
  aiPanel?: React.ReactNode
}

export default function ClientFileView({ client, assets, income, notes, actions, aiPanel }: ClientFileProps) {
  const totalAssets = assets.reduce((s, a) => s + Number(a.amount), 0)

  return (
    <main className="page">
      <Link href="/clients" className="text-sm text-muted hover:text-pine">All clients</Link>

      <div className="mt-2 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="page-title">{client.full_name}</h1>
          <p className="mt-2 text-sm text-muted">
            {client.age ? `${client.age} years old` : 'Age not recorded'}, {RISK_LABEL[client.risk_tolerance].toLowerCase()} risk profile
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-sm text-muted">Recorded assets</p>
          <p className="money text-4xl text-pine">{eur.format(totalAssets)}</p>
        </div>
      </div>

      <ActionForm action={actions.updateProfile}
        className="mt-6 flex flex-wrap items-end gap-4 rounded-md bg-pine-soft px-5 py-4">
        <input type="hidden" name="client_id" value={client.id} />
        <label className="text-sm font-medium">
          Age
          <input name="age" type="number" min={18} max={120} defaultValue={client.age ?? ''}
            className="field mt-1 block w-24" />
        </label>
        <label className="text-sm font-medium">
          Risk tolerance
          <select name="risk_tolerance" defaultValue={client.risk_tolerance} className="field mt-1 block">
            <option value="cautious">Cautious</option>
            <option value="balanced">Balanced</option>
            <option value="dynamic">Dynamic</option>
          </select>
        </label>
        <button className="btn">Save profile</button>
        <p className="text-xs text-muted md:ml-auto md:max-w-56">
          Age and risk tolerance are used to generate recommendations.
        </p>
      </ActionForm>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-6">
          <Ledger title="Assets" field="label" placeholder="Savings account, equity plan…" ownerId={client.id}
            rows={assets} emptyText="No assets recorded yet. Add the first one below."
            add={actions.addAsset} update={actions.updateAsset} remove={actions.deleteAsset} />
          <Ledger title="Income" field="source" placeholder="Salary, rental income…" ownerId={client.id}
            rows={income} emptyText="No income recorded yet. Add the first one below."
            add={actions.addIncome} update={actions.updateIncome} remove={actions.deleteIncome} />
        </div>

        <div className="space-y-6">
          {aiPanel ?? (
            <section className="panel border-t-4 border-t-pine px-5 py-4">
              <h2 className="section-title">AI recommendation</h2>
              <p className="mt-2 text-sm text-muted">Available in the next step.</p>
            </section>
          )}

          <section className="panel">
            <header className="border-b border-line px-5 py-4">
              <h2 className="section-title">Private notes</h2>
              <p className="mt-0.5 text-xs text-muted">Visible to you only. The client never sees them.</p>
            </header>
            <ActionForm action={actions.addNote} className="flex flex-col gap-2 px-5 pt-4">
              <input type="hidden" name="client_id" value={client.id} />
              <textarea name="content" required maxLength={2000} rows={3}
                placeholder="What did you discuss? What should you follow up on?" className="field resize-y" />
              <button className="btn self-end">Add note</button>
            </ActionForm>
            <ul className="space-y-4 px-5 py-4">
              {notes.map((n) => (
                <li key={n.id} className="group border-l-2 border-brass pl-3 text-sm">
                  <p className="whitespace-pre-wrap leading-relaxed">{n.content}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                    <span>{shortDate(n.created_at)}</span>
                    <ActionForm action={actions.deleteNote}>
                      <input type="hidden" name="id" value={n.id} />
                      <input type="hidden" name="client_id" value={client.id} />
                      <button className="text-danger hover:underline md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                        Delete
                      </button>
                    </ActionForm>
                  </div>
                </li>
              ))}
              {notes.length === 0 && <li className="text-sm text-muted">No notes yet.</li>}
            </ul>
          </section>
        </div>
      </div>
    </main>
  )
}
