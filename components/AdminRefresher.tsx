'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminRefresher() {
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 15000)
    return () => clearInterval(interval)
  }, [router])

  return (
    <button
      onClick={() => router.refresh()}
      className="fixed bottom-4 left-4 px-3 py-2 rounded bg-mil-surface border border-mil-border text-mil-muted hover:text-mil-text text-xs transition-colors z-30"
    >
      רענן ↻
    </button>
  )
}
