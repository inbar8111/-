import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { password, role } = await request.json()

  const expected = process.env.APP_PASSWORD
  const secret = process.env.AUTH_SECRET ?? ''

  if (!password || password !== expected) {
    return Response.json({ error: 'סיסמא שגויה' }, { status: 401 })
  }

  const cookieValue = `${role}:${secret}`
  const res = NextResponse.json({ success: true, role })
  res.cookies.set('auth', cookieValue, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
  return res
}
