export interface Personnel {
  id: string
  first_name: string
  last_name: string
  personal_number: string
  phone: string
  role: string
  created_at: string
}

export interface Mission {
  id: string
  name: string
  is_fixed: boolean
  display_order: number
  created_at: string
}

export interface MissionAssignment {
  id: string
  mission_id: string
  personnel_id: string
  mission_start_time: string | null
  assigned_at: string
  is_commander: boolean
  personnel?: Personnel
}

export interface MissionReset {
  id: string
  mission_id: string
  reset_at: string
}

export interface MissionWithDetails extends Mission {
  assignments: (MissionAssignment & { personnel: Personnel })[]
  last_reset: MissionReset | null
}

export interface PersonRowData {
  rowId: string
  personnelId: string | null
  first_name: string
  last_name: string
  personal_number: string
  phone: string
  role: string
  isCommander: boolean
  isValid: boolean
}
