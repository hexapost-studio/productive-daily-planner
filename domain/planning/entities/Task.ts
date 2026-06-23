import { TaskStatus } from '../value-objects/TaskStatus'
import { Priority } from '../value-objects/Priority'

export type EnergyLevel = 'haute' | 'moyenne' | 'faible'

export interface TaskReminder {
  date: string
  time: string
  sent?: boolean
}

export interface Task {
  id: string
  designation: string
  domain: string
  priority: Priority | null
  estimatedMinutes: number | null
  realMinutes: number | null
  status: TaskStatus
  remarks: string
  position: number
  isRecurring: boolean
  startTime?: string | null
  energyLevel?: EnergyLevel | null
  context?: string | null
  reminder?: TaskReminder | null
  blockedBy?: string[]
}
