import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('personnel')
    .select('*')
    .order('last_name', { ascending: true })
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data ?? [])
}

export async function POST(request: Request) {
  const body = await request.json()
  const { first_name, last_name, personal_number, phone, role } = body
  if (!first_name || !last_name || !personal_number || !phone) {
    return Response.json({ error: 'כל השדות חובה' }, { status: 400 })
  }
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('personnel')
    .insert({ first_name, last_name, personal_number, phone, role: role || 'לוחם' })
    .select()
    .single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
