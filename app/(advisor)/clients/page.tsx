import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/current-user'

const eur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
const riskLabel: Record<string, string> = { cautious: 'Cautious', balanced: 'Balanced', dynamic: 'Dynamic' }

export default async function ClientsPage() {
  const me = await requireRole('advisor')
  const supabase = await createClient()

  // RLS (politique 2) : la base ne renvoie que les clients affectés à ce conseiller.
  const { data: clients, error } = await supabase
    .from('users')
    .select('id, full_name, age, risk_tolerance, assets(amount)')
    .eq('advisor_id', me.id)
    .order('full_name')

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold">My clients</h1>
      {error && <p className="mt-4 text-sm text-red-600">{error.message}</p>}
      {clients?.length === 0 && <p className="mt-4 text-gray-600">No client is assigned to you yet.</p>}

      {!!clients?.length && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-300 text-left text-gray-500">
              <tr>
                <th className="py-2 pr-4">Name</th>
                <th className="pr-4">Age</th>
                <th className="pr-4">Risk profile</th>
                <th className="pr-4 text-right">Total assets</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const total = (c.assets ?? []).reduce((s: number, a: { amount: number }) => s + Number(a.amount), 0)
                return (
                  <tr key={c.id} className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-medium">{c.full_name}</td>
                    <td className="pr-4">{c.age ?? '—'}</td>
                    <td className="pr-4">{riskLabel[c.risk_tolerance]}</td>
                    <td className="pr-4 text-right">{eur.format(total)}</td>
                    <td className="text-right">
                      <Link href={`/clients/${c.id}`} className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-100">
                        Open file
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
