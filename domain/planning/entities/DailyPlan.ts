import { Task } from './Task'

export type JournalMood = 'great' | 'good' | 'okay' | 'hard'

export interface DailyPlan {
  date: string
  tasks: Task[]
  journal?: string
  mood?: JournalMood
}
