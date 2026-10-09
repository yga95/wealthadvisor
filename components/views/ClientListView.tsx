import Link from 'next/link'
import { Avatar, StatTile, RiskDial } from '@/components/ui'
import { eur, RISK_LABEL } from '@/lib/format'

export type ClientSummary = {
  id: string; full_name: string; age: number | null; risk_tolerance: string; total: number
}

export default function ClientListView({ clients }: { clients: ClientSummary[] }) {
  const book = clients.reduce((s, c) => s + c.total, 0)
  const missing = clients.filter((c) => c.age == null).length
  const sorted = [...clients].sort((a, b) => b.total - a.total)

  return (
    <main className="page">
      <h1 className="page-title">Your clients</h1>
      <p className="mt-2 text-sm text-muted">Open a file to update assets, income and notes, or to prepare a recommendation.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatTile icon="users" label="Clients" value={clients.length} />
        <StatTile icon="wallet" label="Assets under advice" value={eur.format(book)} accent />
        <StatTile icon="portfolio" label="Average per client" value={eur.format(clients.length ? book / clients.length : 0)} />
        <StatTile icon="alert" label="Profiles to complete" value={missing}
          hint={missing ? 'Age is needed for recommendations' : 'All profiles are complete'} />
      </div>

      {clients.length === 0 ? (
        <div className="panel mt-8 px-6 py-14 text-center">
          <p className="section-title">No clients assigned yet</p>
          <p className="mt-2 text-sm text-muted">An administrator assigns clients to you from the Users page.</p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((c) => {
            const share = book ? (c.total / book) * 100 : 0
            return (
              <li key={c.id}>
                <Link href={`/clients/${c.id}`}
                  className="panel block p-5 transition-colors hover:border-champagne/60 focus-visible:border-champagne">
                  <div className="flex items-start gap-3">
                    <Avatar name={c.full_name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{c.full_name}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <span className={`chip ${c.age == null ? 'border-champagne/50 text-champagne' : ''}`}>
                          {c.age == null ? 'Age missing' : `${c.age} years`}
                        </span>
                        <span className="chip">{RISK_LABEL[c.risk_tolerance]}</span>
                      </div>
                    </div>
                    <RiskDial risk={c.risk_tolerance} size="sm" />
                  </div>

                  <p className="mt-6 text-xs text-muted">Recorded assets</p>
                  <p className="money mt-1 text-2xl text-champagne">{eur.format(c.total)}</p>

                  <div className="mt-5 flex items-center gap-3 text-xs text-muted">
                    <div className="h-1.5 flex-1 rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-lilac" style={{ width: `${Math.max(share, 2)}%` }} />
                    </div>
                    <span className="tabular-nums">{share.toFixed(0)}% of your book</span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
