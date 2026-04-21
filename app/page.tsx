'use client'

import { useState, useEffect, useCallback } from 'react'
import MissionCard from '@/components/MissionCard'
import AddMissionModal from '@/components/AddMissionModal'
import type { Mission, MissionReset } from '@/lib/types'

interface MissionSummary extends Mission {
  assignmentCount: number
  lastReset: MissionReset | null
}

export default function HomePage() {
  const [missions, setMissions] = useState<MissionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/missions/summary')
      const data = await res.json()
      if (Array.isArray(data)) setMissions(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  function handleAdded(mission: Mission) {
    setMissions(prev => [...prev, { ...mission, assignmentCount: 0, lastReset: null }])
  }

  function handleDeleted(id: string) {
    setMissions(prev => prev.filter(m => m.id !== id))
  }

  function handleReset(id: string) {
    setMissions(prev => prev.map(m =>
      m.id === id
        ? { ...m, assignmentCount: 0, lastReset: { id: '', mission_id: id, reset_at: new Date().toISOString() } }
        : m
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-mil-muted text-lg animate-pulse">טוען משימות...</div>
      </div>
    )
  }

  const fixed = missions.filter(m => m.is_fixed)
  const custom = missions.filter(m => !m.is_fixed)

  return (
    <div className="flex flex-col gap-6 py-4" dir="rtl">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 rounded border border-mil-primary text-mil-primary hover:bg-mil-primary hover:text-white transition-colors text-sm font-medium"
        >
          + הוסף משימה
        </button>
        <h1 className="text-2xl font-bold text-mil-text">בחר משימה</h1>
      </div>

      <section>
        <h2 className="text-mil-muted text-xs font-medium mb-3 tracking-widest uppercase text-right">משימות קבועות</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {fixed.map(m => (
            <MissionCard
              key={m.id}
              mission={m}
              assignmentCount={m.assignmentCount}
              lastReset={m.lastReset}
              onReset={handleReset}
            />
          ))}
        </div>
      </section>

      {custom.length > 0 && (
        <section>
          <h2 className="text-mil-muted text-xs font-medium mb-3 tracking-widest uppercase text-right">משימות נוספות</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {custom.map(m => (
              <MissionCard
                key={m.id}
                mission={m}
                assignmentCount={m.assignmentCount}
                lastReset={m.lastReset}
                onDeleted={handleDeleted}
                onReset={handleReset}
              />
            ))}
          </div>
        </section>
      )}

      {showAdd && (
        <AddMissionModal
          onClose={() => setShowAdd(false)}
          onAdded={handleAdded}
        />
      )}
    </div>
  )
}
