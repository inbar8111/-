import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') ?? ''
  const field = searchParams.get('field') ?? ''

  if (!q || q.length < 1) {
    return Response.json([])
  }

  const supabase = createServerSupabaseClient()
  let query = supabase.from('personnel').select('*')

  if (field === 'personal_number') {
    query = query.ilike('personal_number', `${q}%`)
  } else if (field === 'phone') {
    query = query.ilike('phone', `${q}%`)
  } else if (field === 'first_name') {
    query = query.ilike('first_name', `%${q}%`)
  } else if (field === 'last_name') {
    query = query.ilike('last_name', `%${q}%`)
  } else {
    return Response.json([])
  }

  const { data, error } = await query.limit(10)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data ?? [])
}
