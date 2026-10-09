import AllocationBar from '@/components/AllocationBar'
import Ledger, { type LedgerRow } from '@/components/Ledger'
import { eur, shortDate, RISK_LABEL } from '@/lib/format'

export type Reco = {
  id: string; pct_actions: number; pct_obligations: number; pct_liquidites: number
  explanation: string | null; created_at: string
}

export default function PortalView({
  name, age, risk, assets, income, recos,
}: {
  name: string; age: number | null; risk: string
  assets: LedgerRow[]; income: LedgerRow[]; recos: Reco[]
}) {
  const total = assets.reduce((s, a) => s + Number(a.amount), 0)
  const [latest, ...older] = recos

  return (
    <main className="page">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="page-title">Your portfolio</h1>
          <p className="mt-2 text-sm text-muted">
            {name}, {age ? `${age} years old` : 'age not recorded'}, {RISK_LABEL[risk].toLowerCase()} risk profile.
            Your advisor keeps this information up to date.
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-sm text-muted">Recorded assets</p>
          <p className="money text-4xl text-pine">{eur.format(total)}</p>
        </div>
      </div>

      <section className="panel mt-8 border-t-4 border-t-pine px-6 py-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="section-title">Latest recommendation</h2>
          {latest && <p className="text-sm text-muted">{shortDate(latest.created_at)}</p>}
        </div>
        {latest ? (
          <>
            <div className="mt-5">
              <AllocationBar size="lg" actions={latest.pct_actions}
                obligations={latest.pct_obligations} liquidites={latest.pct_liquidites} />
            </div>
            <p className="mt-5 max-w-prose whitespace-pre-wrap leading-relaxed">{latest.explanation}</p>
          </>
        ) : (
          <p className="mt-3 text-sm text-muted">Your advisor has not shared a recommendation yet.</p>
        )}
        <p className="mt-6 text-xs text-muted">
          Indicative simulation prepared with AI assistance. It is not regulated financial advice.
        </p>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Ledger title="Assets" rows={assets} emptyText="No assets recorded yet." />
        <Ledger title="Income" rows={income} emptyText="No income recorded yet." />
      </div>

      {older.length > 0 && (
        <section className="mt-6">
          <h2 className="section-title">Earlier recommendations</h2>
          <ul className="panel mt-3 divide-y divide-line">
            {older.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
                <span className="text-muted">{shortDate(r.created_at)}</span>
                <span className="money text-base">
                  Equities {r.pct_actions}%, bonds {r.pct_obligations}%, cash {r.pct_liquidites}%
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
