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
import { ArrowRight, CheckCircle, Clock, Target } from 'lucide-react'
import { STATUS_COLORS, PROJECT_STATUS_COLORS } from '@/lib/constants'

export default function DashboardPage() {
  const [userName, setUserName] = useState('')
  const [today] = useState(getTodayISO)
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null)
  const [activeProjects, setActiveProjects] = useState<Project[]>([])

  useEffect(() => {
    const repo = new LocalStorageUserRepository()
    setUserName(repo.get().name)
    setDailyPlan(getDailyPlan(today))
    const projs = getProjects().filter((p) => p.status === 'En cours').slice(0, 5)
    setActiveProjects(projs)
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
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Bonjour{userName ? `, ${userName}` : ''} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1 capitalize">{formatDateFR(today)}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Tâches" value={`${tasks.length}`} icon={<Target size={16} />} />
        <StatCard label="Complètes" value={`${doneTasks}`} icon={<CheckCircle size={16} />} color="#10b981" />
        <StatCard label="En cours" value={`${inProgressTasks}`} icon={<Clock size={16} />} color="#6366f1" />
        <StatCard
          label="Estimé"
          value={totalEstimated > 0 ? fmt(totalEstimated) : '—'}
          icon={<Clock size={16} />}
          color="#f59e0b"
        />
      </div>

      <div className="rounded-xl border border-border p-5 space-y-4" style={{ background: 'var(--card)' }}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Aujourd&apos;hui</h2>
          <Link href={`/planner/day/${today}`}>
            <Button size="sm" variant="ghost" className="gap-1">
              Voir le détail <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Progression</span>
            <span>{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-2" />
        </div>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune tâche planifiée.{' '}
            <Link href={`/planner/day/${today}`} className="text-primary hover:underline">
              Planifier ma journée →
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
        <div className="flex gap-2 pt-2">
          <Link href={`/planner/day/${today}`}>
            <Button size="sm" className="gap-1">
              Planifier ma journée <ArrowRight size={14} />
            </Button>
          </Link>
          <Link href={`/planner/week/${getTodayWeekId()}`}>
            <Button size="sm" variant="outline" className="gap-1 border-border">
              Vue semaine <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </div>

      {activeProjects.length > 0 && (
        <div className="rounded-xl border border-border p-5 space-y-4" style={{ background: 'var(--card)' }}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Projets actifs</h2>
            <Link href="/projects">
              <Button size="sm" variant="ghost" className="gap-1">
                Tous les projets <ArrowRight size={14} />
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
                  className="text-xs h-5 border-0 flex-shrink-0"
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

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string
  icon: React.ReactNode
  color?: string
}) {
  return (
    <div className="rounded-xl border border-border p-4" style={{ background: 'var(--card)' }}>
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-2xl font-bold" style={{ color: color ?? 'var(--foreground)' }}>
        {value}
      </p>
    </div>
  )
}

function TaskRow({ task }: { task: Task }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: STATUS_COLORS[task.status] }}
      />
      <span className="text-sm text-foreground flex-1 truncate">{task.designation || '—'}</span>
      <Badge
        variant="outline"
        className="text-xs h-5 border-0 flex-shrink-0"
        style={{
          background: STATUS_COLORS[task.status] + '33',
          color: STATUS_COLORS[task.status],
        }}
      >
        {task.status}
      </Badge>
    </div>
  )
}
