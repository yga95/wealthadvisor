import Link from 'next/link'
import ActionForm from '@/components/ActionForm'
import Ledger, { type LedgerRow } from '@/components/Ledger'
import ShareBars from '@/components/ShareBars'
import { Avatar, StatTile, RiskDial } from '@/components/ui'
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
  const totalIncome = income.reduce((s, i) => s + Number(i.amount), 0)

  return (
    <main className="page">
      <Link href="/clients" className="text-sm text-muted hover:text-champagne">All clients</Link>

      {/* Pièce maîtresse : identité, patrimoine et cadran de risque */}
      <section className="panel panel-hero mt-4 grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-8">
        <div>
          <div className="flex items-center gap-4">
            <Avatar name={client.full_name} size="lg" />
            <div className="min-w-0">
              <h1 className="page-title truncate">{client.full_name}</h1>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className={`chip ${client.age == null ? 'border-champagne/50 text-champagne' : ''}`}>
                  {client.age ? `${client.age} years old` : 'Age missing'}
                </span>
                <span className="chip">{assets.length} asset line{assets.length === 1 ? '' : 's'}</span>
                <span className="chip">{income.length} income source{income.length === 1 ? '' : 's'}</span>
              </div>
            </div>
          </div>
          <p className="mt-8 text-sm text-muted">Recorded assets</p>
          <p className="money mt-1 text-4xl text-champagne md:text-5xl">{eur.format(totalAssets)}</p>
        </div>
        <div className="flex flex-col items-center rounded-2xl border border-edge bg-white/[0.03] px-6 py-4">
          <RiskDial risk={client.risk_tolerance} />
          <p className="mt-1 text-xs text-muted">Risk profile</p>
          <p className="font-display text-lg">{RISK_LABEL[client.risk_tolerance]}</p>
        </div>
      </section>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <StatTile icon="income" label="Recorded income" value={eur.format(totalIncome)} />
        <StatTile icon="note" label="Private notes" value={notes.length}
          hint={notes[0] ? `Last on ${shortDate(notes[0].created_at)}` : 'None yet'} />
        <StatTile icon="gauge" label="Profile" value={client.age ? 'Complete' : 'Age missing'} accent={!client.age}
          hint="Needed to generate recommendations" />
      </div>

      <ActionForm action={actions.updateProfile} className="panel mt-5 flex flex-wrap items-end gap-4 px-5 py-4">
        <input type="hidden" name="client_id" value={client.id} />
        <label className="text-sm text-muted">
          Age
          <input name="age" type="number" min={18} max={120} defaultValue={client.age ?? ''} className="field mt-1 block w-24" />
        </label>
        <label className="text-sm text-muted">
          Risk tolerance
          <select name="risk_tolerance" defaultValue={client.risk_tolerance} className="field mt-1 block">
            <option value="cautious">Cautious</option>
            <option value="balanced">Balanced</option>
            <option value="dynamic">Dynamic</option>
          </select>
        </label>
        <button className="btn">Save profile</button>
        <p className="text-xs text-muted md:ml-auto md:max-w-60">Age and risk tolerance are used to generate recommendations.</p>
      </ActionForm>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
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
            <section className="panel overflow-hidden px-5 py-5">
              <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-s-cash/30 blur-3xl" aria-hidden />
              <h2 className="section-title">AI recommendation</h2>
              <p className="mt-2 text-sm text-muted">Available in the next step.</p>
            </section>
          )}

          <section className="panel px-5 py-5">
            <h2 className="section-title">Asset breakdown</h2>
            <div className="mt-5"><ShareBars rows={assets} /></div>
          </section>

          <section className="panel">
            <header className="border-b border-edge px-5 py-4">
              <h2 className="section-title">Private notes</h2>
              <p className="mt-1 text-xs text-muted">Visible to you only. The client never sees them.</p>
            </header>
            <ActionForm action={actions.addNote} className="flex flex-col gap-2 px-5 pt-4">
              <input type="hidden" name="client_id" value={client.id} />
              <textarea name="content" required maxLength={2000} rows={3}
                placeholder="What did you discuss? What should you follow up on?" className="field resize-y" />
              <button className="btn self-end">Add note</button>
            </ActionForm>
            <ul className="space-y-4 px-5 py-4">
              {notes.map((n) => (
                <li key={n.id} className="group rounded-xl bg-white/[0.03] px-3 py-2.5 text-sm ring-1 ring-edge/60">
                  <p className="whitespace-pre-wrap leading-relaxed">{n.content}</p>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
                    <span>{shortDate(n.created_at)}</span>
                    <ActionForm action={actions.deleteNote}>
                      <input type="hidden" name="id" value={n.id} />
                      <input type="hidden" name="client_id" value={client.id} />
                      <button className="text-danger hover:underline md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">Delete</button>
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
