import ActionForm from '@/components/ActionForm'
import AutoRefresh from '@/components/AutoRefresh'
import { Ring, AllocationLegend, AllocationBar } from '@/components/AllocationRing'
import { shortDate } from '@/lib/format'
import type { ActionState } from '@/lib/validation/schemas'

type Act = (state: ActionState, formData: FormData) => Promise<ActionState>

export type RecoRow = {
  id: string
  status: 'generating' | 'done' | 'failed' | 'archived'
  pct_actions: number | null
  pct_obligations: number | null
  pct_liquidites: number | null
  explanation: string | null
  created_at: string
}

const STATUS_LABEL: Record<RecoRow['status'], string> = {
  generating: 'Generating', done: 'Shared with client', failed: 'Failed', archived: 'Archived',
}

// Panneau IA de la fiche client : les trois états du wireframe (défaut, génération, échec).
export default function AiPanel({
  clientId, recos, blockedReason, generate, archive,
}: {
  clientId: string; recos: RecoRow[]; blockedReason: string | null; generate: Act; archive: Act
}) {
  const latest = recos[0]
  const history = recos.slice(1)
  const busy = latest?.status === 'generating'

  return (
    <section className="panel panel-hero overflow-hidden px-5 py-5">
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-s-cash/25 blur-3xl" aria-hidden />

      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-title">AI recommendation</h2>
        {!busy && (
          <ActionForm action={generate}>
            <input type="hidden" name="client_id" value={clientId} />
            <button className="btn btn-primary px-3 py-1.5 text-xs" disabled={Boolean(blockedReason)}>
              {latest ? 'Generate a new one' : 'Generate recommendation'}
            </button>
          </ActionForm>
        )}
      </div>
      {blockedReason && !busy && <p className="relative mt-2 text-xs text-champagne">{blockedReason}</p>}

      <div className="relative mt-5">
        {!latest && (
          <p className="text-sm text-muted">
            No recommendation yet. The model reads the age, risk tolerance, assets and income above, then proposes an
            allocation you can share with the client.
          </p>
        )}

        {busy && (
          <div className="flex items-center gap-5" aria-live="polite">
            <AutoRefresh />
            <div className="h-24 w-24 shrink-0 animate-spin rounded-full border-[10px] border-white/10 border-t-champagne [animation-duration:1.6s]" aria-hidden />
            <div>
              <p className="font-medium">Drafting a recommendation…</p>
              <p className="mt-1 text-sm text-muted">This usually takes a few seconds. The page updates by itself.</p>
            </div>
          </div>
        )}

        {latest?.status === 'failed' && (
          <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm" role="alert">
            <p className="font-medium text-danger">The generation failed</p>
            <p className="mt-1 text-muted">
              The model did not return a valid allocation, so nothing was saved. Generate again to retry.
            </p>
          </div>
        )}

        {latest?.status === 'done' && latest.pct_actions != null && (
          <div>
            <div className="flex flex-wrap items-center gap-5">
              <Ring actions={latest.pct_actions} obligations={latest.pct_obligations!} liquidites={latest.pct_liquidites!}
                center={`${latest.pct_actions}%`} caption="equities" size={150} />
              <AllocationLegend vertical actions={latest.pct_actions} obligations={latest.pct_obligations!} liquidites={latest.pct_liquidites!} />
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink/90">{latest.explanation}</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
              <span>{shortDate(latest.created_at)}, visible to the client</span>
              <ActionForm action={archive}>
                <input type="hidden" name="id" value={latest.id} />
                <input type="hidden" name="client_id" value={clientId} />
                <button className="btn px-3 py-1 text-xs">Archive</button>
              </ActionForm>
            </div>
          </div>
        )}

        {latest?.status === 'archived' && (
          <p className="text-sm text-muted">The latest recommendation was archived. Generate a new one when ready.</p>
        )}
      </div>

      {history.length > 0 && (
        <div className="relative mt-6 border-t border-edge pt-4">
          <p className="text-xs text-muted">History</p>
          <ul className="mt-3 space-y-3">
            {history.map((r) => (
              <li key={r.id} className={`text-xs ${r.status === 'archived' ? 'opacity-55' : ''}`}>
                <div className="mb-1.5 flex justify-between text-muted">
                  <span>{shortDate(r.created_at)}</span>
                  <span>{STATUS_LABEL[r.status]}</span>
                </div>
                {r.pct_actions != null ? (
                  <AllocationBar actions={r.pct_actions} obligations={r.pct_obligations!} liquidites={r.pct_liquidites!} />
                ) : (
                  <div className="h-2.5 rounded-full border border-dashed border-edge" aria-hidden />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="relative mt-5 text-[11px] text-muted">
        Indicative simulation prepared with AI assistance. It is not regulated financial advice.
      </p>
    </section>
  )
}
