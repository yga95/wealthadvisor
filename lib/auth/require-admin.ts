import 'server-only'
import { createClient } from '@/lib/supabase/server'

// Vérification faite AVANT chaque appel service role (Design Rev. 3, §2.8).
// getUser() valide le jeton auprès du serveur Auth (pas une simple lecture du cookie),
// puis le rôle est relu en base. Renvoie l'id de l'admin, ou null.
export async function requireAdmin(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: role } = await supabase.rpc('auth_role')
  return role === 'admin' ? user.id : null
}
