// Répartition d'une recommandation : actions / obligations / liquidités.
const PARTS = [
  { key: 'actions', label: 'Equities', color: 'bg-pine' },
  { key: 'obligations', label: 'Bonds', color: 'bg-brass' },
  { key: 'liquidites', label: 'Cash', color: 'bg-line' },
] as const

export default function AllocationBar({
  actions, obligations, liquidites, size = 'md',
}: {
  actions: number; obligations: number; liquidites: number; size?: 'md' | 'lg'
}) {
  const values = { actions, obligations, liquidites }
  return (
    <div>
      <div
        className={`flex w-full overflow-hidden rounded-sm ${size === 'lg' ? 'h-4' : 'h-2.5'}`}
        role="img"
        aria-label={`Equities ${actions}%, bonds ${obligations}%, cash ${liquidites}%`}
      >
        {PARTS.map((p) => (
          <div key={p.key} className={p.color} style={{ width: `${values[p.key]}%` }} />
        ))}
      </div>
      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        {PARTS.map((p) => (
          <div key={p.key} className="flex items-center gap-2">
            <span className={`inline-block h-2.5 w-2.5 rounded-sm ${p.color}`} aria-hidden />
            <dt className="text-muted">{p.label}</dt>
            <dd className="money text-base">{values[p.key]}%</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
