'use client'

import { useEffect, useState, use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getDailyPlan, saveDailyPlan } from '@/application/planning/GetDailyPlan'
import { Task } from '@/domain/planning/entities/Task'
import { DailyPlan } from '@/domain/planning/entities/DailyPlan'
import { PRIORITY_COLORS, STATUS_COLORS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { CheckCircle, ChevronLeft, ChevronRight, X, Play, Pause, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FocusPageProps {
  params: Promise<{ date: string; taskId: string }>
}

export default function FocusPage({ params }: FocusPageProps) {
  const { date, taskId } = use(params)
  const router = useRouter()
  const [plan, setPlan] = useState<DailyPlan | null>(null)
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setPlan(getDailyPlan(date))
  }, [date])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const task = plan?.tasks.find((t) => t.id === taskId)
  const taskIndex = plan?.tasks.findIndex((t) => t.id === taskId) ?? -1
  const allTasks = plan?.tasks ?? []
  const prevTask = taskIndex > 0 ? allTasks[taskIndex - 1] : null
  const nextTask = taskIndex < allTasks.length - 1 ? allTasks[taskIndex + 1] : null

  const markDone = () => {
    if (!plan || !task) return
    const realMinutes = Math.round(seconds / 60) || task.realMinutes
    const updated: Task = { ...task, status: 'Fait', realMinutes }
    const tasks = plan.tasks.map((t) => (t.id === taskId ? updated : t))
    const newPlan = { ...plan, tasks }
    saveDailyPlan(newPlan)
    setPlan(newPlan)
    setRunning(false)
    setDone(true)
  }

  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const estimatedSec = (task?.estimatedMinutes ?? 0) * 60
  const progress = estimatedSec > 0 ? Math.min((seconds / estimatedSec) * 100, 100) : 0
  const circumference = 2 * Math.PI * 88

  if (!plan) return null

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <p className="text-muted-foreground">Tâche introuvable</p>
      </div>
    )
  }

  const priorityColor = task.priority ? PRIORITY_COLORS[task.priority] : 'var(--primary)'

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col overflow-y-auto"
      style={{ background: 'var(--background)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/planner/day/${date}`)}
          className="gap-2 text-muted-foreground hover:text-foreground h-10"
        >
          <X size={16} /> Quitter le focus
        </Button>
        <span className="text-xs text-muted-foreground">
          {taskIndex + 1} / {allTasks.length}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 pb-16">

        {/* Timer ring */}
        <div className="relative w-52 h-52 md:w-64 md:h-64">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            {/* Track */}
            <circle
              cx="100" cy="100" r="88"
              fill="none"
              stroke="var(--border)"
              strokeWidth="8"
            />
            {/* Progress */}
            <circle
              cx="100" cy="100" r="88"
              fill="none"
              stroke={done ? '#10b981' : priorityColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (circumference * (done ? 100 : progress)) / 100}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            {done ? (
              <CheckCircle size={48} className="text-green-500" />
            ) : (
              <>
                <span className="text-3xl md:text-4xl font-mono font-bold text-foreground">
                  {fmt(seconds)}
                </span>
                {task.estimatedMinutes && (
                  <span className="text-xs text-muted-foreground">
                    / {task.estimatedMinutes}min estimé
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Task info */}
        <div className="text-center space-y-3 max-w-lg">
          {task.priority && (
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: priorityColor + '22', color: priorityColor }}
            >
              {task.priority}
            </span>
          )}
          <h1 className={cn(
            'text-2xl md:text-3xl font-bold leading-snug transition-all',
            done ? 'line-through text-muted-foreground' : 'text-foreground',
          )}>
            {task.designation || 'Tâche sans titre'}
          </h1>
          {task.domain && (
            <p className="text-sm text-muted-foreground">{task.domain}</p>
          )}
          {task.remarks && (
            <p className="text-sm text-muted-foreground italic max-w-sm mx-auto">{task.remarks}</p>
          )}
        </div>

        {/* Controls */}
        {!done ? (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setSeconds(0); setRunning(false) }}
              className="h-11 w-11 p-0 border-border"
            >
              <RotateCcw size={16} />
            </Button>
            <Button
              size="lg"
              onClick={() => setRunning((r) => !r)}
              className="h-14 px-8 gap-2 text-base"
              style={{ background: priorityColor }}
            >
              {running ? <Pause size={20} /> : <Play size={20} />}
              {running ? 'Pause' : seconds === 0 ? 'Démarrer' : 'Reprendre'}
            </Button>
            <Button
              onClick={markDone}
              size="lg"
              className="h-14 px-6 gap-2 text-base bg-green-600 hover:bg-green-700"
            >
              <CheckCircle size={18} /> Fait !
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p className="text-green-400 font-semibold text-lg">Tâche terminée 🎉</p>
            <div className="flex gap-3">
              {nextTask ? (
                <Button
                  onClick={() => {
                    setSeconds(0)
                    setRunning(false)
                    setDone(false)
                    router.push(`/focus/${date}/${nextTask.id}`)
                  }}
                  className="gap-2 h-11"
                >
                  Tâche suivante <ChevronRight size={16} />
                </Button>
              ) : (
                <Button
                  onClick={() => router.push(`/planner/day/${date}`)}
                  className="gap-2 h-11"
                >
                  Retour à la journée <ChevronRight size={16} />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Prev / Next task navigation */}
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          {prevTask && (
            <button
              onClick={() => { setSeconds(0); setRunning(false); setDone(false); router.push(`/focus/${date}/${prevTask.id}`) }}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <ChevronLeft size={14} /> {prevTask.designation?.slice(0, 24) || 'Précédente'}
            </button>
          )}
          {prevTask && nextTask && <span>·</span>}
          {nextTask && (
            <button
              onClick={() => { setSeconds(0); setRunning(false); setDone(false); router.push(`/focus/${date}/${nextTask.id}`) }}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              {nextTask.designation?.slice(0, 24) || 'Suivante'} <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
