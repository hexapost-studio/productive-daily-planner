import { DayOfWeek } from '../value-objects/DayOfWeek'

export type RecurrencePattern = 'weekly' | 'every_n_days' | 'monthly'

export interface RecurringTask {
  id: string
  dayOfWeek: DayOfWeek
  designation: string
  domain: string
  remarks: string
  position: number
  pattern?: RecurrencePattern
  intervalDays?: number
  monthDay?: number
}
