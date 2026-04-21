import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createServerSupabaseClient()

  await supabase.from('mission_assignments').delete().eq('mission_id', id)

  const { error } = await supabase
    .from('mission_resets')
    .insert({ mission_id: id })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
