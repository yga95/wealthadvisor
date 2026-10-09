import { Ring, AllocationLegend, AllocationBar } from '@/components/AllocationRing'
import Ledger, { type LedgerRow } from '@/components/Ledger'
import ShareBars from '@/components/ShareBars'
import { Avatar, StatTile, RiskDial } from '@/components/ui'
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
  const totalIncome = income.reduce((s, i) => s + Number(i.amount), 0)
  const [latest, ...older] = recos

  return (
    <main className="page">
      <div className="flex items-center gap-4">
        <Avatar name={name} size="lg" />
        <div>
          <h1 className="page-title">Your portfolio</h1>
          <p className="mt-1 text-sm text-muted">Your advisor keeps this information up to date.</p>
        </div>
      </div>

      {/* Pièce maîtresse : la dernière recommandation */}
      <section className="panel panel-hero mt-8 overflow-hidden p-6 md:p-8">
        {latest ? (
          <div className="grid items-center gap-8 md:grid-cols-[auto_minmax(0,1fr)]">
            <div className="mx-auto">
              <Ring actions={latest.pct_actions} obligations={latest.pct_obligations} liquidites={latest.pct_liquidites}
                center={`${latest.pct_actions}%`} caption="in equities" size={230} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="section-title text-lg">Latest recommendation</h2>
                <span className="chip">{shortDate(latest.created_at)}</span>
              </div>
              <div className="mt-6">
                <AllocationLegend actions={latest.pct_actions} obligations={latest.pct_obligations} liquidites={latest.pct_liquidites} />
              </div>
              <p className="mt-6 max-w-prose whitespace-pre-wrap leading-relaxed text-ink/90">{latest.explanation}</p>
              <p className="mt-5 text-xs text-muted">Indicative simulation prepared with AI assistance. It is not regulated financial advice.</p>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="section-title text-lg">Latest recommendation</h2>
            <p className="mt-3 text-sm text-muted">Your advisor has not shared a recommendation yet. It will appear here.</p>
          </div>
        )}
      </section>

      <div className="mt-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatTile icon="wallet" label="Recorded assets" value={eur.format(total)} accent />
        <StatTile icon="income" label="Recorded income" value={eur.format(totalIncome)} />
        <div className="tile flex items-center justify-between gap-2">
          <div>
            <p className="text-sm text-muted">Risk profile</p>
            <p className="money mt-1 text-xl">{RISK_LABEL[risk]}</p>
          </div>
          <RiskDial risk={risk} size="sm" />
        </div>
        <StatTile icon="person" label="Age" value={age ?? '—'} hint={age ? undefined : 'Ask your advisor to complete it'} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="panel px-5 py-5">
          <h2 className="section-title">Asset breakdown</h2>
          <div className="mt-5"><ShareBars rows={assets} /></div>
        </section>
        <Ledger title="Assets" rows={assets} emptyText="No assets recorded yet." />
        <Ledger title="Income" rows={income} emptyText="No income recorded yet." />
      </div>

      {older.length > 0 && (
        <section className="mt-8">
          <h2 className="section-title">Earlier recommendations</h2>
          <ul className="panel mt-3 divide-y divide-edge/70">
            {older.map((r) => (
              <li key={r.id} className="grid gap-3 px-5 py-4 text-sm md:grid-cols-[8rem_minmax(0,1fr)_18rem] md:items-center">
                <span className="text-muted">{shortDate(r.created_at)}</span>
                <AllocationBar actions={r.pct_actions} obligations={r.pct_obligations} liquidites={r.pct_liquidites} />
                <span className="tabular-nums text-muted md:text-right">
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
