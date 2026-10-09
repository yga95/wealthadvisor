import Link from 'next/link'
import { signOut } from '@/actions/auth'
import Icon, { type IconName } from '@/components/Icon'
import NavLinks from '@/components/NavLinks'
import { Avatar } from '@/components/ui'
import type { CurrentUser } from '@/lib/auth/current-user'

type Role = CurrentUser['role']

const NAV: Record<Role, { href: string; label: string; icon: IconName }> = {
  admin: { href: '/admin/users', label: 'Users', icon: 'users' },
  advisor: { href: '/clients', label: 'Clients', icon: 'users' },
  client: { href: '/portal', label: 'My portfolio', icon: 'portfolio' },
}

const PROFILE = { href: '/profile', label: 'Profile', icon: 'person' as IconName }

const ROLE_LABEL: Record<Role, string> = { admin: 'Administrator', advisor: 'Advisor', client: 'Client' }

// Ce que le rôle peut voir : rappel visible du contrôle d'accès (RLS).
const ACCESS_NOTE: Record<Role, string> = {
  admin: 'You manage accounts and roles. Financial data stays hidden from this role.',
  advisor: 'You only see the clients assigned to you. Your notes stay private.',
  client: 'Only you and your advisor can see this information.',
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden>
        <circle cx="15" cy="15" r="11" fill="none" stroke="#2ca487" strokeWidth="4" strokeDasharray="38 100" transform="rotate(-90 15 15)" strokeLinecap="round" />
        <circle cx="15" cy="15" r="11" fill="none" stroke="#b38c3a" strokeWidth="4" strokeDasharray="18 100" strokeDashoffset="-42" transform="rotate(-90 15 15)" strokeLinecap="round" />
        <circle cx="15" cy="15" r="11" fill="none" stroke="#b95e98" strokeWidth="4" strokeDasharray="5 100" strokeDashoffset="-64" transform="rotate(-90 15 15)" strokeLinecap="round" />
      </svg>
      {!compact && <span className="font-display text-[15px] font-medium tracking-tight">WealthAdvisor</span>}
    </span>
  )
}

export default function AppShell({ me, children }: { me: CurrentUser; children: React.ReactNode }) {
  const nav = NAV[me.role]
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
      {/* Barre latérale (écrans larges) */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-edge bg-night/50 p-5 backdrop-blur-xl lg:flex">
        <Link href={nav.href} className="px-2 py-1"><Logo /></Link>

        <nav className="mt-10 space-y-1 text-sm">
          <NavLinks items={[nav, PROFILE]} />
        </nav>

        <div className="mt-8 rounded-2xl border border-edge bg-white/[0.03] p-4 text-xs leading-relaxed text-muted">
          <p className="mb-1.5 flex items-center gap-2 font-medium text-ink">
            <Icon name="shield" className="h-4 w-4 text-mint" />
            Your access
          </p>
          {ACCESS_NOTE[me.role]}
        </div>

        <div className="mt-auto rounded-2xl border border-edge bg-white/[0.03] p-3">
          <div className="flex items-center gap-3">
            <Avatar name={me.full_name} size="sm" />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm">{me.full_name}</p>
              <p className="text-xs text-muted">{ROLE_LABEL[me.role]}</p>
            </div>
          </div>
          <form action={signOut} className="mt-3">
            <button className="btn w-full py-1.5 text-xs">Sign out</button>
          </form>
        </div>
      </aside>

      {/* En-tête (mobile et tablette) */}
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-edge bg-night/80 px-5 py-3 backdrop-blur-xl lg:hidden">
        <Link href={nav.href}><Logo compact /></Link>
        <nav className="flex gap-1"><NavLinks compact items={[nav, PROFILE]} /></nav>
        <div className="ml-auto flex items-center gap-2">
          <Avatar name={me.full_name} size="sm" />
          <form action={signOut}><button className="btn px-3 py-1.5 text-xs">Sign out</button></form>
        </div>
      </header>

      <div className="min-w-0">{children}</div>
    </div>
  )
}
