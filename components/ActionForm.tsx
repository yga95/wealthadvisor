'use client'

import { useActionState } from 'react'
import type { ActionState } from '@/lib/validation/schemas'

// Formulaire qui appelle une action serveur et affiche son erreur éventuelle.
export default function ActionForm({
  action,
  children,
  className,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>
  children: React.ReactNode
  className?: string
}) {
  const [state, formAction, pending] = useActionState(action, undefined)
  return (
    <form action={formAction} className={className}>
      <fieldset disabled={pending} className="contents">
        {children}
      </fieldset>
      {state?.error && <p className="basis-full text-sm text-red-600">{state.error}</p>}
    </form>
  )
}
