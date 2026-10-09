import AppShell from '@/components/AppShell'
import { requireRole } from '@/lib/auth/current-user'

// 2e garde derrière le proxy : rôle client obligatoire.
export default async function Layout({ children }: { children: React.ReactNode }) {
  const me = await requireRole('client')
  return <AppShell me={me}>{children}</AppShell>
}
