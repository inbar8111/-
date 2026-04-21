'use client'

import { useState, useEffect } from 'react'
import type { Personnel } from '@/lib/types'

function emptyForm() {
  return { first_name: '', last_name: '', personal_number: '', phone: '', role: 'לוחם' }
}

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/personnel')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setPersonnel(d) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = personnel.filter(p =>
    [p.first_name, p.last_name, p.personal_number, p.phone, p.role]
      .some(v => v.toLowerCase().includes(search.toLowerCase()))
  )

  function startEdit(p: Personnel) {
    setEditId(p.id)
    setForm({ first_name: p.first_name, last_name: p.last_name, personal_number: p.personal_number, phone: p.phone, role: p.role })
    setShowAdd(false)
    setError('')
  }

  function cancelEdit() {
    setEditId(null)
    setForm(emptyForm())
    setShowAdd(false)
    setError('')
  }

  async function handleSave(id: string) {
    setSaving(true); setError('')
    try {
      const res = await fetch(`/api/personnel/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'שגיאה'); return }
      setPersonnel(prev => prev.map(p => p.id === id ? data : p))
      cancelEdit()
    } catch { setError('שגיאת רשת') }
    finally { setSaving(false) }
  }

  async function handleAdd() {
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/personnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'שגיאה'); return }
      setPersonnel(prev => [...prev, data])
      cancelEdit()
    } catch { setError('שגיאת רשת') }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('למחוק חייל זה מהמאגר?')) return
    const res = await fetch(`/api/personnel/${id}`, { method: 'DELETE' })
    if (res.ok) setPersonnel(prev => prev.filter(p => p.id !== id))
  }

  const inputClass = 'bg-mil-surface border border-mil-border text-mil-text text-sm rounded px-2 py-1.5 text-right focus:outline-none focus:border-mil-primary w-full'

  return (
    <div className="flex flex-col gap-4 py-4" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => { setShowAdd(true); setEditId(null); setForm(emptyForm()); setError('') }}
            className="px-4 py-2 rounded bg-mil-primary hover:bg-mil-primary-hover text-white text-sm font-medium transition-colors"
          >
            + הוסף חייל
          </button>
          <a href="/admin" className="px-4 py-2 rounded border border-mil-border text-mil-muted hover:text-mil-text text-sm transition-colors">
            ← לוח ניהול
          </a>
        </div>
        <h1 className="text-xl font-bold text-mil-text">ניהול כוח אדם</h1>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="חיפוש לפי שם / מספר אישי / טלפון / תפקיד..."
          className="bg-mil-card border border-mil-border text-mil-text rounded px-3 py-2 text-right focus:outline-none focus:border-mil-primary flex-1 max-w-md"
          dir="rtl"
        />
        <span className="text-mil-muted text-sm">{filtered.length} / {personnel.length}</span>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-mil-card border border-mil-border rounded-lg p-4" dir="rtl">
          <h3 className="text-mil-text font-bold mb-3">הוספת חייל חדש</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(['personal_number','first_name','last_name','phone','role'] as const).map(f => (
              <input key={f} type="text" value={form[f]} onChange={e => setForm(p => ({...p, [f]: e.target.value}))}
                placeholder={f === 'personal_number' ? 'מ"א' : f === 'first_name' ? 'שם פרטי' : f === 'last_name' ? 'שם משפחה' : f === 'phone' ? 'טלפון' : 'תפקיד'}
                className={inputClass} dir="rtl" />
            ))}
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          <div className="flex gap-2 mt-3">
            <button onClick={cancelEdit} className="px-3 py-1.5 rounded border border-mil-border text-mil-muted text-sm hover:bg-mil-surface">ביטול</button>
            <button onClick={handleAdd} disabled={saving} className="px-4 py-1.5 rounded bg-mil-primary text-white text-sm disabled:opacity-50">
              {saving ? 'שומר...' : 'הוסף'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-mil-muted text-center py-10 animate-pulse">טוען...</div>
      ) : (
        <div className="bg-mil-card border border-mil-border rounded-lg overflow-hidden">
          <table className="w-full text-sm" dir="rtl">
            <thead>
              <tr className="bg-mil-surface text-mil-muted text-xs border-b border-mil-border">
                <th className="px-3 py-2 text-right font-medium">מ"א</th>
                <th className="px-3 py-2 text-right font-medium">שם פרטי</th>
                <th className="px-3 py-2 text-right font-medium">שם משפחה</th>
                <th className="px-3 py-2 text-right font-medium">טלפון</th>
                <th className="px-3 py-2 text-right font-medium">תפקיד</th>
                <th className="px-3 py-2 text-center font-medium w-24">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} className={`border-b border-mil-border/30 ${i % 2 === 0 ? '' : 'bg-mil-surface/20'}`}>
                  {editId === p.id ? (
                    <>
                      {(['personal_number','first_name','last_name','phone','role'] as const).map(f => (
                        <td key={f} className="px-2 py-1">
                          <input type="text" value={form[f]} onChange={e => setForm(prev => ({...prev, [f]: e.target.value}))}
                            className={inputClass} dir="rtl" />
                        </td>
                      ))}
                      <td className="px-2 py-1">
                        {error && <p className="text-red-400 text-xs mb-1">{error}</p>}
                        <div className="flex gap-1 justify-center">
                          <button onClick={cancelEdit} className="px-2 py-1 rounded border border-mil-border text-mil-muted text-xs hover:bg-mil-surface">ביטול</button>
                          <button onClick={() => handleSave(p.id)} disabled={saving} className="px-2 py-1 rounded bg-mil-primary text-white text-xs disabled:opacity-50">
                            {saving ? '...' : 'שמור'}
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2 text-mil-text font-mono text-xs">{p.personal_number}</td>
                      <td className="px-3 py-2 text-mil-text">{p.first_name}</td>
                      <td className="px-3 py-2 text-mil-text">{p.last_name}</td>
                      <td className="px-3 py-2 text-mil-text font-mono text-xs">{p.phone}</td>
                      <td className="px-3 py-2 text-mil-muted">{p.role}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => startEdit(p)} className="text-mil-muted hover:text-mil-accent text-xs transition-colors">ערוך</button>
                          <button onClick={() => handleDelete(p.id)} className="text-mil-muted hover:text-red-400 text-xs transition-colors">מחק</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center text-mil-muted py-6">לא נמצאו תוצאות</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
