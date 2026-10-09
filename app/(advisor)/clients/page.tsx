import ClientListView from '@/components/views/ClientListView'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/current-user'

export default async function ClientsPage() {
  const me = await requireRole('advisor')
  const supabase = await createClient()

  // RLS (politique 2) : la base ne renvoie que les clients affectés à ce conseiller.
  const { data } = await supabase
    .from('users')
    .select('id, full_name, age, risk_tolerance, assets(amount)')
    .eq('advisor_id', me.id)
    .order('full_name')

  const clients = (data ?? []).map((c) => ({
    id: c.id,
    full_name: c.full_name,
    age: c.age,
    risk_tolerance: c.risk_tolerance,
    total: (c.assets ?? []).reduce((s: number, a: { amount: number }) => s + Number(a.amount), 0),
  }))

  return <ClientListView clients={clients} />
}
