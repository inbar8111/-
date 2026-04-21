import { createServerSupabaseClient } from '@/lib/supabase'
import AdminMissionCard from '@/components/AdminMissionCard'
import AdminRefresher from '@/components/AdminRefresher'
import type { MissionWithDetails, MissionAssignment, Personnel } from '@/lib/types'

export const revalidate = 0

export default async function AdminPage() {
  const supabase = createServerSupabaseClient()

  const [{ data: missions }, { data: assignments }, { data: resets }] = await Promise.all([
    supabase.from('missions').select('*').order('display_order', { ascending: true }),
    supabase
      .from('mission_assignments')
      .select('*, personnel(*)')
      .order('assigned_at', { ascending: true }),
    supabase
      .from('mission_resets')
      .select('*')
      .order('reset_at', { ascending: false }),
  ])

  const lastResetMap: Record<string, { id: string; mission_id: string; reset_at: string }> = {}
  for (const r of resets ?? []) {
    if (!lastResetMap[r.mission_id]) lastResetMap[r.mission_id] = r
  }

  const missionDetails: MissionWithDetails[] = (missions ?? []).map(m => ({
    ...m,
    assignments: ((assignments ?? []) as (MissionAssignment & { personnel: Personnel })[])
      .filter(a => a.mission_id === m.id),
    last_reset: lastResetMap[m.id] ?? null,
  }))

  const total = missionDetails.reduce((sum, m) => sum + m.assignments.length, 0)
  const active = missionDetails.filter(m => m.assignments.length > 0).length

  return (
    <div className="flex flex-col gap-6 py-4" dir="rtl">
      <AdminRefresher />
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <div className="bg-mil-card border border-mil-border rounded-lg px-4 py-2 text-center">
            <div className="text-2xl font-bold text-mil-accent">{total}</div>
            <div className="text-mil-muted text-xs">סה"כ משובצים</div>
          </div>
          <div className="bg-mil-card border border-mil-border rounded-lg px-4 py-2 text-center">
            <div className="text-2xl font-bold text-mil-warning">{active}</div>
            <div className="text-mil-muted text-xs">משימות פעילות</div>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-mil-text">לוח ניהול</h1>
      </div>

      <div className="flex flex-col gap-4">
        {missionDetails.map(m => (
          <AdminMissionCard key={m.id} mission={m} />
        ))}
      </div>
    </div>
  )
}
