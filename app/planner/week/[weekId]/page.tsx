'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { getWeeklyPlan, saveWeeklyPlan } from '@/application/planning/GetWeeklyPlan'
import { WeeklyPlan } from '@/domain/planning/entities/WeeklyPlan'
import { Task } from '@/domain/planning/entities/Task'
import { TASK_STATUSES, TaskStatus } from '@/domain/planning/value-objects/TaskStatus'
import {
  getWeekDates,
  formatDateISO,
  formatDateShort,
  prevWeekId,
  nextWeekId,
  getTodayISO,
} from '@/lib/date-utils'
import { DAYS_FR_SHORT, STATUS_COLORS, MAX_WEEKLY_TASKS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Plus, Trash2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface WeekPageProps {
  params: Promise<{ weekId: string }>
}

export default function WeekPage({ params }: WeekPageProps) {
  const { weekId } = use(params)
  const [plan, setPlan] = useState<WeeklyPlan | null>(null)
  const today = getTodayISO()

  useEffect(() => {
    setPlan(getWeeklyPlan(weekId))
  }, [weekId])

  const save = (updated: WeeklyPlan) => {
    setPlan(updated)
    saveWeeklyPlan(updated)
  }

  const addMainTask = () => {
    if (!plan || plan.mainTasks.length >= MAX_WEEKLY_TASKS) return
    const newTask: Task = {
      id: crypto.randomUUID(),
      designation: '',
      domain: '',
      priority: null,
      estimatedMinutes: null,
      realMinutes: null,
      status: 'À faire',
      remarks: '',
      position: plan.mainTasks.length,
      isRecurring: false,
    }
    save({ ...plan, mainTasks: [...plan.mainTasks, newTask] })
  }

  const updateMainTask = (taskId: string, updated: Partial<Task>) => {
    if (!plan) return
    const mainTasks = plan.mainTasks.map((t) => (t.id === taskId ? { ...t, ...updated } : t))
    save({ ...plan, mainTasks })
  }

  const deleteMainTask = (taskId: string) => {
    if (!plan) return
    const mainTasks = plan.mainTasks.filter((t) => t.id !== taskId)
    save({ ...plan, mainTasks })
  }

  if (!plan) return <div className="p-6 text-muted-foreground text-sm">Chargement...</div>

  const weekDates = getWeekDates(weekId)
  const { year, weekNumber } = plan

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/planner/week/${prevWeekId(weekId)}`}>
          <Button variant="ghost" size="sm"><ChevronLeft size={16} /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">
            Semaine {weekNumber} — {year}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDateShort(formatDateISO(weekDates[0]))} → {formatDateShort(formatDateISO(weekDates[6]))}
          </p>
        </div>
        <Link href="/planner"><Button variant="outline" size="sm" className="border-border">Calendrier</Button></Link>
        <Link href={`/planner/week/${nextWeekId(weekId)}`}>
          <Button variant="ghost" size="sm"><ChevronRight size={16} /></Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-border p-4 space-y-3" style={{ background: 'var(--card)' }}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm text-foreground">
              Tâches de la semaine ({plan.mainTasks.length}/{MAX_WEEKLY_TASKS})
            </h2>
            <Button size="sm" variant="ghost" onClick={addMainTask} className="h-7 px-2">
              <Plus size={14} />
            </Button>
          </div>
          <div className="space-y-2">
            {plan.mainTasks.map((task, idx) => (
              <div key={task.id} className="flex items-center gap-2 group">
                <span className="text-xs text-muted-foreground w-5 text-center">{idx + 1}.</span>
                <Input
                  value={task.designation}
                  onChange={(e) => updateMainTask(task.id, { designation: e.target.value })}
                  placeholder="Tâche principale..."
                  className="h-7 text-xs bg-muted border-border flex-1"
                />
                <Select
                  value={task.status}
                  onValueChange={(v) => updateMainTask(task.id, { status: (v ?? 'À faire') as TaskStatus })}
                >
                  <SelectTrigger className="h-7 text-xs w-28 bg-muted border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        <span style={{ color: STATUS_COLORS[s] }}>{s}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  onClick={() => deleteMainTask(task.id)}
                  className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {plan.mainTasks.length === 0 && (
              <p className="text-xs text-muted-foreground">Aucune tâche hebdo. Ajoutez-en une.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-7 gap-1.5">
            {weekDates.map((date, i) => {
              const dateStr = formatDateISO(date)
              const daily = plan.dailyPlans.find((d) => d.date === dateStr)
              const tasks = daily?.tasks ?? []
              const done = tasks.filter((t) => t.status === 'Fait').length
              const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0
              const isToday = dateStr === today

              return (
                <Link
                  key={dateStr}
                  href={`/planner/day/${dateStr}`}
                  className={cn(
                    'rounded-lg border p-2 hover:border-primary/60 transition-colors flex flex-col gap-1.5',
                    isToday ? 'border-primary' : 'border-border',
                  )}
                  style={{ background: 'var(--card)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{DAYS_FR_SHORT[i]}</span>
                    <span
                      className={cn(
                        'text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full',
                        isToday ? 'bg-primary text-primary-foreground' : 'text-foreground',
                      )}
                    >
                      {date.getDate()}
                    </span>
                  </div>
                  <Progress value={pct} className="h-1" />
                  <div className="space-y-0.5 flex-1">
                    {tasks.slice(0, 4).map((task) => (
                      <div key={task.id} className="flex items-center gap-1">
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: STATUS_COLORS[task.status] }}
                        />
                        <span className="text-xs text-muted-foreground truncate">{task.designation}</span>
                      </div>
                    ))}
                    {tasks.length > 4 && (
                      <p className="text-xs text-muted-foreground">+{tasks.length - 4}</p>
                    )}
                    {tasks.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">Vide</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{tasks.length} tâches</span>
                    <ArrowRight size={10} className="text-muted-foreground" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
