'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getDailyPlan } from '@/application/planning/GetDailyPlan'
import { getProjects } from '@/application/projects/GetProjects'
import { LocalStorageUserRepository } from '@/infrastructure/persistence/LocalStorageUserRepository'
import { DailyPlan } from '@/domain/planning/entities/DailyPlan'
import { Project } from '@/domain/projects/entities/Project'
import { Task } from '@/domain/planning/entities/Task'
import { getTodayISO, formatDateFR, getTodayWeekId } from '@/lib/date-utils'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle, Clock, Target, BookOpen } from 'lucide-react'
import { STATUS_COLORS, PROJECT_STATUS_COLORS, LS_PREFIX } from '@/lib/constants'

interface WeekLogbook { doneTasks: number; totalTasks: number; totalRealMin: number }

function getWeekLogbook(): WeekLogbook {
  try {
    const weekId = getTodayWeekId()
    const raw = localStorage.getItem(`${LS_PREFIX}weekly_${weekId}`)
    if (!raw) return { doneTasks: 0, totalTasks: 0, totalRealMin: 0 }
    const plan = JSON.parse(raw) as { dailyPlans?: Array<{ tasks: Array<{ status: string; realMinutes?: number | null }> }> }
    const allTasks = plan.dailyPlans?.flatMap((d) => d.tasks) ?? []
    return {
      doneTasks: allTasks.filter((t) => t.status === 'Fait').length,
      totalTasks: allTasks.length,
      totalRealMin: allTasks.reduce((a, t) => a + (t.realMinutes ?? 0), 0),
    }
  } catch { return { doneTasks: 0, totalTasks: 0, totalRealMin: 0 } }
}

