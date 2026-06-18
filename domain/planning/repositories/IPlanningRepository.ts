import { WeeklyPlan } from '../entities/WeeklyPlan'

export interface IPlanningRepository {
  getWeeklyPlan(weekId: string): WeeklyPlan | null
  saveWeeklyPlan(plan: WeeklyPlan): void
  getAllWeeklyPlans(): WeeklyPlan[]
}
