import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data ?? [])
}

export async function POST(request: Request) {
  const { name } = await request.json()
  if (!name?.trim()) {
    return Response.json({ error: 'שם משימה נדרש' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('missions')
    .insert({ name: name.trim(), is_fixed: false, display_order: 999 })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
