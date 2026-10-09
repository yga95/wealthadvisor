import UserBar from '@/components/UserBar'
import { requireRole } from '@/lib/auth/current-user'

// 2e garde derrière le proxy : rôle advisor obligatoire.
export default async function Layout({ children }: { children: React.ReactNode }) {
  const me = await requireRole('advisor')
  return (
    <>
      <UserBar me={me} />
      {children}
    </>
  )
}
