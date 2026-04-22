import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout']

// In-memory rate limiting for login attempts (resets on cold start)
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>()
const MAX_ATTEMPTS = 10
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = loginAttempts.get(ip)
  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now })
    return true
  }
  if (entry.count >= MAX_ATTEMPTS) return false
  entry.count++
  return true
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Geo-blocking — Israel only
  const country = (request as NextRequest & { geo?: { country?: string } }).geo?.country
  if (country && country !== 'IL') {
    return new NextResponse('גישה חסומה', { status: 403 })
  }

  // Public paths — no auth needed
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    // Rate limit on login endpoint
    if (pathname.startsWith('/api/auth/login') && request.method === 'POST') {
      const ip = getClientIp(request)
      if (!checkRateLimit(ip)) {
        return NextResponse.json({ error: 'יותר מדי ניסיונות. נסה שוב בעוד 15 דקות.' }, { status: 429 })
      }
    }
    return NextResponse.next()
  }

  const auth = request.cookies.get('auth')?.value
  const secret = process.env.AUTH_SECRET ?? ''

  if (!auth || !auth.endsWith(':' + secret)) {
    // API routes return 401 JSON, page routes redirect to login
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'לא מורשה' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const role = auth.split(':')[0]

  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
