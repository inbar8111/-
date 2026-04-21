import type { Metadata } from 'next'
import { Heebo } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const heebo = Heebo({ subsets: ['hebrew', 'latin'] })

export const metadata: Metadata = {
  title: 'ניהול שיבוץ משימות',
  description: 'מערכת ניהול שיבוץ כוח אדם למשימות',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={heebo.className}>
      <body className="min-h-screen bg-mil-bg text-mil-text flex flex-col">
        <header className="bg-mil-surface border-b border-mil-border px-6 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-mil-muted hover:text-mil-text text-sm transition-colors">
              לוח ניהול
            </Link>
            <Link href="/admin/personnel" className="text-mil-muted hover:text-mil-text text-sm transition-colors">
              כוח אדם
            </Link>
          </div>
          <Link href="/" className="text-mil-accent font-bold text-lg tracking-wide">
            ניהול שיבוץ משימות
          </Link>
          <div className="w-32" />
        </header>
        <main className="flex-1 p-4 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </body>
    </html>
  )
}
