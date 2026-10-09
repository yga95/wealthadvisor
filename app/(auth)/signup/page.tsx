'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AuthShell from '@/components/AuthShell'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    // Seul full_name est envoyé : le rôle est forcé à 'client' par le trigger.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName.trim() } },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    if (data.session) {
      router.push('/')
      router.refresh()
    } else {
      setMessage('Account created. Confirm your email, then sign in.')
    }
  }

  return (
    <AuthShell title="Create an account">
      <form onSubmit={onSubmit} className="space-y-5">
        <label className="block text-sm font-medium">
          Full name
          <input required maxLength={120} autoComplete="name" value={fullName}
            onChange={(e) => setFullName(e.target.value)} className="field mt-1.5 w-full" />
        </label>
        <label className="block text-sm font-medium">
          Email
          <input type="email" required autoComplete="email" value={email}
            onChange={(e) => setEmail(e.target.value)} className="field mt-1.5 w-full" />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input type="password" required minLength={6} autoComplete="new-password" value={password}
            onChange={(e) => setPassword(e.target.value)} className="field mt-1.5 w-full" />
        </label>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        {message && <p className="text-sm text-pine">{message}</p>}
        <button disabled={loading} className="btn btn-primary w-full py-2.5">
          {loading ? 'Creating account…' : 'Create account'}
        </button>
        <p className="text-sm text-muted">
          Already registered? <Link href="/login" className="text-pine underline underline-offset-4">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  )
}
