'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Mission } from '@/lib/types'

interface Props {
  missions: Mission[]
  onOrderSaved: (missions: Mission[]) => void
  onClose: () => void
}

function SortableItem({ mission, index, onEditName }: {
  mission: Mission
  index: number
  onEditName: (id: string, name: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: mission.id })
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(mission.name)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 bg-mil-surface border rounded-lg px-3 py-2.5 ${isDragging ? 'border-mil-primary shadow-lg' : 'border-mil-border'}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-mil-muted hover:text-mil-text cursor-grab active:cursor-grabbing touch-none select-none flex-shrink-0 p-1"
        aria-label="גרור לשינוי סדר"
      >
        ⣿
      </button>

      <span className="text-mil-muted text-sm font-mono w-5 flex-shrink-0">{index + 1}</span>

      {editing ? (
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onBlur={() => { onEditName(mission.id, name); setEditing(false) }}
          onKeyDown={e => { if (e.key === 'Enter') { onEditName(mission.id, name); setEditing(false) } if (e.key === 'Escape') { setName(mission.name); setEditing(false) } }}
          className="flex-1 bg-mil-card border border-mil-primary text-mil-text rounded px-2 py-1 text-sm focus:outline-none"
          autoFocus
          dir="rtl"
        />
      ) : (
        <span className="flex-1 text-mil-text text-sm font-medium text-right">{name}</span>
      )}

      <button
        onClick={() => setEditing(true)}
        className="text-mil-muted hover:text-mil-accent text-xs transition-colors flex-shrink-0"
      >
        ✏️
      </button>

      {mission.is_fixed && (
        <span className="text-mil-muted text-xs flex-shrink-0">קבועה</span>
      )}
    </div>
  )
}

export default function MissionOrderManager({ missions: initialMissions, onOrderSaved, onClose }: Props) {
  const [missions, setMissions] = useState(initialMissions)
  const [nameOverrides, setNameOverrides] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setMissions(prev => {
      const oldIdx = prev.findIndex(m => m.id === active.id)
      const newIdx = prev.findIndex(m => m.id === over.id)
      return arrayMove(prev, oldIdx, newIdx)
    })
  }

  const handleEditName = useCallback((id: string, name: string) => {
    setNameOverrides(prev => ({ ...prev, [id]: name }))
    setMissions(prev => prev.map(m => m.id === id ? { ...m, name } : m))
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await Promise.all(
        missions.map((m, i) =>
          fetch(`/api/missions/${m.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              display_order: i + 1,
              ...(nameOverrides[m.id] !== undefined ? { name: nameOverrides[m.id] } : {}),
            }),
          })
        )
      )
      onOrderSaved(missions.map((m, i) => ({ ...m, display_order: i + 1 })))
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-mil-card border border-mil-border rounded-t-2xl sm:rounded-xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-mil-border" dir="rtl">
          <h2 className="text-mil-text font-bold text-lg">סדר וניהול משימות</h2>
          <button onClick={onClose} className="text-mil-muted hover:text-mil-text text-xl">✕</button>
        </div>

        <p className="text-mil-muted text-xs px-4 pt-2 text-right">גרור ⣿ לשינוי סדר | לחץ ✏️ לעריכת שם</p>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={missions.map(m => m.id)} strategy={verticalListSortingStrategy}>
              {missions.map((m, i) => (
                <SortableItem key={m.id} mission={m} index={i} onEditName={handleEditName} />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <div className="border-t border-mil-border p-3 flex gap-2 justify-end" dir="rtl">
          <button onClick={onClose} className="px-4 py-2 rounded border border-mil-border text-mil-muted text-sm hover:bg-mil-surface">
            ביטול
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded bg-mil-primary text-white font-bold text-sm disabled:opacity-50"
          >
            {saving ? 'שומר...' : 'שמור סדר ושמות'}
          </button>
        </div>
      </div>
    </div>
  )
}
