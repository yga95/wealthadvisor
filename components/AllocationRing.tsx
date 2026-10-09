// Anneau d'allocation (actions / obligations / liquidités), avec légende écrite.
const PARTS = [
  { key: 'actions', label: 'Equities', color: '#2ca487', dot: 'bg-s-equities' },
  { key: 'obligations', label: 'Bonds', color: '#b38c3a', dot: 'bg-s-bonds' },
  { key: 'liquidites', label: 'Cash', color: '#b95e98', dot: 'bg-s-cash' },
] as const

export function Ring({
  actions, obligations, liquidites, center, caption, size = 220,
}: {
  actions: number; obligations: number; liquidites: number
  center?: string; caption?: string; size?: number
}) {
  const values = { actions, obligations, liquidites }
  const r = 80
  const c = 2 * Math.PI * r
  const gap = 6
  let offset = 0
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} role="img"
      aria-label={`Equities ${actions}%, bonds ${obligations}%, cash ${liquidites}%`}>
      <circle cx="100" cy="100" r={r} fill="none" stroke="rgb(255 255 255 / 0.06)" strokeWidth="18" />
      {PARTS.map((p, i) => {
        const pct = values[p.key] / 100
        const len = Math.max(pct * c - gap, 0)
        const start = offset
        offset += pct * c
        if (len === 0) return null
        return (
          <circle key={p.key} cx="100" cy="100" r={r} fill="none" stroke={p.color} strokeWidth="18"
            strokeLinecap="round" strokeDasharray={`${len} ${c}`} strokeDashoffset={-start}
            transform="rotate(-90 100 100)" className="ring-draw"
            style={{ ['--from' as string]: `${len - start}`, animationDelay: `${i * 0.12}s` }}>
            <title>{`${p.label}: ${values[p.key]}%`}</title>
          </circle>
        )
      })}
      {center && (
        <text x="100" y={caption ? 102 : 110} textAnchor="middle" fill="#f3eef8" fontSize="30"
          fontFamily="var(--font-unbounded)">{center}</text>
      )}
      {caption && (
        <text x="100" y="128" textAnchor="middle" fill="#ab9dc0" fontSize="12"
          fontFamily="var(--font-geist-sans)">{caption}</text>
      )}
    </svg>
  )
}

export function AllocationLegend({
  actions, obligations, liquidites, vertical = false,
}: { actions: number; obligations: number; liquidites: number; vertical?: boolean }) {
  const values = { actions, obligations, liquidites }
  return (
    <dl className={vertical ? 'space-y-4' : 'grid grid-cols-3 gap-4'}>
      {PARTS.map((p) => (
        <div key={p.key}>
          <dt className="flex items-center gap-2 text-sm text-muted">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${p.dot}`} aria-hidden />
            {p.label}
          </dt>
          <dd className="money mt-1 text-2xl">{values[p.key]}%</dd>
        </div>
      ))}
    </dl>
  )
}

// Version compacte en barre (historique).
export function AllocationBar({ actions, obligations, liquidites }: { actions: number; obligations: number; liquidites: number }) {
  const values = { actions, obligations, liquidites }
  return (
    <div className="flex h-2.5 w-full gap-[2px]" role="img"
      aria-label={`Equities ${actions}%, bonds ${obligations}%, cash ${liquidites}%`}>
      {PARTS.filter((p) => values[p.key] > 0).map((p) => (
        <div key={p.key} title={`${p.label}: ${values[p.key]}%`}
          className={`${p.dot} rounded first:rounded-l-full last:rounded-r-full`} style={{ width: `${values[p.key]}%` }} />
      ))}
    </div>
  )
}
