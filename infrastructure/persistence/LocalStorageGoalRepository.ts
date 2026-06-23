import { Goal } from '@/domain/goals/entities/Goal'
import { LS_PREFIX } from '@/lib/constants'

const KEY = `${LS_PREFIX}goals`

export class LocalStorageGoalRepository {
  getAll(): Goal[] {
    try {
      const raw = localStorage.getItem(KEY)
      return raw ? (JSON.parse(raw) as Goal[]) : []
    } catch { return [] }
  }

  save(goal: Goal): void {
    const all = this.getAll().filter((g) => g.id !== goal.id)
    localStorage.setItem(KEY, JSON.stringify([...all, goal]))
  }

  delete(id: string): void {
    localStorage.setItem(KEY, JSON.stringify(this.getAll().filter((g) => g.id !== id)))
  }
}
