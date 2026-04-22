import type { Metadata } from 'next'
import { Heebo } from 'next/font/google'
import Link from 'next/link'
import { cookies } from 'next/headers'
import LogoutButton from '@/components/LogoutButton'
import './globals.css'

const heebo = Heebo({ subsets: ['hebrew', 'latin'] })

export const metadata: Metadata = {
  title: 'ניהול שיבוץ משימות',
  description: 'מערכת ניהול שיבוץ כוח אדם למשימות',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const auth = cookieStore.get('auth')?.value ?? ''
  const secret = process.env.AUTH_SECRET ?? ''
  const isLoggedIn = auth.endsWith(':' + secret)
  const role = isLoggedIn ? auth.split(':')[0] : null

  return (
    <html lang="he" dir="rtl" className={heebo.className}>
      <body className="min-h-screen bg-mil-bg text-mil-text flex flex-col">
        {isLoggedIn && (
          <header className="bg-mil-surface border-b border-mil-border px-3 py-2 sticky top-0 z-40 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-3">
            {/* Top row: title + role badge */}
            <div className="flex items-center justify-between sm:order-2">
              <Link href={role === 'admin' ? '/admin' : '/'} className="text-mil-accent font-bold text-base sm:text-lg tracking-wide">
                ניהול שיבוץ משימות
              </Link>
              <span className={`text-xs px-2 py-1 rounded-full border font-medium sm:hidden ${role === 'admin' ? 'border-mil-warning/60 text-mil-warning' : 'border-mil-primary/60 text-mil-accent'}`}>
                {role === 'admin' ? 'מנהל' : 'משתמש'}
              </span>
            </div>
            {/* Bottom row: nav links */}
            <div className="flex items-center gap-2 sm:order-1">
              {role === 'admin' && (
                <>
                  <Link href="/admin" className="px-3 py-1.5 rounded border border-mil-border text-mil-muted hover:text-mil-text text-sm transition-colors">
                    לוח ניהול
                  </Link>
                  <Link href="/admin/personnel" className="px-3 py-1.5 rounded border border-mil-border text-mil-muted hover:text-mil-text text-sm transition-colors">
                    כוח אדם
                  </Link>
                </>
              )}
              <LogoutButton />
            </div>
            {/* Role badge desktop only */}
            <div className="hidden sm:flex items-center gap-2 sm:order-3">
              <span className={`text-xs px-2 py-1 rounded-full border font-medium ${role === 'admin' ? 'border-mil-warning/60 text-mil-warning' : 'border-mil-primary/60 text-mil-accent'}`}>
                {role === 'admin' ? 'מנהל' : 'משתמש'}
              </span>
            </div>
          </header>
        )}
        <main className="flex-1 p-4 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </body>
    </html>
  )
}
