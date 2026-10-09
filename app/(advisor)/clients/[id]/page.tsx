import Link from 'next/link'
import { notFound } from 'next/navigation'
import ActionForm from '@/components/ActionForm'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/current-user'
import type { ActionState } from '@/lib/validation/schemas'
import { addAsset, updateAsset, deleteAsset } from '@/actions/assets'
import { addIncome, updateIncome, deleteIncome } from '@/actions/income'
import { addNote, deleteNote } from '@/actions/notes'
import { updateClientProfile } from '@/actions/clients'

const input = 'rounded border border-gray-300 px-2 py-1 text-sm'
const btn = 'rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100'
const eur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

type Act = (state: ActionState, formData: FormData) => Promise<ActionState>
type Row = { id: string; name: string; amount: number }

export default async function ClientFilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const me = await requireRole('advisor')
  const supabase = await createClient()

  // Le client doit être affecté à ce conseiller (RLS politique 2 + filtre explicite).
  const { data: client } = await supabase
    .from('users')
    .select('id, full_name, age, risk_tolerance')
    .eq('id', id)
    .eq('advisor_id', me.id)
    .maybeSingle()
  if (!client) notFound()

  const [{ data: assets }, { data: income }, { data: notes }] = await Promise.all([
    supabase.from('assets').select('id, label, amount').eq('owner_id', id).order('created_at'),
    supabase.from('income').select('id, source, amount').eq('owner_id', id).order('created_at'),
    supabase.from('notes').select('id, content, created_at').eq('client_id', id).order('created_at', { ascending: false }),
  ])

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <Link href="/clients" className="text-sm text-gray-500 hover:underline">← My clients</Link>
        <h1 className="mt-1 text-2xl font-semibold">{client.full_name}</h1>
      </div>

      {/* Profil : alimente l'IA (§5.4) */}
      <section className="rounded border border-gray-200 p-4">
        <h2 className="mb-3 font-semibold">Profile</h2>
        <ActionForm action={updateClientProfile} className="flex flex-wrap items-end gap-4">
          <input type="hidden" name="client_id" value={client.id} />
          <label className="text-sm">
            Age
            <input name="age" type="number" min={18} max={120} defaultValue={client.age ?? ''} className={`${input} ml-2 w-20`} />
          </label>
          <label className="text-sm">
            Risk tolerance
            <select name="risk_tolerance" defaultValue={client.risk_tolerance} className={`${input} ml-2`}>
              <option value="cautious">Cautious</option>
              <option value="balanced">Balanced</option>
              <option value="dynamic">Dynamic</option>
            </select>
          </label>
          <button className={btn}>Save profile</button>
        </ActionForm>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <FinanceSection
          title="Assets" field="label" placeholder="e.g. Savings account" ownerId={client.id}
          rows={(assets ?? []).map((a) => ({ id: a.id, name: a.label, amount: a.amount }))}
          add={addAsset} update={updateAsset} remove={deleteAsset}
        />
        <FinanceSection
          title="Income" field="source" placeholder="e.g. Salary" ownerId={client.id}
          rows={(income ?? []).map((i) => ({ id: i.id, name: i.source, amount: i.amount }))}
          add={addIncome} update={updateIncome} remove={deleteIncome}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Notes privées : jamais visibles par le client (§2.2) */}
        <section className="rounded border border-gray-200 p-4">
          <h2 className="font-semibold">
            Private notes <span className="text-xs font-normal text-gray-500">(only you can see them)</span>
          </h2>
          <ActionForm action={addNote} className="mt-3 flex flex-col gap-2">
            <input type="hidden" name="client_id" value={client.id} />
            <textarea name="content" required maxLength={2000} rows={2} placeholder="Write a note…" className={input} />
            <button className={`${btn} self-start`}>Add note</button>
          </ActionForm>
          <ul className="mt-4 space-y-2">
            {(notes ?? []).map((n) => (
              <li key={n.id} className="flex items-start justify-between gap-3 rounded border border-gray-100 p-2 text-sm">
                <div>
                  <p className="whitespace-pre-wrap">{n.content}</p>
                  <p className="mt-1 text-xs text-gray-500">{new Date(n.created_at).toLocaleDateString('en-GB')}</p>
                </div>
                <ActionForm action={deleteNote}>
                  <input type="hidden" name="id" value={n.id} />
                  <input type="hidden" name="client_id" value={client.id} />
                  <button className="text-xs text-red-600 hover:underline">Delete</button>
                </ActionForm>
              </li>
            ))}
            {!notes?.length && <li className="text-sm text-gray-500">No notes yet.</li>}
          </ul>
        </section>

        {/* Recommandation IA : étape 6 */}
        <section className="rounded border border-dashed border-gray-300 p-4">
          <h2 className="font-semibold">AI recommendation</h2>
          <p className="mt-2 text-sm text-gray-500">Coming in step 6.</p>
        </section>
      </div>
    </main>
  )
}

function FinanceSection({
  title, field, placeholder, ownerId, rows, add, update, remove,
}: {
  title: string; field: 'label' | 'source'; placeholder: string; ownerId: string
  rows: Row[]; add: Act; update: Act; remove: Act
}) {
  const total = rows.reduce((s, r) => s + Number(r.amount), 0)
  return (
    <section className="rounded border border-gray-200 p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-semibold">{title}</h2>
        <span className="text-sm text-gray-600">{eur.format(total)}</span>
      </div>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center gap-2">
            <ActionForm action={update} className="flex flex-1 flex-wrap items-center gap-2">
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="owner_id" value={ownerId} />
              <input name={field} defaultValue={r.name} required maxLength={100} className={`${input} min-w-0 flex-1`} />
              <input name="amount" type="number" step="0.01" min={0} defaultValue={r.amount} required className={`${input} w-28`} />
              <button className={btn}>Save</button>
            </ActionForm>
            <ActionForm action={remove}>
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="owner_id" value={ownerId} />
              <button className={`${btn} text-red-600`}>Delete</button>
            </ActionForm>
          </li>
        ))}
        {rows.length === 0 && <li className="text-sm text-gray-500">Nothing recorded yet.</li>}
      </ul>
      <ActionForm action={add} className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
        <input type="hidden" name="owner_id" value={ownerId} />
        <input name={field} placeholder={placeholder} required maxLength={100} className={`${input} min-w-0 flex-1`} />
        <input name="amount" type="number" step="0.01" min={0} placeholder="Amount" required className={`${input} w-28`} />
        <button className={btn}>Add</button>
      </ActionForm>
    </section>
  )
}
