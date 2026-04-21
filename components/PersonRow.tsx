'use client'

import { useState, useRef, useEffect } from 'react'
import type { Personnel, PersonRowData } from '@/lib/types'

interface Props {
  row: PersonRowData
  rowIndex: number
  onChange: (updated: PersonRowData) => void
  onDelete: () => void
}

type SearchField = 'first_name' | 'last_name' | 'personal_number' | 'phone'

export default function PersonRow({ row, rowIndex, onChange, onDelete }: Props) {
  const [suggestions, setSuggestions] = useState<Personnel[]>([])
  const [activeField, setActiveField] = useState<SearchField | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const rowRef = useRef(row)
  const onChangeRef = useRef(onChange)

  useEffect(() => { rowRef.current = row })
  useEffect(() => { onChangeRef.current = onChange })

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSuggestions([])
        setActiveField(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function fillFromPersonnel(p: Personnel) {
    onChangeRef.current({
      ...rowRef.current,
      personnelId: p.id,
      first_name: p.first_name,
      last_name: p.last_name,
      personal_number: p.personal_number,
      phone: p.phone,
      role: p.role,
      isValid: true,
    })
    setSuggestions([])
    setActiveField(null)
  }

  function doSearch(field: SearchField, q: string) {
    clearTimeout(timerRef.current)
    if (q.length < 2) { setSuggestions([]); return }
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/personnel/search?field=${field}&q=${encodeURIComponent(q)}`)
        const data: Personnel[] = await res.json()
        setSuggestions(data)
        if ((field === 'personal_number' || field === 'phone') && data.length === 1) {
          fillFromPersonnel(data[0])
        }
      } catch {
        setSuggestions([])
      }
    }, 300)
  }

  function handleFieldChange(field: SearchField, value: string) {
    onChangeRef.current({ ...rowRef.current, [field]: value, personnelId: null, isValid: false })
    setActiveField(field)
    doSearch(field, value)
  }

  const inputClass = 'bg-mil-surface border border-mil-border text-mil-text text-sm rounded px-2 py-1.5 w-full text-right focus:outline-none focus:border-mil-primary placeholder:text-mil-muted'

  const fields: { key: SearchField; placeholder: string; width: string }[] = [
    { key: 'personal_number', placeholder: 'מ"א', width: 'w-24' },
    { key: 'phone', placeholder: 'טלפון', width: 'w-28' },
    { key: 'first_name', placeholder: 'שם פרטי', width: 'w-24' },
    { key: 'last_name', placeholder: 'שם משפחה', width: 'w-24' },
  ]

  return (
    <div className="flex items-center gap-2 relative" ref={dropdownRef} dir="rtl">
      {/* Row number */}
      <div className="w-6 text-center text-mil-muted text-xs flex-shrink-0">{rowIndex + 1}</div>

      {fields.map(({ key, placeholder, width }) => (
        <div key={key} className={`relative ${width} flex-shrink-0`}>
          <input
            type="text"
            value={row[key]}
            onChange={e => handleFieldChange(key, e.target.value)}
            placeholder={placeholder}
            className={inputClass}
            dir="rtl"
          />
          {activeField === key && suggestions.length > 0 && (
            <div className="absolute top-full right-0 z-30 mt-1 bg-mil-card border border-mil-border rounded shadow-xl min-w-[220px] max-h-48 overflow-y-auto">
              {suggestions.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onMouseDown={() => fillFromPersonnel(p)}
                  className="w-full text-right px-3 py-2 text-sm text-mil-text hover:bg-mil-primary/20 border-b border-mil-border/40 last:border-0"
                >
                  <div className="font-medium">{p.first_name} {p.last_name}</div>
                  <div className="text-mil-muted text-xs">{p.personal_number} • {p.phone} • {p.role}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="w-24 flex-shrink-0">
        <input
          type="text"
          value={row.role}
          onChange={e => onChangeRef.current({ ...rowRef.current, role: e.target.value })}
          placeholder="תפקיד"
          className={inputClass}
          dir="rtl"
        />
      </div>

      {/* Commander toggle */}
      <div className="w-16 flex-shrink-0 flex justify-center">
        <button
          type="button"
          onClick={() => onChangeRef.current({ ...rowRef.current, isCommander: !rowRef.current.isCommander })}
          title="סמן כמפקד משימה"
          className={`text-xs px-2 py-1 rounded border transition-colors ${
            row.isCommander
              ? 'bg-mil-warning/20 border-mil-warning text-mil-warning font-bold'
              : 'border-mil-border text-mil-muted hover:border-mil-warning/50'
          }`}
        >
          {row.isCommander ? '★ מפקד' : '☆'}
        </button>
      </div>

      <div className="flex items-center gap-1">
        {row.isValid && <span className="text-green-400 text-sm" title="נמצא במאגר">✓</span>}
        <button
          type="button"
          onClick={onDelete}
          className="text-mil-muted hover:text-red-400 text-lg leading-none px-1 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
