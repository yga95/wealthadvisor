'use client'

// Bouton d'envoi qui demande une confirmation (actions irréversibles).
export default function ConfirmSubmit({ message, className, children }: {
  message: string; className?: string; children: React.ReactNode
}) {
  return (
    <button className={className} onClick={(e) => { if (!confirm(message)) e.preventDefault() }}>
      {children}
    </button>
  )
}
