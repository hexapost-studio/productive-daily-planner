import { WeeklyPlan } from '@/domain/planning/entities/WeeklyPlan'
import { LocalStoragePlanningRepository } from '@/infrastructure/persistence/LocalStoragePlanningRepository'
import { LocalStorageRecurringTaskRepository } from '@/infrastructure/persistence/LocalStorageRecurringTaskRepository'
import { RecurringTask } from '@/domain/recurring/entities/RecurringTask'
import { DAYS_OF_WEEK } from '@/domain/recurring/value-objects/DayOfWeek'

function buildRepo(): LocalStoragePlanningRepository {
  const recurringRepo = new LocalStorageRecurringTaskRepository()
  const recurringByDay = (day: string): RecurringTask[] => {
    const dow = DAYS_OF_WEEK.find((d) => d === day)
    if (!dow) return []
    return recurringRepo.getByDay(dow)
  }
  return new LocalStoragePlanningRepository(recurringByDay)
}

export function getWeeklyPlan(weekId: string): WeeklyPlan {
  const repo = buildRepo()
  return repo.getOrCreate(weekId)
}

export function saveWeeklyPlan(plan: WeeklyPlan): void {
  const repo = buildRepo()
  repo.saveWeeklyPlan(plan)
  // Dual-write cloud si Supabase configuré et user connecté
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    import('@/lib/sync').then(({ syncWeeklyPlanToCloud }) => {
      syncWeeklyPlanToCloud(plan).catch(() => { /* silently fail */ })
    })
  }
}

export function getAllWeeklyPlans(): WeeklyPlan[] {
  const repo = buildRepo()
  return repo.getAllWeeklyPlans()
}
