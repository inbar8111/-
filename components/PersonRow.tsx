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
  const [dropUp, setDropUp] = useState(false)
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

  function checkDropDirection(el: HTMLElement) {
    const rect = el.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    setDropUp(spaceBelow < 200)
  }

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
    if (q.length < 1) { setSuggestions([]); return }
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
    }, 250)
  }

  function handleFieldChange(field: SearchField, value: string, el: HTMLElement) {
    onChangeRef.current({ ...rowRef.current, [field]: value, personnelId: null, isValid: false })
    setActiveField(field)
    checkDropDirection(el)
    doSearch(field, value)
  }

  const inputClass = 'bg-mil-surface border border-mil-border text-mil-text text-sm rounded px-2 py-1.5 w-full text-right focus:outline-none focus:border-mil-primary placeholder:text-mil-muted'

  const searchFields: { key: SearchField; placeholder: string }[] = [
    { key: 'personal_number', placeholder: 'מ"א' },
    { key: 'phone', placeholder: 'טלפון' },
    { key: 'first_name', placeholder: 'שם פרטי' },
    { key: 'last_name', placeholder: 'שם משפחה' },
  ]

  const dropClass = dropUp
    ? 'bottom-full mb-1'
    : 'top-full mt-1'

  return (
    <div className="relative" ref={dropdownRef} dir="rtl">
      {/* Mobile: card layout */}
      <div className="flex sm:hidden flex-col gap-1.5 bg-mil-surface/30 rounded-lg p-2 border border-mil-border/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onChangeRef.current({ ...rowRef.current, isCommander: !rowRef.current.isCommander })}
              className={`text-xs px-2 py-0.5 rounded border transition-colors ${row.isCommander ? 'bg-mil-warning/20 border-mil-warning text-mil-warning font-bold' : 'border-mil-border text-mil-muted'}`}
            >
              {row.isCommander ? '★ מפקד' : '☆'}
            </button>
            {row.isValid && <span className="text-green-400 text-xs">✓</span>}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-mil-muted text-xs">{rowIndex + 1}</span>
            <button type="button" onClick={onDelete} className="text-mil-muted hover:text-red-400 text-base px-1">✕</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {searchFields.map(({ key, placeholder }) => (
            <div key={key} className="relative">
              <input
                type="text"
                value={row[key]}
                onChange={e => handleFieldChange(key, e.target.value, e.currentTarget)}
                placeholder={placeholder}
                className={inputClass}
                dir="rtl"
              />
              {activeField === key && suggestions.length > 0 && (
                <div className={`absolute ${dropClass} right-0 z-50 bg-[#1e2a1e] border-2 border-mil-primary/60 rounded-lg shadow-2xl min-w-[240px] max-h-52 overflow-y-auto`}>
                  {suggestions.map(p => (
                    <button key={p.id} type="button" onMouseDown={() => fillFromPersonnel(p)}
                      className="w-full text-right px-3 py-2.5 text-sm text-white hover:bg-mil-primary/30 border-b border-white/10 last:border-0 transition-colors">
                      <div className="font-bold text-white">{p.first_name} {p.last_name}</div>
                      <div className="text-gray-300 text-xs mt-0.5">{p.personal_number} • {p.role}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <input
          type="text"
          value={row.role}
          onChange={e => onChangeRef.current({ ...rowRef.current, role: e.target.value })}
          placeholder="תפקיד"
          className={inputClass}
          dir="rtl"
        />
      </div>

      {/* Desktop: row layout */}
      <div className="hidden sm:flex items-center gap-2">
        <div className="w-5 text-center text-mil-muted text-xs flex-shrink-0">{rowIndex + 1}</div>
        {searchFields.map(({ key, placeholder }) => (
          <div key={key} className={`relative flex-shrink-0 ${key === 'phone' ? 'w-28' : 'w-24'}`}>
            <input
              type="text"
              value={row[key]}
              onChange={e => handleFieldChange(key, e.target.value, e.currentTarget)}
              placeholder={placeholder}
              className={inputClass}
              dir="rtl"
            />
            {activeField === key && suggestions.length > 0 && (
              <div className={`absolute ${dropClass} right-0 z-50 bg-[#1e2a1e] border-2 border-mil-primary/60 rounded-lg shadow-2xl min-w-[240px] max-h-52 overflow-y-auto`}>
                {suggestions.map(p => (
                  <button key={p.id} type="button" onMouseDown={() => fillFromPersonnel(p)}
                    className="w-full text-right px-3 py-2.5 text-sm text-white hover:bg-mil-primary/30 border-b border-white/10 last:border-0 transition-colors">
                    <div className="font-bold text-white">{p.first_name} {p.last_name}</div>
                    <div className="text-gray-300 text-xs mt-0.5">{p.personal_number} • {p.phone} • {p.role}</div>
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
        <div className="w-16 flex-shrink-0 flex justify-center">
          <button
            type="button"
            onClick={() => onChangeRef.current({ ...rowRef.current, isCommander: !rowRef.current.isCommander })}
            className={`text-xs px-2 py-1 rounded border transition-colors ${row.isCommander ? 'bg-mil-warning/20 border-mil-warning text-mil-warning font-bold' : 'border-mil-border text-mil-muted hover:border-mil-warning/50'}`}
          >
            {row.isCommander ? '★ מפקד' : '☆'}
          </button>
        </div>
        <div className="flex items-center gap-1">
          {row.isValid && <span className="text-green-400 text-sm">✓</span>}
          <button type="button" onClick={onDelete} className="text-mil-muted hover:text-red-400 text-lg leading-none px-1 transition-colors">✕</button>
        </div>
      </div>
    </div>
  )
}
