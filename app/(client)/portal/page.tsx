import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/current-user'

const eur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
const riskLabel: Record<string, string> = { cautious: 'Cautious', balanced: 'Balanced', dynamic: 'Dynamic' }

// Espace client, lecture seule (Design Rev. 3, §5.2 : GET /portal).
// Tout est filtré par le RLS : ses propres lignes uniquement, recommandations
// au statut 'done' uniquement (politique 18), aucune note (aucune politique).
export default async function PortalPage() {
  const me = await requireRole('client')
  const supabase = await createClient()

  const [{ data: profile }, { data: assets }, { data: income }, { data: recos }] = await Promise.all([
    supabase.from('users').select('age, risk_tolerance').eq('id', me.id).single(),
    supabase.from('assets').select('id, label, amount').order('created_at'),
    supabase.from('income').select('id, source, amount').order('created_at'),
    supabase
      .from('recommendations')
      .select('id, pct_actions, pct_obligations, pct_liquidites, explanation, created_at')
      .order('created_at', { ascending: false }),
  ])

  const totalAssets = (assets ?? []).reduce((s, a) => s + Number(a.amount), 0)
  const totalIncome = (income ?? []).reduce((s, i) => s + Number(i.amount), 0)

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">My portfolio</h1>
        <p className="mt-1 text-sm text-gray-600">
          Age {profile?.age ?? '—'} · {riskLabel[profile?.risk_tolerance ?? 'balanced']} profile
          <span className="text-gray-400"> · maintained by your advisor</span>
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ReadOnlyList title="Assets" total={totalAssets}
          rows={(assets ?? []).map((a) => ({ id: a.id, name: a.label, amount: a.amount }))} />
        <ReadOnlyList title="Income" total={totalIncome}
          rows={(income ?? []).map((i) => ({ id: i.id, name: i.source, amount: i.amount }))} />
      </div>

      <section className="rounded border border-gray-200 p-4">
        <h2 className="font-semibold">Recommendations from your advisor</h2>
        {!recos?.length && <p className="mt-2 text-sm text-gray-500">No recommendation yet.</p>}
        <ul className="mt-3 space-y-3">
          {(recos ?? []).map((r) => (
            <li key={r.id} className="rounded border border-gray-100 p-3 text-sm">
              <p className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString('en-GB')}</p>
              <p className="mt-1 font-medium">
                Equities {r.pct_actions}% · Bonds {r.pct_obligations}% · Cash {r.pct_liquidites}%
              </p>
              <p className="mt-1 whitespace-pre-wrap text-gray-700">{r.explanation}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-gray-500">
          Indicative simulation generated with AI assistance. This is not regulated financial advice.
        </p>
      </section>
    </main>
  )
}

function ReadOnlyList({ title, total, rows }: {
  title: string; total: number; rows: { id: string; name: string; amount: number }[]
}) {
  return (
    <section className="rounded border border-gray-200 p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-semibold">{title}</h2>
        <span className="text-sm text-gray-600">{eur.format(total)}</span>
      </div>
      <ul className="space-y-1 text-sm">
        {rows.map((r) => (
          <li key={r.id} className="flex justify-between border-b border-gray-100 py-1">
            <span>{r.name}</span>
            <span>{eur.format(Number(r.amount))}</span>
          </li>
        ))}
        {rows.length === 0 && <li className="text-gray-500">Nothing recorded yet.</li>}
      </ul>
    </section>
  )
}
