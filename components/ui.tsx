import Icon, { type IconName } from '@/components/Icon'

// Petits éléments visuels partagés (aucune logique métier).

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('')
  const dim = size === 'lg' ? 'h-16 w-16 text-lg' : size === 'sm' ? 'h-9 w-9 text-[11px]' : 'h-11 w-11 text-sm'
  return (
    <span aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-champagne/25 via-s-cash/20 to-mint/20 font-display font-medium text-champagne ring-1 ring-edge ${dim}`}>
      {initials || '?'}
    </span>
  )
}

export function StatTile({
  label, value, hint, icon, accent = false,
}: {
  label: string; value: React.ReactNode; hint?: React.ReactNode; icon: IconName; accent?: boolean
}) {
  return (
    <div className="tile flex items-start gap-3">
      <span className={`mt-0.5 rounded-xl p-2 ${accent ? 'bg-champagne/15 text-champagne' : 'bg-white/5 text-muted'}`}>
        <Icon name={icon} />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-muted">{label}</p>
        <p className={`money mt-1 truncate text-xl ${accent ? 'text-champagne' : ''}`}>{value}</p>
        {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      </div>
    </div>
  )
}

const RISK_STEPS = ['cautious', 'balanced', 'dynamic'] as const
const RISK_NAME: Record<string, string> = { cautious: 'Cautious', balanced: 'Balanced', dynamic: 'Dynamic' }

function polar(cx: number, cy: number, r: number, deg: number) {
  const a = (deg * Math.PI) / 180
  return [cx + r * Math.cos(a), cy - r * Math.sin(a)] as const
}

// Cadran de risque : trois secteurs (prudent / équilibré / dynamique) et une aiguille.
export function RiskDial({ risk, size = 'md' }: { risk: string; size?: 'sm' | 'md' }) {
  const level = Math.max(0, RISK_STEPS.indexOf(risk as (typeof RISK_STEPS)[number]))
  const cx = 60, cy = 58, r = 46, gap = 5
  const arcs = RISK_STEPS.map((_, i) => {
    const start = 180 - i * 60 - (i === 0 ? 0 : gap / 2)
    const end = 180 - (i + 1) * 60 + (i === 2 ? 0 : gap / 2)
    const [x1, y1] = polar(cx, cy, r, start)
    const [x2, y2] = polar(cx, cy, r, end)
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`
  })
  const [nx, ny] = polar(cx, cy, r - 14, 150 - level * 60)
  return (
    <svg viewBox="0 0 120 66" className={size === 'sm' ? 'h-10 w-20' : 'h-24 w-44'}
      role="img" aria-label={`Risk profile: ${RISK_NAME[risk] ?? risk}, level ${level + 1} of 3`}>
      {arcs.map((d, i) => (
        <path key={i} d={d} fill="none" strokeWidth="9" strokeLinecap="round"
          stroke={i <= level ? '#ecd3a0' : 'rgb(255 255 255 / 0.1)'} opacity={i <= level ? 1 - (level - i) * 0.25 : 1} />
      ))}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#f3eef8" strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="5" fill="#f3eef8" />
    </svg>
  )
}
