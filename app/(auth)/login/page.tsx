'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AuthShell from '@/components/AuthShell'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    // Le proxy redirige vers la page d'accueil du rôle.
    router.push('/')
    router.refresh()
  }

  return (
    <AuthShell title="Sign in">
      <form onSubmit={onSubmit} className="space-y-5">
        <label className="block text-sm font-medium">
          Email
          <input type="email" required autoComplete="email" value={email}
            onChange={(e) => setEmail(e.target.value)} className="field mt-1.5 w-full" />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input type="password" required autoComplete="current-password" value={password}
            onChange={(e) => setPassword(e.target.value)} className="field mt-1.5 w-full" />
        </label>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        <button disabled={loading} className="btn btn-primary w-full py-2.5">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="text-sm text-muted">
          New client? <Link href="/signup" className="text-pine underline underline-offset-4">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  )
}
