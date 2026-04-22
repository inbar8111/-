import { createServerSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'
import type { MissionAssignment, Personnel } from '@/lib/types'

export const revalidate = 0

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('he-IL', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

export default async function AdminPage() {
  const supabase = createServerSupabaseClient()

  const [{ data: missions }, { data: assignments }, { data: resets }] = await Promise.all([
    supabase.from('missions').select('*').order('display_order', { ascending: true }),
    supabase.from('mission_assignments').select('*, personnel(*)').order('is_commander', { ascending: false }),
    supabase.from('mission_resets').select('*').order('reset_at', { ascending: false }),
  ])

  const lastResetMap: Record<string, string> = {}
  for (const r of resets ?? []) {
    if (!lastResetMap[r.mission_id]) lastResetMap[r.mission_id] = r.reset_at
  }

  type A = MissionAssignment & { personnel: Personnel }
  const byMission: Record<string, A[]> = {}
  for (const a of (assignments ?? []) as A[]) {
    if (!byMission[a.mission_id]) byMission[a.mission_id] = []
    byMission[a.mission_id].push(a)
  }

  const total = (assignments ?? []).length
  const activeMissions = (missions ?? []).filter(m => (byMission[m.id] ?? []).length > 0)

  return (
    <div className="flex flex-col gap-4 py-4" dir="rtl">
      {/* Stats */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          <div className="bg-mil-card border border-mil-border rounded-lg px-3 py-2 text-center min-w-[70px]">
            <div className="text-xl font-bold text-mil-accent">{total}</div>
            <div className="text-mil-muted text-xs">משובצים</div>
          </div>
          <div className="bg-mil-card border border-mil-border rounded-lg px-3 py-2 text-center min-w-[70px]">
            <div className="text-xl font-bold text-mil-warning">{activeMissions.length}</div>
            <div className="text-mil-muted text-xs">פעילות</div>
          </div>
          <div className="bg-mil-card border border-mil-border rounded-lg px-3 py-2 text-center min-w-[70px]">
            <div className="text-xl font-bold text-mil-text">{(missions ?? []).length}</div>
            <div className="text-mil-muted text-xs">משימות</div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/admin/personnel" className="px-3 py-1.5 rounded border border-mil-border text-mil-muted hover:text-mil-text text-sm transition-colors">
            כוח אדם
          </Link>
          <Link href="/" className="px-3 py-1.5 rounded border border-mil-primary/60 text-mil-primary hover:bg-mil-primary/10 text-sm transition-colors">
            ← שיבוץ
          </Link>
          <h1 className="text-lg font-bold text-mil-text">לוח ניהול</h1>
        </div>
      </div>

      {/* Missions */}
      <div className="flex flex-col gap-3">
        {(missions ?? []).map((m, mIdx) => {
          const mA = byMission[m.id] ?? []
          const startTime = mA[0]?.mission_start_time
          const lastReset = lastResetMap[m.id]

          return (
            <div key={m.id} className="bg-mil-card border border-mil-border rounded-lg overflow-hidden">
              {/* Header — mission name on RIGHT, meta on LEFT */}
              <div className={`flex items-center justify-between px-3 py-2.5 border-b border-mil-border flex-wrap gap-2 ${mA.length > 0 ? 'bg-mil-primary/10' : 'bg-mil-surface'}`}>
                {/* RIGHT: number + name + link */}
                <div className="flex items-center gap-2">
                  <span className="text-mil-muted text-xs font-mono">{mIdx + 1}.</span>
                  <h3 className="text-mil-text font-bold text-sm sm:text-base">{m.name}</h3>
                  <Link href={`/mission/${m.id}`} className="text-mil-muted hover:text-mil-accent text-xs transition-colors">
                    שבץ
                  </Link>
                </div>
                {/* LEFT: badges + dates */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${mA.length > 0 ? 'bg-mil-primary/30 text-mil-accent' : 'bg-mil-border/50 text-mil-muted'}`}>
                    {mA.length > 0 ? `${mA.length} חיילים` : 'ריקה'}
                  </span>
                  {startTime && <span className="text-mil-muted text-xs">עליה: {formatDate(startTime)}</span>}
                  {lastReset && <span className="text-mil-muted text-xs">איפוס: {formatDate(lastReset)}</span>}
                </div>
              </div>

              {mA.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" dir="rtl">
                    {/* Column headers */}
                    <thead>
                      <tr className="border-b border-mil-border/60 bg-mil-surface/50">
                        <th className="text-right text-mil-muted text-xs font-medium px-3 py-1.5">שם מלא</th>
                        <th className="text-right text-mil-muted text-xs font-medium px-3 py-1.5">מספר אישי</th>
                        <th className="text-right text-mil-muted text-xs font-medium px-3 py-1.5">מספר פלאפון</th>
                        <th className="text-right text-mil-muted text-xs font-medium px-3 py-1.5">תפקיד</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mA.map((a) => (
                        <tr key={a.id} className={`border-b border-mil-border/30 last:border-0 ${a.is_commander ? 'bg-mil-warning/5' : 'hover:bg-mil-surface/30'}`}>
                          <td className="px-3 py-2 text-right">
                            <span className={`font-medium ${a.is_commander ? 'text-mil-warning' : 'text-mil-text'}`}>
                              {a.is_commander && <span className="text-mil-warning text-xs ml-1">★</span>}
                              {a.personnel.first_name} {a.personnel.last_name}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right text-mil-muted">{a.personnel.personal_number}</td>
                          <td className="px-3 py-2 text-right text-mil-muted">{a.personnel.phone}</td>
                          <td className="px-3 py-2 text-right text-mil-muted">{a.personnel.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-mil-muted text-sm text-center py-3">אין משובצים</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
