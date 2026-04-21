import type { MissionWithDetails } from '@/lib/types'

interface Props {
  mission: MissionWithDetails
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('he-IL', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminMissionCard({ mission }: Props) {
  const startTime = mission.assignments[0]?.mission_start_time

  return (
    <div className="bg-mil-card border border-mil-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-mil-surface border-b border-mil-border">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${mission.assignments.length > 0 ? 'bg-mil-primary/20 text-mil-accent' : 'bg-mil-border text-mil-muted'}`}>
            {mission.assignments.length} משובצים
          </span>
          {startTime && (
            <span className="text-mil-muted text-xs">עליה: {formatDate(startTime)}</span>
          )}
          {mission.last_reset && (
            <span className="text-mil-muted text-xs">איפוס: {formatDate(mission.last_reset.reset_at)}</span>
          )}
        </div>
        <h3 className="text-mil-text font-bold text-base">{mission.name}</h3>
      </div>

      {mission.assignments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" dir="rtl">
            <thead>
              <tr className="text-mil-muted text-xs border-b border-mil-border/50">
                <th className="px-3 py-2 text-right font-medium w-8"></th>
                <th className="px-3 py-2 text-right font-medium">מ"א</th>
                <th className="px-3 py-2 text-right font-medium">שם פרטי</th>
                <th className="px-3 py-2 text-right font-medium">שם משפחה</th>
                <th className="px-3 py-2 text-right font-medium">טלפון</th>
                <th className="px-3 py-2 text-right font-medium">תפקיד</th>
              </tr>
            </thead>
            <tbody>
              {mission.assignments.map((a, i) => (
                <tr key={a.id} className={`border-b border-mil-border/30 ${i % 2 === 0 ? '' : 'bg-mil-surface/30'}`}>
                  <td className="px-3 py-2 text-center">
                    {a.is_commander && (
                      <span className="text-mil-warning text-xs font-bold" title="מפקד משימה">★</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    <span className={a.is_commander ? 'text-mil-warning font-bold' : 'text-mil-text'}>
                      {a.personnel.personal_number}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={a.is_commander ? 'text-mil-warning font-bold' : 'text-mil-text'}>
                      {a.personnel.first_name}
                    </span>
                    {a.is_commander && <span className="text-mil-warning text-xs mr-1">(מפקד)</span>}
                  </td>
                  <td className={`px-3 py-2 ${a.is_commander ? 'text-mil-warning font-bold' : 'text-mil-text'}`}>{a.personnel.last_name}</td>
                  <td className="px-3 py-2 text-mil-text font-mono text-xs">{a.personnel.phone}</td>
                  <td className="px-3 py-2 text-mil-muted">{a.personnel.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-mil-muted text-sm text-center py-4">אין משובצים</p>
      )}
    </div>
  )
}
