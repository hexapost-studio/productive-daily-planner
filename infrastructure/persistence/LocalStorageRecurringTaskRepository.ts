import { RecurringTask } from '@/domain/recurring/entities/RecurringTask'
import { DayOfWeek } from '@/domain/recurring/value-objects/DayOfWeek'
import { IRecurringTaskRepository } from '@/domain/recurring/repositories/IRecurringTaskRepository'
import { LS_PREFIX } from '@/lib/constants'

const KEY = `${LS_PREFIX}recurring`

export class LocalStorageRecurringTaskRepository implements IRecurringTaskRepository {
  private load(): RecurringTask[] {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return []
      return JSON.parse(raw) as RecurringTask[]
    } catch {
      return []
    }
  }

  private persist(tasks: RecurringTask[]): void {
    try {
      localStorage.setItem(KEY, JSON.stringify(tasks))
    } catch {
      // ignore
    }
  }

  getAll(): RecurringTask[] {
    return this.load()
  }

  getByDay(day: DayOfWeek): RecurringTask[] {
    return this.load()
      .filter((t) => t.dayOfWeek === day)
      .sort((a, b) => a.position - b.position)
  }

  save(task: RecurringTask): void {
    const all = this.load()
    const idx = all.findIndex((t) => t.id === task.id)
    if (idx >= 0) {
      all[idx] = task
    } else {
      all.push(task)
    }
    this.persist(all)
  }

  delete(id: string): void {
    const all = this.load().filter((t) => t.id !== id)
    this.persist(all)
  }
}
