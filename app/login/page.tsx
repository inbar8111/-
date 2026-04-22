'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function login(role: 'user' | 'admin') {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, role }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'שגיאה'); return }
      router.push(role === 'admin' ? '/admin' : '/')
      router.refresh()
    } catch {
      setError('שגיאת רשת')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-mil-bg flex items-center justify-center" dir="rtl">
      <div className="w-full max-w-sm mx-4">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🔒</div>
          <h1 className="text-2xl font-bold text-mil-accent tracking-wide">ניהול שיבוץ משימות</h1>
          <p className="text-mil-muted text-sm mt-1">יחידה 669 — מוגן בסיסמא</p>
        </div>

        <div className="bg-mil-card border border-mil-border rounded-xl p-6 shadow-2xl flex flex-col gap-4">
          <div>
            <label className="block text-mil-muted text-xs font-medium mb-1.5 text-right">סיסמא</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && password && login('user')}
              placeholder="הזן סיסמא..."
              className="w-full bg-mil-surface border border-mil-border text-mil-text rounded-lg px-4 py-3 text-right text-lg tracking-widest focus:outline-none focus:border-mil-primary transition-colors"
              autoFocus
              dir="ltr"
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/40 rounded-lg px-3 py-2 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2 mt-1">
            <button
              onClick={() => login('user')}
              disabled={loading || !password}
              className="w-full py-3 rounded-lg bg-mil-primary hover:bg-mil-primary-hover text-white font-bold text-base transition-colors disabled:opacity-50"
            >
              {loading ? 'מתחבר...' : 'כניסה — ממשק שיבוץ'}
            </button>
            <button
              onClick={() => login('admin')}
              disabled={loading || !password}
              className="w-full py-3 rounded-lg border border-mil-warning/60 text-mil-warning hover:bg-mil-warning/10 font-bold text-base transition-colors disabled:opacity-50"
            >
              {loading ? 'מתחבר...' : 'כניסה — ממשק ניהול'}
            </button>
          </div>
        </div>

        <p className="text-mil-muted text-xs text-center mt-4">
          גישה מורשית בלבד
        </p>
      </div>
    </div>
  )
}
