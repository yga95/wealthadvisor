import { signOut } from '@/actions/auth'
import type { CurrentUser } from '@/lib/auth/current-user'

export default function UserBar({ me }: { me: CurrentUser }) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 px-6 py-3">
      <span className="font-semibold">WealthAdvisor</span>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-600">
          {me.full_name} · <span className="font-medium">{me.role}</span>
        </span>
        <form action={signOut}>
          <button className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-100">
            Sign out
          </button>
        </form>
      </div>
    </header>
  )
}
