import { notFound } from 'next/navigation'
import ClientFileView from '@/components/views/ClientFileView'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/current-user'
import { addAsset, updateAsset, deleteAsset } from '@/actions/assets'
import { addIncome, updateIncome, deleteIncome } from '@/actions/income'
import { addNote, deleteNote } from '@/actions/notes'
import { updateClientProfile } from '@/actions/clients'

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

  const [{ data: assets }, { data: income }, { data: notes }] = await Promise.all([
    supabase.from('assets').select('id, label, amount').eq('owner_id', id).order('created_at'),
    supabase.from('income').select('id, source, amount').eq('owner_id', id).order('created_at'),
    supabase.from('notes').select('id, content, created_at').eq('client_id', id).order('created_at', { ascending: false }),
  ])

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
    />
  )
}
