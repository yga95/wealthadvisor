'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icon, { type IconName } from '@/components/Icon'

export type NavItem = { href: string; label: string; icon: IconName }

// Liens de navigation ; celui de la page courante est mis en avant.
export default function NavLinks({ items, compact = false }: { items: NavItem[]; compact?: boolean }) {
  const pathname = usePathname()
  return (
    <>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return compact ? (
          <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined}
            className={`rounded-full px-3 py-1 text-sm ${active ? 'bg-champagne/15 text-champagne' : 'text-muted hover:text-ink'}`}>
            {item.label}
          </Link>
        ) : (
          <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${active
              ? 'bg-gradient-to-r from-champagne/15 to-transparent text-champagne ring-1 ring-champagne/20'
              : 'text-muted hover:bg-white/[0.03] hover:text-ink'}`}>
            <Icon name={item.icon} className="h-[18px] w-[18px]" />
            {item.label}
          </Link>
        )
      })}
    </>
  )
}
