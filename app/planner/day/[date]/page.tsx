'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { getDailyPlan, saveDailyPlan } from '@/application/planning/GetDailyPlan'
import { DailyPlan } from '@/domain/planning/entities/DailyPlan'
import { Task } from '@/domain/planning/entities/Task'
import { formatDateFR, prevDay, nextDay, getTodayISO, getWeekId } from '@/lib/date-utils'
import { parseISO } from 'date-fns'
import { MAX_TASKS_PER_DAY } from '@/lib/constants'
import { TaskCard } from '@/components/planning/TaskCard'
import { TimeTracker } from '@/components/planning/TimeTracker'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from 'lucide-react'

interface DayPageProps {
  params: Promise<{ date: string }>
}

export default function DayPage({ params }: DayPageProps) {
  const { date } = use(params)
  const [plan, setPlan] = useState<DailyPlan | null>(null)
  const today = getTodayISO()
  const isToday = date === today

  useEffect(() => {
    setPlan(getDailyPlan(date))
  }, [date])

  const save = (updated: DailyPlan) => {
    setPlan(updated)
    saveDailyPlan(updated)
  }

  const addTask = () => {
    if (!plan || plan.tasks.length >= MAX_TASKS_PER_DAY) return
    const newTask: Task = {
      id: crypto.randomUUID(),
      designation: '',
      domain: '',
      priority: null,
      estimatedMinutes: null,
      realMinutes: null,
      status: 'À faire',
      remarks: '',
      position: plan.tasks.length,
      isRecurring: false,
    }
    save({ ...plan, tasks: [...plan.tasks, newTask] })
  }

  const updateTask = (taskId: string, updated: Task) => {
    if (!plan) return
    const tasks = plan.tasks.map((t) => (t.id === taskId ? updated : t))
    save({ ...plan, tasks })
  }

  const deleteTask = (taskId: string) => {
    if (!plan) return
    const tasks = plan.tasks
      .filter((t) => t.id !== taskId)
      .map((t, i) => ({ ...t, position: i }))
    save({ ...plan, tasks })
  }

  if (!plan) return <div className="p-6 text-muted-foreground text-sm">Chargement...</div>

  const tasks = plan.tasks
  const done = tasks.filter((t) => t.status === 'Fait').length
  const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0
  const weekId = getWeekId(parseISO(date))

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/planner/day/${prevDay(date)}`}>
          <Button variant="ghost" size="sm"><ChevronLeft size={16} /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground capitalize">
              {formatDateFR(date)}
            </h1>
            {isToday && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
                Aujourd&apos;hui
              </span>
            )}
          </div>
        </div>
        <Link href={`/planner/week/${weekId}`}>
          <Button variant="outline" size="sm" className="gap-1 border-border">
            <CalendarDays size={14} /> Semaine
          </Button>
        </Link>
        <Link href={`/planner/day/${nextDay(date)}`}>
          <Button variant="ghost" size="sm"><ChevronRight size={16} /></Button>
        </Link>
      </div>

      <TimeTracker tasks={tasks} />

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Progression du jour</span>
          <span>{pct}% ({done}/{tasks.length})</span>
        </div>
        <Progress value={pct} className="h-2" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">
            Tâches ({tasks.length}/{MAX_TASKS_PER_DAY})
          </h2>
          <Button
            size="sm"
            onClick={addTask}
            disabled={tasks.length >= MAX_TASKS_PER_DAY}
            className="gap-1"
          >
            <Plus size={14} /> Ajouter
          </Button>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground text-sm">Aucune tâche pour cette journée.</p>
            <Button size="sm" onClick={addTask} className="mt-3 gap-1">
              <Plus size={14} /> Ajouter la première tâche
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onChange={(updated) => updateTask(task.id, updated)}
                onDelete={() => deleteTask(task.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
