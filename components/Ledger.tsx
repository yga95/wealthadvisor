import ActionForm from '@/components/ActionForm'
import { eur } from '@/lib/format'
import type { ActionState } from '@/lib/validation/schemas'

type Act = (state: ActionState, formData: FormData) => Promise<ActionState>
export type LedgerRow = { id: string; name: string; amount: number }

const ghost =
  'rounded-md border border-transparent bg-transparent px-2 py-1.5 text-sm hover:border-edge focus:border-mint focus:bg-white/5 focus:outline-none'

// Liste de lignes chiffrées. Avec des actions : modifiable sur place (CRUD conseiller).
// Sans actions : lecture seule (espace client).
export default function Ledger({
  title, field, placeholder, ownerId, rows, add, update, remove, emptyText,
}: {
  title: string
  rows: LedgerRow[]
  emptyText: string
  field?: 'label' | 'source'
  placeholder?: string
  ownerId?: string
  add?: Act
  update?: Act
  remove?: Act
}) {
  const total = rows.reduce((s, r) => s + Number(r.amount), 0)
  const editable = Boolean(add && update && remove && field && ownerId)

  return (
    <section className="panel">
      <header className="flex items-baseline justify-between border-b border-edge px-5 py-4">
        <h2 className="section-title">{title}</h2>
        <p className="money text-base text-champagne">{eur.format(total)}</p>
      </header>

      <ul className="divide-y divide-edge/70">
        {rows.map((r) =>
          editable ? (
            <li key={r.id} className="group flex items-center gap-2 px-3 py-2 sm:py-1.5">
              <ActionForm action={update!} className="flex flex-1 flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="owner_id" value={ownerId} />
                <input name={field} defaultValue={r.name} required maxLength={100}
                  aria-label={`${title} name`} className={`${ghost} min-w-0 basis-full sm:basis-auto sm:flex-1`} />
                <input name="amount" type="number" step="0.01" min={0} defaultValue={r.amount} required
                  aria-label="Amount in euros" className={`${ghost} no-spin money ml-auto w-32 text-right text-base`} />
                <button className="btn hidden px-3 py-1 group-focus-within:inline-flex">Save</button>
              </ActionForm>
              <ActionForm action={remove!}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="owner_id" value={ownerId} />
                <button className="btn btn-danger md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                  Delete
                </button>
              </ActionForm>
            </li>
          ) : (
            <li key={r.id} className="flex items-baseline justify-between px-5 py-3 text-sm">
              <span>{r.name}</span>
              <span className="money text-base">{eur.format(Number(r.amount))}</span>
            </li>
          ),
        )}
        {rows.length === 0 && <li className="px-5 py-4 text-sm text-muted">{emptyText}</li>}
      </ul>

      {editable && (
        <ActionForm action={add!} className="flex flex-wrap items-center gap-2 border-t border-dashed border-edge px-3 py-3">
          <input type="hidden" name="owner_id" value={ownerId} />
          <input name={field} placeholder={placeholder} required maxLength={100}
            aria-label={`New ${title.toLowerCase()} name`} className="field min-w-0 basis-full sm:basis-auto sm:flex-1" />
          <input name="amount" type="number" step="0.01" min={0} placeholder="Amount (€)" required
            aria-label="Amount" className="field no-spin w-32 text-right" />
          <button className="btn btn-primary">Add</button>
        </ActionForm>
      )}
    </section>
  )
}
