'use client'

import { useEffect, useState, use, useRef } from 'react'
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
import { ChevronLeft, ChevronRight, Plus, Trash2, ArrowRight, ChevronDown, Printer } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface WeekPageProps {
  params: Promise<{ weekId: string }>
}

export default function WeekPage({ params }: WeekPageProps) {
  const { weekId } = use(params)
  const [plan, setPlan] = useState<WeeklyPlan | null>(null)
  const [selectedDayIdx, setSelectedDayIdx] = useState(0)
  const [mainTasksOpen, setMainTasksOpen] = useState(false)
  const today = getTodayISO()
  const chipsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const p = getWeeklyPlan(weekId)
    setPlan(p)
    // Default to today if in this week
    const weekDates = getWeekDates(weekId)
    const todayIdx = weekDates.findIndex((d) => formatDateISO(d) === today)
    if (todayIdx >= 0) setSelectedDayIdx(todayIdx)
  }, [weekId, today])

  useEffect(() => {
    const container = chipsRef.current
    if (!container) return
    const chip = container.children[selectedDayIdx] as HTMLElement | undefined
    chip?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [selectedDayIdx])

  const save = (updated: WeeklyPlan) => { setPlan(updated); saveWeeklyPlan(updated) }

  const addMainTask = () => {
    if (!plan || plan.mainTasks.length >= MAX_WEEKLY_TASKS) return
    const newTask: Task = {
      id: crypto.randomUUID(), designation: '', domain: '', priority: null,
      estimatedMinutes: null, realMinutes: null, status: 'À faire', remarks: '',
      position: plan.mainTasks.length, isRecurring: false,
    }
    save({ ...plan, mainTasks: [...plan.mainTasks, newTask] })
  }

  const updateMainTask = (taskId: string, updated: Partial<Task>) => {
    if (!plan) return
    save({ ...plan, mainTasks: plan.mainTasks.map((t) => (t.id === taskId ? { ...t, ...updated } : t)) })
  }

  const deleteMainTask = (taskId: string) => {
    if (!plan) return
    save({ ...plan, mainTasks: plan.mainTasks.filter((t) => t.id !== taskId) })
  }

  if (!plan) return <div className="p-4 text-muted-foreground text-sm">Chargement...</div>

  const weekDates = getWeekDates(weekId)
  const { year, weekNumber } = plan

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link href={`/planner/week/${prevWeekId(weekId)}`}>
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0"><ChevronLeft size={18} /></Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg md:text-xl font-bold text-foreground">
            Semaine {weekNumber} — {year}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 hidden md:block">
            {formatDateShort(formatDateISO(weekDates[0]))} → {formatDateShort(formatDateISO(weekDates[6]))}
          </p>
        </div>
        <Link href="/planner">
          <Button variant="outline" size="sm" className="border-border h-10 text-xs hidden md:flex">Calendrier</Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          className="border-border h-10 text-xs gap-1 no-print"
          onClick={() => window.print()}
        >
          <Printer size={13} />
          <span className="hidden md:inline">Exporter PDF</span>
        </Button>
        <Link href={`/planner/week/${nextWeekId(weekId)}`}>
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0"><ChevronRight size={18} /></Button>
        </Link>
      </div>

      {/* Mobile: collapsible main tasks + day tabs */}
      <div className="md:hidden">
        {/* Main tasks accordéon */}
        <button
          onClick={() => setMainTasksOpen((o) => !o)}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-card text-sm font-medium min-h-[44px]"
        >
          <span>Tâches de la semaine ({plan.mainTasks.length}/{MAX_WEEKLY_TASKS})</span>
          <ChevronDown size={16} className={cn('transition-transform', mainTasksOpen && 'rotate-180')} />
        </button>
        {mainTasksOpen && (
          <div className="mt-2 rounded-lg border border-border p-3 space-y-2 bg-card">
            {plan.mainTasks.map((task, idx) => (
              <div key={task.id} className="flex items-center gap-2 group">
                <span className="text-xs text-muted-foreground w-5 text-center">{idx + 1}.</span>
                <Input
                  value={task.designation}
                  onChange={(e) => updateMainTask(task.id, { designation: e.target.value })}
                  placeholder="Tâche principale..."
                  className="h-10 text-sm bg-muted border-border flex-1"
                />
                <button
                  onClick={() => deleteMainTask(task.id)}
                  className="p-2 rounded text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {plan.mainTasks.length === 0 && (
              <p className="text-xs text-muted-foreground">Aucune tâche hebdo.</p>
            )}
            <Button size="sm" variant="ghost" onClick={addMainTask} className="h-10 w-full gap-1">
              <Plus size={14} /> Ajouter
            </Button>
          </div>
        )}

        {/* Day chips */}
        <div
          ref={chipsRef}
          className="flex gap-1.5 mt-3 overflow-x-auto pb-1"
          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'] }}
        >
          {weekDates.map((date, i) => {
            const dateStr = formatDateISO(date)
            const isToday = dateStr === today
            const isSelected = i === selectedDayIdx
            const daily = plan.dailyPlans.find((d) => d.date === dateStr)
            const taskCount = daily?.tasks.length ?? 0

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDayIdx(i)}
                style={{ scrollSnapAlign: 'start' }}
                className={cn(
                  'flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-lg border text-xs font-medium transition-colors min-h-[52px] min-w-[44px]',
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : isToday
                    ? 'border-primary text-primary bg-primary/10'
                    : 'border-border text-muted-foreground bg-card hover:bg-accent',
                )}
              >
                <span>{DAYS_FR_SHORT[i]}</span>
                <span className="text-sm font-bold">{date.getDate()}</span>
                {taskCount > 0 && (
                  <span className={cn('text-[9px] mt-0.5', isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                    {taskCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Selected day preview */}
        {(() => {
          const dateStr = formatDateISO(weekDates[selectedDayIdx])
          const daily = plan.dailyPlans.find((d) => d.date === dateStr)
          const tasks = daily?.tasks ?? []
          const done = tasks.filter((t) => t.status === 'Fait').length
          const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0

          return (
            <div className="mt-3 rounded-xl border border-border p-4 space-y-3 bg-card">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm capitalize">
                  {DAYS_FR_SHORT[selectedDayIdx]} {weekDates[selectedDayIdx].getDate()}
                </p>
                <Link href={`/planner/day/${dateStr}`}>
                  <Button size="sm" className="gap-1 h-9 text-xs">
                    Planifier <ArrowRight size={12} />
                  </Button>
                </Link>
              </div>
              {tasks.length > 0 && <Progress value={pct} className="h-1.5" />}
              <div className="space-y-1.5">
                {tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[task.status] }} />
                    <span className="text-sm text-foreground truncate flex-1">{task.designation || '—'}</span>
                  </div>
                ))}
                {tasks.length > 5 && <p className="text-xs text-muted-foreground">+{tasks.length - 5}</p>}
                {tasks.length === 0 && <p className="text-xs text-muted-foreground italic">Vide — tap Planifier pour ajouter</p>}
              </div>
            </div>
          )
        })()}
      </div>

      {/* Desktop: original 2-col layout */}
      <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-border p-4 space-y-3 bg-card">
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
                  className="p-1 rounded text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
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
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[task.status] }} />
                        <span className="text-xs text-muted-foreground truncate">{task.designation}</span>
                      </div>
                    ))}
                    {tasks.length > 4 && <p className="text-xs text-muted-foreground">+{tasks.length - 4}</p>}
                    {tasks.length === 0 && <p className="text-xs text-muted-foreground italic">Vide</p>}
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
