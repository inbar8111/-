import { createServerSupabaseClient } from '@/lib/supabase'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const supabase = createServerSupabaseClient()
  const update: Record<string, unknown> = {}
  if (body.name !== undefined) update.name = body.name
  if (body.display_order !== undefined) update.display_order = body.display_order
  const { data, error } = await supabase.from('missions').update(update).eq('id', id).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createServerSupabaseClient()

  const { data: mission } = await supabase.from('missions').select('is_fixed').eq('id', id).single()
  if (mission?.is_fixed) {
    return Response.json({ error: 'לא ניתן למחוק משימה קבועה' }, { status: 403 })
  }

  const { error } = await supabase.from('missions').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
