import 'server-only'
import { createClient } from '@supabase/supabase-js'

// SERVICE ROLE : contourne le RLS. 'server-only' empêche tout import côté navigateur.
// Utilisé UNIQUEMENT après requireAdmin(), ou pour finaliser une recommandation IA
// (Design Rev. 3, §2.7 et §2.8).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}
