import { createServerSupabaseClient } from '@/lib/supabase'
import AssignmentTable from '@/components/AssignmentTable'
import type { MissionAssignment, Personnel } from '@/lib/types'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function MissionPage({ params }: Props) {
  const { id } = await params
  const supabase = createServerSupabaseClient()

  const [{ data: mission }, { data: assignments }, { data: resets }] = await Promise.all([
    supabase.from('missions').select('*').eq('id', id).single(),
    supabase
      .from('mission_assignments')
      .select('*, personnel(*)')
      .eq('mission_id', id)
      .order('assigned_at', { ascending: true }),
    supabase
      .from('mission_resets')
      .select('*')
      .eq('mission_id', id)
      .order('reset_at', { ascending: false })
      .limit(1),
  ])

  if (!mission) notFound()

  const typedAssignments = (assignments ?? []) as (MissionAssignment & { personnel: Personnel })[]
  const lastStartTime = typedAssignments[0]?.mission_start_time ?? null

  return (
    <div className="py-4 max-w-5xl mx-auto">
      <AssignmentTable
        missionId={id}
        missionName={mission.name}
        initialAssignments={typedAssignments}
        lastStartTime={lastStartTime}
      />
    </div>
  )
}
