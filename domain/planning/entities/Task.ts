import { TaskStatus } from '../value-objects/TaskStatus'
import { Priority } from '../value-objects/Priority'

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
}
