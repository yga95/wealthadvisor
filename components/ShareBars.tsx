import { eur } from '@/lib/format'

// Poids de chaque ligne dans le total (une seule série, une seule teinte).
export default function ShareBars({ rows }: { rows: { id: string; name: string; amount: number }[] }) {
  const total = rows.reduce((s, r) => s + Number(r.amount), 0)
  const sorted = [...rows].sort((a, b) => Number(b.amount) - Number(a.amount))
  if (total <= 0) return <p className="text-sm text-muted">Add assets to see how the portfolio is split.</p>
  return (
    <ul className="space-y-3.5">
      {sorted.map((r) => {
        const pct = (Number(r.amount) / total) * 100
        return (
          <li key={r.id} title={`${r.name}: ${eur.format(Number(r.amount))} (${pct.toFixed(1)}%)`}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate">{r.name}</span>
              <span className="shrink-0 text-muted tabular-nums">{pct.toFixed(0)}%</span>
            </div>
            <div className="mt-1.5 h-2 rounded-full bg-white/5">
              <div className="h-full rounded-full bg-lilac" style={{ width: `${Math.max(pct, 1.5)}%` }} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
