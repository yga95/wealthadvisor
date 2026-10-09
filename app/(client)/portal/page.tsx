import PortalView from '@/components/views/PortalView'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/current-user'

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

  return (
    <PortalView
      name={me.full_name}
      age={profile?.age ?? null}
      risk={profile?.risk_tolerance ?? 'balanced'}
      assets={(assets ?? []).map((a) => ({ id: a.id, name: a.label, amount: a.amount }))}
      income={(income ?? []).map((i) => ({ id: i.id, name: i.source, amount: i.amount }))}
      recos={recos ?? []}
    />
  )
}
