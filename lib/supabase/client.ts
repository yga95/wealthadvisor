import { createBrowserClient } from '@supabase/ssr'

// Client utilisé dans le navigateur (formulaires de connexion).
// Clé publique uniquement : tout passe par le RLS.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )
}
