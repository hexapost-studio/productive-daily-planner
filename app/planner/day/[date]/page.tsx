'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { getDailyPlan, saveDailyPlan } from '@/application/planning/GetDailyPlan'
import { DailyPlan } from '@/domain/planning/entities/DailyPlan'
import { Task } from '@/domain/planning/entities/Task'
import { formatDateFR, prevDay, nextDay, getTodayISO, getWeekId } from '@/lib/date-utils'
import { parseISO } from 'date-fns'
import { MAX_TASKS_PER_DAY } from '@/lib/constants'
import { SortableTaskList } from '@/components/planning/SortableTaskList'
import { TimeTracker } from '@/components/planning/TimeTracker'
import { TimelineView } from '@/components/planning/TimelineView'
import { CalendarEvents } from '@/components/planning/CalendarEvents'
import { MorningRitual } from '@/components/planning/MorningRitual'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Plus, CalendarDays, Sparkles, ListTodo, List, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PRIORITIES } from '@/domain/planning/value-objects/Priority'
import { useRouter } from 'next/navigation'
import { useSwipe } from '@/hooks/useSwipe'
import { useAnnounce } from '@/hooks/useAnnounce'

interface DayPageProps {
  params: Promise<{ date: string }>
}

function makeTask(position: number): Task {
  return {
    id: crypto.randomUUID(),
    designation: '',
    domain: '',
    priority: null,
    estimatedMinutes: null,
    realMinutes: null,
    status: 'À faire',
    remarks: '',
    position,
    isRecurring: false,
  }
}

