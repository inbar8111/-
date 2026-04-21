import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
  const supabase = createServerSupabaseClient()

  const [{ data: missions }, { data: assignments }, { data: resets }] = await Promise.all([
    supabase.from('missions').select('*').order('display_order', { ascending: true }),
    supabase.from('mission_assignments').select('mission_id'),
    supabase.from('mission_resets').select('*').order('reset_at', { ascending: false }),
  ])

  const countMap: Record<string, number> = {}
  for (const a of assignments ?? []) {
    countMap[a.mission_id] = (countMap[a.mission_id] ?? 0) + 1
  }

  const lastResetMap: Record<string, { id: string; mission_id: string; reset_at: string }> = {}
  for (const r of resets ?? []) {
    if (!lastResetMap[r.mission_id]) lastResetMap[r.mission_id] = r
  }

  const result = (missions ?? []).map(m => ({
    ...m,
    assignmentCount: countMap[m.id] ?? 0,
    lastReset: lastResetMap[m.id] ?? null,
  }))

  return Response.json(result)
}
