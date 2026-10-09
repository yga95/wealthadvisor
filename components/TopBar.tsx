import Link from 'next/link'
import { signOut } from '@/actions/auth'
import type { CurrentUser } from '@/lib/auth/current-user'

const NAV: Record<CurrentUser['role'], { href: string; label: string }> = {
  admin: { href: '/admin/users', label: 'Users' },
  advisor: { href: '/clients', label: 'Clients' },
  client: { href: '/portal', label: 'My portfolio' },
}

const ROLE_LABEL: Record<CurrentUser['role'], string> = {
  admin: 'Administrator',
  advisor: 'Advisor',
  client: 'Client',
}

export default function TopBar({ me }: { me: CurrentUser }) {
  const nav = NAV[me.role]
  return (
    <header className="bg-pine text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-2 px-6 py-3">
        <Link href={nav.href} className="font-display text-xl tracking-tight">
          WealthAdvisor
        </Link>
        <nav className="text-sm">
          <Link href={nav.href} className="border-b-2 border-brass pb-1">
            {nav.label}
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-4 text-sm">
          <span className="text-right leading-tight">
            <span className="block">{me.full_name}</span>
            <span className="block text-xs text-white/65">{ROLE_LABEL[me.role]}</span>
          </span>
          <form action={signOut}>
            <button className="rounded border border-white/30 px-3 py-1.5 hover:border-white">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
