import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type Role = 'admin' | 'advisor' | 'client'
export type CurrentUser = { id: string; full_name: string; role: Role }

// Utilisateur connecté + son rôle lu en base (RLS : il lit sa propre ligne).
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const id = data?.claims?.sub
  if (!id) return null

  const { data: me } = await supabase
    .from('users')
    .select('id, full_name, role')
    .eq('id', id)
    .single()
  return (me as CurrentUser) ?? null
}

// 2e garde (Design Rev. 3, §3.1) : utilisée par chaque layout de rôle.
export async function requireRole(role: Role): Promise<CurrentUser> {
  const me = await getCurrentUser()
  if (!me) redirect('/login')
  if (me.role !== role) redirect('/')
  return me
}
