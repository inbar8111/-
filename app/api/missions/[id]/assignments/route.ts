import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('mission_assignments')
    .select('*, personnel(*)')
    .eq('mission_id', id)
    .order('assigned_at', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data ?? [])
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { assignments, mission_start_time } = await request.json()

  if (!Array.isArray(assignments)) {
    return Response.json({ error: 'נתונים לא תקינים' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()
  await supabase.from('mission_assignments').delete().eq('mission_id', id)

  if (assignments.length === 0) return Response.json({ success: true })

  const rows = assignments.map((a: { personnelId: string; isCommander: boolean }) => ({
    mission_id: id,
    personnel_id: a.personnelId,
    mission_start_time: mission_start_time || null,
    is_commander: a.isCommander ?? false,
  }))

  const { error } = await supabase.from('mission_assignments').insert(rows)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
