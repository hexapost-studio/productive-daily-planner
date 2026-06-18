import { WeeklyPlan } from '@/domain/planning/entities/WeeklyPlan'
import { DailyPlan } from '@/domain/planning/entities/DailyPlan'
import { Task } from '@/domain/planning/entities/Task'
import { IPlanningRepository } from '@/domain/planning/repositories/IPlanningRepository'
import { LS_PREFIX, MAX_TASKS_PER_DAY, MAX_WEEKLY_TASKS } from '@/lib/constants'
import { getWeekDates, formatDateISO } from '@/lib/date-utils'
import { parseWeekId } from '@/lib/date-utils'
import { RecurringTask } from '@/domain/recurring/entities/RecurringTask'
import { DAYS_FR_FULL } from '@/lib/constants'

function recurringToTask(rt: RecurringTask, position: number): Task {
  return {
    id: `recurring-${rt.id}-${Date.now()}-${position}`,
    designation: rt.designation,
    domain: rt.domain,
    priority: null,
    estimatedMinutes: null,
    realMinutes: null,
    status: 'À faire',
    remarks: rt.remarks,
    position,
    isRecurring: true,
  }
}

function createEmptyDailyPlan(date: string, recurringTasks: RecurringTask[]): DailyPlan {
  const tasks: Task[] = recurringTasks
    .slice(0, MAX_TASKS_PER_DAY)
    .map((rt, i) => recurringToTask(rt, i))
  return { date, tasks }
}

function createEmptyWeeklyPlan(weekId: string, recurringByDay: (day: string) => RecurringTask[]): WeeklyPlan {
  const { year, week } = parseWeekId(weekId)
  const dates = getWeekDates(weekId)
  const startDate = formatDateISO(dates[0])

  const dailyPlans: DailyPlan[] = dates.map((date, i) => {
    const dayName = DAYS_FR_FULL[i]
    const recurring = recurringByDay(dayName)
    return createEmptyDailyPlan(formatDateISO(date), recurring)
  })

  return {
    weekId,
    year,
    weekNumber: week,
    startDate,
    mainTasks: [],
    dailyPlans,
  }
}

export class LocalStoragePlanningRepository implements IPlanningRepository {
  private recurringByDay: (day: string) => RecurringTask[]

  constructor(recurringByDay: (day: string) => RecurringTask[]) {
    this.recurringByDay = recurringByDay
  }

  private key(weekId: string): string {
    return `${LS_PREFIX}weekly_${weekId}`
  }

  getWeeklyPlan(weekId: string): WeeklyPlan | null {
    try {
      const raw = localStorage.getItem(this.key(weekId))
      if (!raw) return null
      return JSON.parse(raw) as WeeklyPlan
    } catch {
      return null
    }
  }

  getOrCreate(weekId: string): WeeklyPlan {
    const existing = this.getWeeklyPlan(weekId)
    if (existing) return existing
    const plan = createEmptyWeeklyPlan(weekId, this.recurringByDay)
    this.saveWeeklyPlan(plan)
    return plan
  }

  saveWeeklyPlan(plan: WeeklyPlan): void {
    try {
      localStorage.setItem(this.key(plan.weekId), JSON.stringify(plan))
    } catch {
      // ignore
    }
  }

  getAllWeeklyPlans(): WeeklyPlan[] {
    try {
      const plans: WeeklyPlan[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith(`${LS_PREFIX}weekly_`)) {
          const raw = localStorage.getItem(k)
          if (raw) {
            try {
              plans.push(JSON.parse(raw) as WeeklyPlan)
            } catch {
              // skip corrupt entry
            }
          }
        }
      }
      return plans.sort((a, b) => a.weekId.localeCompare(b.weekId))
    } catch {
      return []
    }
  }
}

export { MAX_WEEKLY_TASKS }
