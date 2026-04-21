'use client'

import { useState } from 'react'
import type { Mission } from '@/lib/types'

interface Props {
  onClose: () => void
  onAdded: (mission: Mission) => void
}

export default function AddMissionModal({ onClose, onAdded }: Props) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'שגיאה'); return }
      onAdded(data)
      onClose()
    } catch {
      setError('שגיאת רשת')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div className="bg-mil-card border border-mil-border rounded-lg p-6 w-full max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-mil-text text-xl font-bold mb-4 text-right">הוספת משימה</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="שם המשימה"
            className="bg-mil-surface border border-mil-border text-mil-text rounded px-3 py-2 text-right focus:outline-none focus:border-mil-primary"
            autoFocus
            dir="rtl"
          />
          {error && <p className="text-red-400 text-sm text-right">{error}</p>}
          <div className="flex gap-2 justify-end mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-mil-border text-mil-muted hover:bg-mil-surface transition-colors"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-4 py-2 rounded bg-mil-primary text-white hover:bg-mil-primary-hover transition-colors disabled:opacity-50"
            >
              {loading ? 'מוסיף...' : 'הוסף'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
