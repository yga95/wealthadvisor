'use server'

import { after } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { draftRecommendation, type RecommendationInput } from '@/lib/ai/recommend'
import { generateSchema, archiveSchema, firstError, type ActionState } from '@/lib/validation/schemas'

// Génération asynchrone (Design Rev. 3, §5.3) :
// 1. lectures et INSERT 'generating' avec la session du conseiller (RLS, politique 19) ;
// 2. réponse immédiate ; l'appel au modèle continue dans after() ;
// 3. seule l'écriture finale passe par le service role, sur l'id créé ici (§2.8).
export async function generateRecommendation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = generateSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: firstError(parsed.error) }
  const clientId = parsed.data.client_id

  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  const advisorId = auth?.claims?.sub
  if (!advisorId) return { error: 'Not signed in.' }

  const [{ data: client }, { data: assets }, { data: income }, { data: history }] = await Promise.all([
    supabase.from('users').select('age, risk_tolerance').eq('id', clientId).maybeSingle(),
    supabase.from('assets').select('label, amount').eq('owner_id', clientId),
    supabase.from('income').select('source, amount').eq('owner_id', clientId),
    supabase.from('recommendations').select('pct_actions, pct_obligations, pct_liquidites')
      .eq('client_id', clientId).eq('status', 'done').order('created_at', { ascending: false }).limit(3),
  ])
  if (!client) return { error: 'Not allowed.' }

  // Contrôle des entrées AVANT tout appel : jamais de NULL envoyé au modèle (§5.4).
  if (client.age == null) return { error: "Add the client's age before generating a recommendation." }
  if (!assets?.length && !income?.length) return { error: 'Record at least one asset or income line first.' }

  const input: RecommendationInput = {
    age: client.age,
    risk_tolerance: client.risk_tolerance,
    assets: (assets ?? []).map((a) => ({ label: a.label, amount: Number(a.amount) })),
    income: (income ?? []).map((i) => ({ source: i.source, amount: Number(i.amount) })),
    previous_allocations: (history ?? []).map((h) => ({
      actions: h.pct_actions, obligations: h.pct_obligations, liquidites: h.pct_liquidites,
    })),
  }

  const { data: row, error } = await supabase
    .from('recommendations')
    .insert({ client_id: clientId, created_by: advisorId, status: 'generating' })
    .select('id')
    .single()
  if (error || !row) return { error: error?.message ?? 'Could not start the generation.' }
  const recoId: string = row.id

  after(async () => {
    const admin = createAdminClient()
    try {
      const out = await draftRecommendation(input)
      await admin.from('recommendations')
        .update({
          pct_actions: out.allocation.actions,
          pct_obligations: out.allocation.obligations,
          pct_liquidites: out.allocation.liquidites,
          explanation: out.explanation,
          status: 'done',
        })
        .eq('id', recoId)
        .eq('status', 'generating')
    } catch (e) {
      console.error('Recommendation failed', recoId, e)
      await admin.from('recommendations').update({ status: 'failed' })
        .eq('id', recoId).eq('status', 'generating')
    }
  })

  revalidatePath(`/clients/${clientId}`)
  return {}
}

// Archivage : session du conseiller, politique 20 + trigger guard_reco_update (done -> archived).
export async function archiveRecommendation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = archiveSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: firstError(parsed.error) }
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('recommendations')
    .update({ status: 'archived' })
    .eq('id', parsed.data.id)
    .select('id')
  if (error) return { error: error.message }
  if (!data?.length) return { error: 'Not allowed.' }
  revalidatePath(`/clients/${parsed.data.client_id}`)
  return {}
}
