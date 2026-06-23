'use client'

import { WeeklyPlan } from '@/domain/planning/entities/WeeklyPlan'
import { LS_PREFIX } from '@/lib/constants'

let supabase: ReturnType<typeof import('@/lib/supabase/client').createClient> | null = null

async function getSupabase() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null
  if (!supabase) {
    const { createClient } = await import('@/lib/supabase/client')
    supabase = createClient()
  }
  return supabase
}

async function getUser() {
  const sb = await getSupabase()
  if (!sb) return null
  const { data } = await sb.auth.getUser()
  return data.user ?? null
}

// ── Sync plan hebdo ────────────────────────────────────────────────────

export async function syncWeeklyPlanToCloud(plan: WeeklyPlan): Promise<void> {
  const sb = await getSupabase()
  const user = await getUser()
  if (!sb || !user) return
  try {
    await sb.from('weekly_plans').upsert({
      user_id: user.id,
      week_id: plan.weekId,
      year: plan.year,
      week_number: plan.weekNumber,
      start_date: plan.startDate,
      main_tasks: plan.mainTasks,
      daily_plans: plan.dailyPlans,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,week_id' })
  } catch { /* silently fail — localStorage is source of truth */ }
}

// ── Migration localStorage → Supabase ─────────────────────────────────

export async function migrateLocalToCloud(): Promise<{ synced: number }> {
  const sb = await getSupabase()
  const user = await getUser()
  if (!sb || !user) return { synced: 0 }

  let synced = 0
  const plans: WeeklyPlan[] = []

  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k?.startsWith(`${LS_PREFIX}weekly_`)) continue
    try {
      const raw = localStorage.getItem(k)
      if (raw) plans.push(JSON.parse(raw) as WeeklyPlan)
    } catch { /* skip */ }
  }

  for (const plan of plans) {
    try {
      await sb.from('weekly_plans').upsert({
        user_id: user.id,
        week_id: plan.weekId,
        year: plan.year,
        week_number: plan.weekNumber,
        start_date: plan.startDate,
        main_tasks: plan.mainTasks,
        daily_plans: plan.dailyPlans,
      }, { onConflict: 'user_id,week_id' })
      synced++
    } catch { /* skip */ }
  }

  // Projets
  try {
    const raw = localStorage.getItem(`${LS_PREFIX}projects`)
    if (raw) {
      const projects = JSON.parse(raw) as Array<Record<string, unknown>>
      for (const p of projects) {
        await sb.from('projects').upsert({
          id: p.id,
          user_id: user.id,
          position: p.position,
          designation: p.designation,
          type: p.type,
          priority: p.priority,
          impact_level: p.impactLevel,
          start_date: p.startDate,
          deadline: p.deadline,
          status: p.status,
          progress: p.progress,
          key_people: p.keyPeople,
          comments: p.comments,
        }, { onConflict: 'id' })
      }
    }
  } catch { /* skip */ }

  return { synced }
}

// ── Chargement Supabase → localStorage (au login) ──────────────────────

export async function pullCloudToLocal(): Promise<void> {
  const sb = await getSupabase()
  const user = await getUser()
  if (!sb || !user) return

  try {
    const { data: plans } = await sb
      .from('weekly_plans')
      .select('*')
      .eq('user_id', user.id)

    for (const p of plans ?? []) {
      const plan: WeeklyPlan = {
        weekId: p.week_id,
        year: p.year,
        weekNumber: p.week_number,
        startDate: p.start_date,
        mainTasks: p.main_tasks ?? [],
        dailyPlans: p.daily_plans ?? [],
      }
      localStorage.setItem(`${LS_PREFIX}weekly_${plan.weekId}`, JSON.stringify(plan))
    }
  } catch { /* silently fail */ }
}