export default function DashboardPage() {
  const [userName, setUserName] = useState('')
  const [today] = useState(getTodayISO)
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null)
  const [activeProjects, setActiveProjects] = useState<Project[]>([])
  const [logbook, setLogbook] = useState<WeekLogbook>({ doneTasks: 0, totalTasks: 0, totalRealMin: 0 })

  useEffect(() => {
    const repo = new LocalStorageUserRepository()
    setUserName(repo.get().name)
    setDailyPlan(getDailyPlan(today))
    const projs = getProjects().filter((p) => p.status === 'En cours').slice(0, 5)
    setActiveProjects(projs)
    setLogbook(getWeekLogbook())
  }, [today])

  const tasks = dailyPlan?.tasks ?? []
  const doneTasks = tasks.filter((t) => t.status === 'Fait').length
  const inProgressTasks = tasks.filter((t) => t.status === 'En cours').length
  const progressPct = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0

  const totalEstimated = tasks.reduce((acc, t) => acc + (t.estimatedMinutes ?? 0), 0)
  const fmt = (min: number) => {
    const h = Math.floor(min / 60)
    const m = min % 60
    return h > 0 ? `${h}h${m > 0 ? m + 'min' : ''}` : `${m}min`
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-5 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          Bonjour{userName ? `, ${userName}` : ''} 👋
        </h1>
        <p className="text-muted-foreground text-xs md:text-sm mt-1">
          <time dateTime={today} className="capitalize">{formatDateFR(today)}</time>
        </p>
      </div>

      {/* Stats — 2x2 mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Tâches" value={`${tasks.length}`} icon={<Target size={15} />} />
        <StatCard label="Complètes" value={`${doneTasks}`} icon={<CheckCircle size={15} />} color="#10b981" />
        <StatCard label="En cours" value={`${inProgressTasks}`} icon={<Clock size={15} />} color="#6366f1" />
        <StatCard
          label="Estimé"
          value={totalEstimated > 0 ? fmt(totalEstimated) : '—'}
          icon={<Clock size={15} />}
          color="#f59e0b"
        />
      </div>

      {/* Today card */}
      <div className="rounded-xl border border-border p-4 md:p-5 space-y-3 md:space-y-4" style={{ background: 'var(--card)' }}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm md:text-base text-foreground">Aujourd&apos;hui</h2>
          <Link href={`/planner/day/${today}`}>
            <Button size="sm" variant="ghost" className="gap-1 text-xs h-8">
              Détail <ArrowRight size={12} />
            </Button>
          </Link>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Progression</span>
            <span>{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-2" aria-label={`Progression du jour : ${progressPct}%`} />
        </div>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune tâche planifiée.{' '}
            <Link href={`/planner/day/${today}`} className="text-primary hover:underline">
              Planifier →
            </Link>
          </p>
        ) : (
          <div className="space-y-1">
            {tasks.slice(0, 5).map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
            {tasks.length > 5 && (
              <p className="text-xs text-muted-foreground pt-1">+{tasks.length - 5} autres tâches</p>
            )}
          </div>
        )}
        <div className="flex gap-2 pt-1 flex-wrap">
          <Link href={`/planner/day/${today}`}>
            <Button size="sm" className="gap-1 h-10 text-sm">
              Planifier ma journée <ArrowRight size={13} />
            </Button>
          </Link>
          <Link href={`/planner/week/${getTodayWeekId()}`}>
            <Button size="sm" variant="outline" className="gap-1 border-border h-10 text-sm">
              Vue semaine <ArrowRight size={13} />
            </Button>
          </Link>
        </div>
      </div>

      {/* Logbook semaine — pattern Things 3 */}
      {logbook.totalTasks > 0 && (
        <div className="rounded-xl border border-border p-4 md:p-5" style={{ background: 'var(--card)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-primary" />
              <h2 className="font-semibold text-sm md:text-base text-foreground">Bilan de la semaine</h2>
            </div>
            <Link href={`/planner/week/${getTodayWeekId()}`}>
              <Button size="sm" variant="ghost" className="gap-1 text-xs h-8">
                Voir <ArrowRight size={12} />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{logbook.doneTasks}</p>
              <p className="text-xs text-muted-foreground mt-0.5">tâches faites</p>
            </div>
            <div className="text-center border-x border-border">
              <p className="text-2xl font-bold text-foreground">{logbook.totalTasks}</p>
              <p className="text-xs text-muted-foreground mt-0.5">au total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {logbook.totalRealMin > 0
                  ? `${Math.floor(logbook.totalRealMin / 60)}h${logbook.totalRealMin % 60 > 0 ? logbook.totalRealMin % 60 : ''}`
                  : '—'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">de travail réel</p>
            </div>
          </div>
          {logbook.doneTasks > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Taux de complétion</span>
                <span>{Math.round((logbook.doneTasks / logbook.totalTasks) * 100)}%</span>
              </div>
              <Progress value={Math.round((logbook.doneTasks / logbook.totalTasks) * 100)} className="h-1.5" aria-label="Taux de complétion de la semaine" />
            </div>
          )}
        </div>
      )}

      {/* Active projects */}
      {activeProjects.length > 0 && (
        <div className="rounded-xl border border-border p-4 md:p-5 space-y-3 md:space-y-4" style={{ background: 'var(--card)' }}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm md:text-base text-foreground">Projets actifs</h2>
            <Link href="/projects">
              <Button size="sm" variant="ghost" className="gap-1 text-xs h-8">
                Tous <ArrowRight size={12} />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {activeProjects.map((project) => (
              <div key={project.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground truncate">{project.designation}</p>
                    <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-1.5" />
                </div>
                <Badge
                  variant="outline"
                  className="text-xs h-5 border-0 flex-shrink-0 hidden sm:inline-flex"
                  style={{
                    background: PROJECT_STATUS_COLORS[project.status] + '33',
                    color: PROJECT_STATUS_COLORS[project.status],
                  }}
                >
                  {project.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color?: string }) {
  return (
    <div className="rounded-xl border border-border p-3 md:p-4" style={{ background: 'var(--card)' }}>
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-xl md:text-2xl font-bold" style={{ color: color ?? 'var(--foreground)' }}>
        {value}
      </p>
    </div>
  )
}

function TaskRow({ task }: { task: Task }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[task.status] }} />
      <span className="text-sm text-foreground flex-1 truncate">{task.designation || '—'}</span>
      <Badge
        variant="outline"
        className="text-xs h-5 border-0 flex-shrink-0 hidden xs:inline-flex"
        style={{ background: STATUS_COLORS[task.status] + '33', color: STATUS_COLORS[task.status] }}
      >
        {task.status}
      </Badge>
    </div>
  )
}
