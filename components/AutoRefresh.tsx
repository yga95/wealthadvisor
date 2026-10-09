'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Tant qu'une recommandation est en cours, recharge les données toutes les 2,5 s (§5.3).
export default function AutoRefresh({ every = 2500 }: { every?: number }) {
  const router = useRouter()
  useEffect(() => {
    const id = setInterval(() => router.refresh(), every)
    return () => clearInterval(id)
  }, [router, every])
  return null
}
