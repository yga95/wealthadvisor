import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

// Anciennement middleware.ts (renommé proxy.ts depuis Next.js 16).
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  // Toutes les URL sauf les fichiers statiques et les images
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
