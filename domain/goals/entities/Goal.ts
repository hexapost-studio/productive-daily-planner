export type GoalPeriod = 'semaine' | 'mois' | 'trimestre' | 'année'
export type GoalStatus = 'actif' | 'atteint' | 'abandonné'

export interface KeyResult {
  id: string
  title: string
  target: number
  current: number
  unit: string
}

export interface Goal {
  id: string
  title: string
  description?: string
  period: GoalPeriod
  status: GoalStatus
  keyResults: KeyResult[]
  linkedProjectIds: string[]
  createdAt: string
  dueDate?: string
}
