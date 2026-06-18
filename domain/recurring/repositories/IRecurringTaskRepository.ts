import { RecurringTask } from '../entities/RecurringTask'
import { DayOfWeek } from '../value-objects/DayOfWeek'

export interface IRecurringTaskRepository {
  getByDay(day: DayOfWeek): RecurringTask[]
  getAll(): RecurringTask[]
  save(task: RecurringTask): void
  delete(id: string): void
}
