import { notFound } from 'next/navigation'
import ClientFileView from '@/components/views/ClientFileView'
import AiPanel, { type RecoRow } from '@/components/AiPanel'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/current-user'
import { addAsset, updateAsset, deleteAsset } from '@/actions/assets'
import { addIncome, updateIncome, deleteIncome } from '@/actions/income'
import { addNote, deleteNote } from '@/actions/notes'
import { updateClientProfile } from '@/actions/clients'
import { generateRecommendation, archiveRecommendation } from '@/actions/recommendations'

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

  const [{ data: assets }, { data: income }, { data: notes }, { data: recos }] = await Promise.all([
    supabase.from('assets').select('id, label, amount').eq('owner_id', id).order('created_at'),
    supabase.from('income').select('id, source, amount').eq('owner_id', id).order('created_at'),
    supabase.from('notes').select('id, content, created_at').eq('client_id', id).order('created_at', { ascending: false }),
    supabase.from('recommendations')
      .select('id, status, pct_actions, pct_obligations, pct_liquidites, explanation, created_at')
      .eq('client_id', id).order('created_at', { ascending: false }).limit(8),
  ])

  // Même contrôle que l'action serveur : on désactive le bouton si une entrée manque.
  const blockedReason = client.age == null
    ? "Add the client's age to generate a recommendation."
    : !assets?.length && !income?.length
      ? 'Record at least one asset or income line first.'
      : null

  return (
    <ClientFileView
      client={client}
      assets={(assets ?? []).map((a) => ({ id: a.id, name: a.label, amount: a.amount }))}
      income={(income ?? []).map((i) => ({ id: i.id, name: i.source, amount: i.amount }))}
      notes={notes ?? []}
      actions={{
        updateProfile: updateClientProfile,
        addAsset, updateAsset, deleteAsset,
        addIncome, updateIncome, deleteIncome,
        addNote, deleteNote,
      }}
      aiPanel={
        <AiPanel clientId={client.id} recos={(recos ?? []) as RecoRow[]} blockedReason={blockedReason}
          generate={generateRecommendation} archive={archiveRecommendation} />
      }
    />
  )
}
