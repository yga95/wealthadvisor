import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type Role = 'admin' | 'advisor' | 'client'

// Page d'accueil de chaque rôle (Design Rev. 3, §3.1)
const HOME: Record<Role, string> = {
  admin: '/admin/users',
  advisor: '/clients',
  client: '/portal',
}

// Préfixe d'URL réelle -> seul rôle autorisé
const ROLE_PREFIXES: { prefix: string; role: Role }[] = [
  { prefix: '/admin', role: 'admin' },
  { prefix: '/clients', role: 'advisor' },
  { prefix: '/portal', role: 'client' },
]

const PUBLIC_PATHS = ['/login', '/signup']

function matches(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(prefix + '/')
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Vérifie la signature du jeton et le rafraîchit si besoin.
  // Jamais getSession() ici : elle ne vérifie rien.
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub

  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some((p) => matches(pathname, p))

  // Redirection qui garde les cookies de session rafraîchis
  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone()
    url.pathname = path
    url.search = ''
    const redirect = NextResponse.redirect(url)
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c))
    return redirect
  }

  // 1. Pas connecté : seules /login et /signup sont accessibles
  if (!userId) {
    return isPublic ? response : redirectTo('/login')
  }

  // 2. Connecté : rôle lu en base, en direct (fonction auth_role, §2.4)
  const { data: role } = await supabase.rpc('auth_role')
  if (!role) {
    return isPublic ? response : redirectTo('/login')
  }
  const home = HOME[role as Role]

  // 3. Déjà connecté sur /login, /signup ou / : direction sa page d'accueil
  if (isPublic || pathname === '/') {
    return redirectTo(home)
  }

  // 4. Mauvais rôle pour cette URL : renvoyé chez lui, sans message d'erreur
  const rule = ROLE_PREFIXES.find((r) => matches(pathname, r.prefix))
  if (rule && rule.role !== role) {
    return redirectTo(home)
  }

  // /profile et le reste : tout utilisateur connecté
  return response
}