export default function DayPage({ params }: DayPageProps) {
  const { date } = use(params)
  const [plan, setPlan] = useState<DailyPlan | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list')
  const [showRitual, setShowRitual] = useState(false)
  const today = getTodayISO()
  const isToday = date === today
  const router = useRouter()
  const announce = useAnnounce()
  const swipeHandlers = useSwipe(
    () => router.push(`/planner/day/${nextDay(date)}`),
    () => router.push(`/planner/day/${prevDay(date)}`),
  )

  useEffect(() => {
    const loaded = getDailyPlan(date)
    setPlan(loaded)
    if (isToday && loaded.tasks.length === 0) {
      const done = sessionStorage.getItem(`ritual_done_${date}`)
      if (!done) setShowRitual(true)
    }
  }, [date, isToday])

  const save = (updated: DailyPlan) => {
    setPlan(updated)
    saveDailyPlan(updated)
  }

  const addTaskAt = (afterIndex: number) => {
    if (!plan || plan.tasks.length >= MAX_TASKS_PER_DAY) return
    const newTask = makeTask(afterIndex + 1)
    const before = plan.tasks.slice(0, afterIndex + 1)
    const after = plan.tasks.slice(afterIndex + 1).map((t, i) => ({ ...t, position: afterIndex + 2 + i }))
    save({ ...plan, tasks: [...before, newTask, ...after] })
  }

  const addTask = () => {
    if (!plan || plan.tasks.length >= MAX_TASKS_PER_DAY) return
    save({ ...plan, tasks: [...plan.tasks, makeTask(plan.tasks.length)] })
    announce('Nouvelle tâche ajoutée')
  }

  const updateTask = (taskId: string, updated: Task) => {
    if (!plan) return
    const prev = plan.tasks.find((t) => t.id === taskId)
    save({ ...plan, tasks: plan.tasks.map((t) => (t.id === taskId ? updated : t)) })
    if (prev && prev.status !== updated.status) {
      announce(`Tâche "${updated.designation || 'sans titre'}" — statut : ${updated.status}`)
    }
  }

  const deleteTask = (taskId: string) => {
    if (!plan) return
    const task = plan.tasks.find((t) => t.id === taskId)
    save({ ...plan, tasks: plan.tasks.filter((t) => t.id !== taskId).map((t, i) => ({ ...t, position: i })) })
    announce(`Tâche "${task?.designation || 'sans titre'}" supprimée`, 'assertive')
  }

  const reorderTasks = (reordered: Task[]) => {
    if (!plan) return
    save({ ...plan, tasks: reordered })
  }

  const handleRitualComplete = (data: { availableHours: number; intentions: string[] }) => {
    sessionStorage.setItem(`ritual_done_${date}`, '1')
    setShowRitual(false)
    if (plan && plan.tasks.length === 0 && data.intentions.length > 0) {
      const intentionTasks: Task[] = data.intentions.map((designation, i) => ({
        id: crypto.randomUUID(),
        designation,
        domain: '',
        priority: PRIORITIES[i] ?? null,
        estimatedMinutes: null,
        realMinutes: null,
        status: 'À faire' as const,
        remarks: '',
        position: i,
        isRecurring: false,
      }))
      save({ ...plan, tasks: intentionTasks })
    }
  }

  if (!plan) return <div className="p-4 text-muted-foreground text-sm">Chargement...</div>

  const tasks = plan.tasks
  const done = tasks.filter((t) => t.status === 'Fait').length
  const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0
  const weekId = getWeekId(parseISO(date))

  return (
    <div className="p-4 md:p-5 lg:p-6 max-w-none mx-auto" {...swipeHandlers}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 md:mb-5">
        <Link href={`/planner/day/${prevDay(date)}`}>
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0"><ChevronLeft size={18} /></Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base md:text-xl font-bold text-foreground capitalize truncate">
              {formatDateFR(date)}
            </h1>
            {isToday && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                Aujourd&apos;hui
              </span>
            )}
          </div>
        </div>
        <Link href={`/planner/week/${weekId}`}>
          <Button variant="outline" size="sm" className="gap-1 border-border h-10 text-xs">
            <CalendarDays size={13} />
            <span className="hidden sm:inline">Semaine</span>
          </Button>
        </Link>
        <Link href={`/planner/day/${nextDay(date)}`}>
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0"><ChevronRight size={18} /></Button>
        </Link>
      </div>

      {/* Stats + progress */}
      <div className="space-y-4 mb-4 md:mb-5">
        <CalendarEvents date={date} />
        <TimeTracker tasks={tasks} />
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progression du jour</span>
            <span>{pct}% ({done}/{tasks.length})</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>
      </div>

      {/* 2-col layout on md+ : tasks | timeline */}
      <div className="md:grid md:grid-cols-[1fr_320px] lg:grid-cols-[1fr_360px] md:gap-5 space-y-4 md:space-y-0">
        {/* LEFT — task list */}
        <div className="space-y-3 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-sm md:text-base text-foreground flex-1">
              Tâches ({tasks.length}/{MAX_TASKS_PER_DAY})
            </h2>
            {/* Toggle visible mobile uniquement */}
            {tasks.length > 0 && (
              <div className="flex md:hidden items-center rounded-lg border border-border p-0.5 bg-muted">
                <button
                  onClick={() => setViewMode('list')}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    viewMode === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
                >
                  <List size={13} /> Liste
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    viewMode === 'timeline' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
                >
                  <BarChart2 size={13} /> Timeline
                </button>
              </div>
            )}
            <Button size="sm" onClick={addTask} disabled={tasks.length >= MAX_TASKS_PER_DAY} className="gap-1 h-9">
              <Plus size={14} /> Ajouter
            </Button>
          </div>

          {/* Mobile: toggle. Tablet+: toujours liste */}
          {(viewMode === 'timeline' && tasks.length > 0) && (
            <div className="md:hidden">
              <TimelineView
                tasks={tasks}
                date={date}
                onUpdateTask={(taskId, updated) => {
                  const task = tasks.find((t) => t.id === taskId)
                  if (task) updateTask(taskId, { ...task, ...updated })
                }}
              />
            </div>
          )}

          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 border border-dashed border-border rounded-2xl gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-primary/10">
                <ListTodo size={28} className="text-primary" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-semibold text-foreground text-sm">
                  {isToday ? 'Ta journée est vierge' : 'Aucune tâche ce jour-là'}
                </p>
                <p className="text-xs text-muted-foreground max-w-[220px]">
                  {isToday ? 'Commence par ajouter ta première tâche du jour' : 'Planifie cette journée en ajoutant des tâches'}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                <Button size="sm" onClick={addTask} className="gap-1.5 h-10"><Plus size={14} /> Première tâche</Button>
                {isToday && (
                  <Button size="sm" variant="outline" onClick={() => setShowRitual(true)} className="gap-1.5 h-10 border-border text-xs">
                    <Sparkles size={13} /> Rituel matinal
                  </Button>
                )}
                <Link href="/settings">
                  <Button size="sm" variant="outline" className="gap-1.5 h-10 border-border text-xs">Tâches récurrentes</Button>
                </Link>
              </div>
            </div>
          )}

          {(viewMode === 'list' || true) && tasks.length > 0 && (
            <SortableTaskList
            tasks={tasks}
            date={date}
            onReorder={reorderTasks}
            onChange={updateTask}
            onDelete={deleteTask}
            onInsertAt={addTaskAt}
            maxReached={tasks.length >= MAX_TASKS_PER_DAY}
          />
          )}
        </div>

        {/* RIGHT — timeline always visible on md+ */}
        <div className="hidden md:block">
          <div className="sticky top-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <BarChart2 size={12} /> Timeline
            </p>
            <TimelineView
              tasks={tasks}
              date={date}
              onUpdateTask={(taskId, updated) => {
                const task = tasks.find((t) => t.id === taskId)
                if (task) updateTask(taskId, { ...task, ...updated })
              }}
            />
          </div>
        </div>
      </div>

      {showRitual && isToday && (
        <MorningRitual
          onComplete={handleRitualComplete}
          onSkip={() => { sessionStorage.setItem(`ritual_done_${date}`, '1'); setShowRitual(false) }}
        />
      )}

      {/* FAB mobile — au-dessus de la bottom nav */}
      <button
        onClick={addTask}
        disabled={tasks.length >= MAX_TASKS_PER_DAY}
        aria-label="Ajouter une tâche"
        className="md:hidden fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 transition-transform active:scale-95"
        style={{ boxShadow: '0 4px 20px rgba(99,102,241,0.45)' }}
      >
        <Plus size={24} />
      </button>
    </div>
  )
}
