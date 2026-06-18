import { DailyPlan } from '@/domain/planning/entities/DailyPlan'
import { getWeeklyPlan, saveWeeklyPlan } from './GetWeeklyPlan'
import { getWeekId } from '@/lib/date-utils'
import { parseISO } from 'date-fns'

export function getDailyPlan(dateStr: string): DailyPlan {
  const weekId = getWeekId(parseISO(dateStr))
  const weekly = getWeeklyPlan(weekId)
  const daily = weekly.dailyPlans.find((d) => d.date === dateStr)
  if (daily) return daily
  const empty: DailyPlan = { date: dateStr, tasks: [] }
  weekly.dailyPlans.push(empty)
  saveWeeklyPlan(weekly)
  return empty
}

export function saveDailyPlan(plan: DailyPlan): void {
  const weekId = getWeekId(parseISO(plan.date))
  const weekly = getWeeklyPlan(weekId)
  const idx = weekly.dailyPlans.findIndex((d) => d.date === plan.date)
  if (idx >= 0) {
    weekly.dailyPlans[idx] = plan
  } else {
    weekly.dailyPlans.push(plan)
  }
  saveWeeklyPlan(weekly)
}
