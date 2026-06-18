import { DayOfWeek } from '../value-objects/DayOfWeek'

export interface RecurringTask {
  id: string
  dayOfWeek: DayOfWeek
  designation: string
  domain: string
  remarks: string
  position: number
}
