import { DailyPlan } from './DailyPlan'
import { Task } from './Task'

export interface WeeklyPlan {
  weekId: string
  year: number
  weekNumber: number
  startDate: string
  mainTasks: Task[]
  dailyPlans: DailyPlan[]
}
