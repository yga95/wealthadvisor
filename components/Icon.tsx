// Icônes au trait (24×24), héritent de la couleur du texte.
const PATHS = {
  users: 'M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM21 19v-1a4 4 0 0 0-3-3.87M15.5 3.13a3.5 3.5 0 0 1 0 6.75',
  wallet: 'M3 7.5A2.5 2.5 0 0 1 5.5 5H18a1 1 0 0 1 1 1v2M3 7.5V17a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-3M3 7.5A1.5 1.5 0 0 0 4.5 9H20a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a2 2 0 0 1 0-4h5',
  income: 'M12 3v18M17 7.5C17 5.6 14.8 4.5 12 4.5S7 5.6 7 7.5s2 2.7 5 3.2 5 1.4 5 3.3-2.2 3.5-5 3.5-5-1.4-5-3.3',
  note: 'M5 4h10l4 4v12H5zM15 4v4h4M8.5 12h7M8.5 15.5h5',
  gauge: 'M4 16a8 8 0 1 1 16 0M12 16l4-5',
  portfolio: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  shield: 'M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z',
  person: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20a7 7 0 0 1 14 0',
  alert: 'M12 8v5M12 16.5v.5M10.3 3.9 2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
} as const

export type IconName = keyof typeof PATHS

export default function Icon({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={PATHS[name]} />
    </svg>
  )
}
