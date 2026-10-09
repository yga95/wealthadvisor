import Link from 'next/link'
import { eur, RISK_LABEL } from '@/lib/format'

export type ClientSummary = {
  id: string; full_name: string; age: number | null; risk_tolerance: string; total: number
}

export default function ClientListView({ clients }: { clients: ClientSummary[] }) {
  const grand = clients.reduce((s, c) => s + c.total, 0)
  return (
    <main className="page">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="page-title">Your clients</h1>
        {clients.length > 0 && (
          <p className="text-sm text-muted">
            {clients.length} {clients.length === 1 ? 'client' : 'clients'}, <span className="money text-lg text-ink">{eur.format(grand)}</span> in recorded assets
          </p>
        )}
      </div>

      {clients.length === 0 ? (
        <div className="panel mt-8 px-6 py-10 text-center">
          <p className="section-title">No clients assigned yet</p>
          <p className="mt-2 text-sm text-muted">An administrator assigns clients to you from the Users page.</p>
        </div>
      ) : (
        <div className="panel mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-muted">
                <th className="px-5 py-3 font-normal">Client</th>
                <th className="px-3 py-3 font-normal">Age</th>
                <th className="px-3 py-3 font-normal">Risk profile</th>
                <th className="px-3 py-3 text-right font-normal">Recorded assets</th>
                <th className="px-5 py-3"><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-pine-soft/50">
                  <td className="px-5 py-4">
                    <Link href={`/clients/${c.id}`} className="font-display text-lg hover:text-pine">
                      {c.full_name}
                    </Link>
                  </td>
                  <td className="px-3 py-4">{c.age ?? <span className="text-brass">Missing</span>}</td>
                  <td className="px-3 py-4">{RISK_LABEL[c.risk_tolerance]}</td>
                  <td className="money px-3 py-4 text-right text-base">{eur.format(c.total)}</td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/clients/${c.id}`} className="btn px-3 py-1">Open file</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
