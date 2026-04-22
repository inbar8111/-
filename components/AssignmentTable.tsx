'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import PersonRow from './PersonRow'
import DateTimeInput from './DateTimeInput'
import type { PersonRowData, MissionAssignment, Personnel } from '@/lib/types'

interface Props {
  missionId: string
  missionName: string
  initialAssignments: (MissionAssignment & { personnel: Personnel })[]
  lastStartTime: string | null
}

function makeRow(overrides: Partial<PersonRowData> = {}): PersonRowData {
  return {
    rowId: Math.random().toString(36).slice(2),
    personnelId: null,
    first_name: '', last_name: '', personal_number: '', phone: '', role: '',
    isCommander: false, isValid: false,
    ...overrides,
  }
}

function toLocalDatetime(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function AssignmentTable({ missionId, missionName, initialAssignments, lastStartTime }: Props) {
  const router = useRouter()

  const [rows, setRows] = useState<PersonRowData[]>(() =>
    initialAssignments.length > 0
      ? initialAssignments.map(a => ({
          rowId: a.id,
          personnelId: a.personnel.id,
          first_name: a.personnel.first_name,
          last_name: a.personnel.last_name,
          personal_number: a.personnel.personal_number,
          phone: a.personnel.phone,
          role: a.personnel.role,
          isCommander: a.is_commander ?? false,
          isValid: true,
        }))
      : [makeRow(), makeRow(), makeRow()]
  )

  const [startTime, setStartTime] = useState(toLocalDatetime(lastStartTime))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const updateRow = useCallback((rowId: string, updated: PersonRowData) =>
    setRows(prev => prev.map(r => r.rowId === rowId ? updated : r)), [])

  const deleteRow = useCallback((rowId: string) =>
    setRows(prev => prev.filter(r => r.rowId !== rowId)), [])

  async function handleSave() {
    const validRows = rows.filter(r => r.isValid && r.personnelId)
    setSaving(true); setError(''); setSaved(false)
    try {
      const res = await fetch(`/api/missions/${missionId}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignments: validRows.map(r => ({ personnelId: r.personnelId, isCommander: r.isCommander })),
          mission_start_time: startTime ? new Date(startTime).toISOString() : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'שגיאה בשמירה'); return }
      setSaved(true)
      router.refresh()
    } catch { setError('שגיאת רשת') }
    finally { setSaving(false) }
  }

  const validCount = rows.filter(r => r.isValid).length

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-mil-text text-lg sm:text-xl font-bold">{missionName}</h2>
        <button onClick={() => router.push('/')} className="text-mil-muted hover:text-mil-text text-sm transition-colors">
          חזרה →
        </button>
      </div>

      <div className="bg-mil-card border border-mil-border rounded-lg">
        {/* Desktop header */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-mil-surface border-b border-mil-border text-mil-muted text-xs font-medium" dir="rtl">
          <div className="w-5"></div>
          <div className="w-24 text-right">מ"א</div>
          <div className="w-28 text-right">טלפון</div>
          <div className="w-24 text-right">שם פרטי</div>
          <div className="w-24 text-right">שם משפחה</div>
          <div className="w-24 text-right">תפקיד</div>
          <div className="w-16 text-right text-mil-warning">מפקד</div>
        </div>

        <div className="flex flex-col gap-2 p-3">
          {rows.map((row, idx) => (
            <PersonRow
              key={row.rowId}
              row={row}
              rowIndex={idx}
              onChange={updated => updateRow(row.rowId, updated)}
              onDelete={() => deleteRow(row.rowId)}
            />
          ))}
          {rows.length === 0 && (
            <p className="text-mil-muted text-sm text-center py-4">לחץ &quot;הוסף שורה&quot; להוספת חיילים.</p>
          )}
        </div>

        <div className="border-t border-mil-border px-3 py-2">
          <button onClick={() => setRows(prev => [...prev, makeRow()])}
            className="text-mil-primary hover:text-mil-accent text-sm font-medium transition-colors">
            + הוסף שורה
          </button>
        </div>
      </div>

      <div className="bg-mil-card border border-mil-border rounded-lg p-4 flex flex-col gap-3">
        <div className="flex items-start gap-3 flex-wrap">
          <label className="text-mil-text text-sm font-medium whitespace-nowrap pt-5">שעת עליה:</label>
          <DateTimeInput value={startTime} onChange={setStartTime} />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {saved && <p className="text-green-400 text-sm">✓ השיבוץ נשמר בהצלחה</p>}

        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-mil-muted text-sm">{validCount} חיילים מתוך {rows.length} שורות</span>
          <button
            onClick={handleSave}
            disabled={saving || validCount === 0}
            className="px-6 py-2 rounded bg-mil-primary hover:bg-mil-primary-hover text-white font-bold transition-colors disabled:opacity-50"
          >
            {saving ? 'שומר...' : 'אישור שיבוץ'}
          </button>
        </div>
      </div>
    </div>
  )
}
