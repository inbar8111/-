'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Mission, MissionReset } from '@/lib/types'

interface Props {
  mission: Mission
  orderNum?: number
  assignmentCount: number
  lastReset: MissionReset | null
  onDeleted?: (id: string) => void
  onReset?: (id: string) => void
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('he-IL', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function MissionCard({ mission, orderNum, assignmentCount, lastReset, onDeleted, onReset }: Props) {
  const router = useRouter()
  const [resetting, setResetting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleReset() {
    setResetting(true)
    try {
      const res = await fetch(`/api/missions/${mission.id}/reset`, { method: 'POST' })
      if (res.ok) onReset?.(mission.id)
    } finally {
      setResetting(false)
      setConfirmReset(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/missions/${mission.id}`, { method: 'DELETE' })
      if (res.ok) onDeleted?.(mission.id)
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className="bg-mil-card border border-mil-border rounded-lg p-4 flex flex-col gap-3 hover:border-mil-primary/60 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col items-end flex-1">
          <div className="flex items-center gap-2">
            {orderNum && <span className="text-mil-muted text-xs font-mono">{orderNum}</span>}
            <h3 className="text-mil-text font-bold text-lg leading-tight">{mission.name}</h3>
          </div>
          <span className={`text-sm mt-1 ${assignmentCount > 0 ? 'text-mil-accent' : 'text-mil-muted'}`}>
            {assignmentCount > 0 ? `${assignmentCount} משובצים` : 'אין משובצים'}
          </span>
          {lastReset && (
            <span className="text-xs text-mil-muted mt-1">
              איפוס: {formatDate(lastReset.reset_at)}
            </span>
          )}
        </div>
        {!mission.is_fixed && (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-mil-muted hover:text-red-400 text-lg leading-none p-1 transition-colors"
            title="מחק משימה"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => router.push(`/mission/${mission.id}`)}
          className="flex-1 py-2 rounded bg-mil-primary hover:bg-mil-primary-hover text-white font-medium transition-colors text-sm"
        >
          שיבוץ / צפייה
        </button>
        <button
          onClick={() => setConfirmReset(true)}
          className="px-3 py-2 rounded border border-mil-warning/60 text-mil-warning hover:bg-mil-warning/10 transition-colors text-sm"
          title="איפוס משימה"
        >
          איפוס
        </button>
      </div>

      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setConfirmReset(false)}>
          <div className="bg-mil-card border border-mil-border rounded-lg p-5 max-w-xs w-full mx-4" onClick={e => e.stopPropagation()}>
            <p className="text-mil-text text-right mb-4">
              לאפס את משימה <strong>{mission.name}</strong>?<br />
              <span className="text-mil-muted text-sm">כל המשובצים יוסרו והאיפוס יתועד.</span>
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmReset(false)} className="px-3 py-1.5 rounded border border-mil-border text-mil-muted hover:bg-mil-surface text-sm">ביטול</button>
              <button onClick={handleReset} disabled={resetting} className="px-3 py-1.5 rounded bg-mil-warning text-black font-medium text-sm disabled:opacity-50">
                {resetting ? 'מאפס...' : 'אפס'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setConfirmDelete(false)}>
          <div className="bg-mil-card border border-mil-border rounded-lg p-5 max-w-xs w-full mx-4" onClick={e => e.stopPropagation()}>
            <p className="text-mil-text text-right mb-4">
              למחוק את משימה <strong>{mission.name}</strong>?<br />
              <span className="text-mil-muted text-sm">פעולה בלתי הפיכה.</span>
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 rounded border border-mil-border text-mil-muted hover:bg-mil-surface text-sm">ביטול</button>
              <button onClick={handleDelete} disabled={deleting} className="px-3 py-1.5 rounded bg-red-600 text-white font-medium text-sm disabled:opacity-50">
                {deleting ? 'מוחק...' : 'מחק'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
