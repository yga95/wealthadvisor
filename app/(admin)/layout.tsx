import TopBar from '@/components/TopBar'
import { requireRole } from '@/lib/auth/current-user'


// 2e garde derrière le proxy : rôle admin obligatoire.
export default async function Layout({ children }: { children: React.ReactNode }) {
  const me = await requireRole('admin')
  return (
    <>
      <TopBar me={me} />
      <div className="flex-1">{children}</div>
    </>
  )
}
