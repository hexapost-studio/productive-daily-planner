import { RecurringTask } from '@/domain/recurring/entities/RecurringTask'
import { DayOfWeek } from '@/domain/recurring/value-objects/DayOfWeek'
import { LocalStorageRecurringTaskRepository } from '@/infrastructure/persistence/LocalStorageRecurringTaskRepository'

const repo = () => new LocalStorageRecurringTaskRepository()

export function getRecurringTasks(): RecurringTask[] {
  return repo().getAll()
}

export function getRecurringTasksByDay(day: DayOfWeek): RecurringTask[] {
  return repo().getByDay(day)
}

export function saveRecurringTask(task: RecurringTask): void {
  repo().save(task)
}

export function deleteRecurringTask(id: string): void {
  repo().delete(id)
}
