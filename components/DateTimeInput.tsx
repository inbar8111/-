'use client'

interface Props {
  value: string // "YYYY-MM-DDTHH:mm"
  onChange: (val: string) => void
  className?: string
}

export default function DateTimeInput({ value, onChange, className = '' }: Props) {
  const datePart = value ? value.split('T')[0] : ''
  const timePart = value ? value.split('T')[1]?.slice(0, 5) : ''

  function handleDate(d: string) {
    onChange(d && timePart ? `${d}T${timePart}` : d ? `${d}T00:00` : '')
  }

  function handleTime(t: string) {
    const base = datePart || new Date().toISOString().split('T')[0]
    onChange(t ? `${base}T${t}` : datePart ? `${datePart}T00:00` : '')
  }

  return (
    <div className={`flex gap-3 flex-wrap ${className}`} dir="ltr">
      <div className="flex flex-col gap-0.5">
        <label className="text-mil-muted text-xs" dir="rtl">תאריך</label>
        <input
          type="date"
          lang="he"
          value={datePart}
          onChange={e => handleDate(e.target.value)}
          className="bg-mil-surface border border-mil-border text-mil-text rounded px-3 py-1.5 text-sm focus:outline-none focus:border-mil-primary w-40"
          style={{ colorScheme: 'dark' }}
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <label className="text-mil-muted text-xs" dir="rtl">שעה</label>
        <input
          type="time"
          lang="he"
          value={timePart}
          onChange={e => handleTime(e.target.value)}
          className="bg-mil-surface border border-mil-border text-mil-text rounded px-3 py-1.5 text-sm focus:outline-none focus:border-mil-primary w-28"
          style={{ colorScheme: 'dark' }}
        />
      </div>
    </div>
  )
}
