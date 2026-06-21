'use client'

import { createClient } from '@/lib/supabase/client'
import { WeeklyPlan } from '@/domain/planning/entities/WeeklyPlan'
import { getWeekDates, formatDateISO } from '@/lib/date-utils'

export async function getWeeklyPlanCloud(weekId: string): Promise<WeeklyPlan | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('week_id', weekId)
    .single()

  if (error || !data) return null
  return {
    weekId: data.week_id,
    year: data.year,
    weekNumber: data.week_number,
    startDate: data.start_date,
    mainTasks: data.main_tasks ?? [],
    dailyPlans: data.daily_plans ?? [],
  }
}

export async function saveWeeklyPlanCloud(plan: WeeklyPlan): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('weekly_plans').upsert({
    user_id: user.id,
    week_id: plan.weekId,
    year: plan.year,
    week_number: plan.weekNumber,
    start_date: plan.startDate,
    main_tasks: plan.mainTasks,
    daily_plans: plan.dailyPlans,
  }, { onConflict: 'user_id,week_id' })
}

export async function getProjectsCloud() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('position')
  if (error || !data) return null
  return data.map((p) => ({
    id: p.id,
    position: p.position,
    designation: p.designation,
    type: p.type,
    priority: p.priority,
    impactLevel: p.impact_level,
    startDate: p.start_date,
    deadline: p.deadline,
    status: p.status,
    progress: p.progress,
    keyPeople: p.key_people,
    comments: p.comments,
  }))
}
