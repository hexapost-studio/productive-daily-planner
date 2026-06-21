'use client'

import { useState } from 'react'
import { Task } from '@/domain/planning/entities/Task'
import { PRIORITY_COLORS } from '@/lib/constants'
import { getTodayISO } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

const PX_PER_MIN = 1.5
const START_HOUR = 6
const END_HOUR = 23
const TOTAL_HOURS = END_HOUR - START_HOUR
const TOTAL_HEIGHT = TOTAL_HOURS * 60 * PX_PER_MIN
const DEFAULT_DURATION = 30

const HOURS = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i)

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

interface Positioned { task: Task; top: number; height: number; startLabel: string }

function positionTasks(tasks: Task[]): Positioned[] {
  let cursor = (9 - START_HOUR) * 60
  return tasks.map((task) => {
    const dur = task.estimatedMinutes ?? DEFAULT_DURATION
    let startMin: number
    if (task.startTime) {
      startMin = timeToMinutes(task.startTime) - START_HOUR * 60
      cursor = startMin + dur
    } else {
      startMin = cursor
      cursor += dur
    }
    const top = Math.max(0, startMin) * PX_PER_MIN
    const height = Math.max(dur * PX_PER_MIN, 28)
    const absMin = startMin + START_HOUR * 60
    const startLabel = minutesToTime(absMin)
    return { task, top, height, startLabel }
  })
}

interface TimelineViewProps {
  tasks: Task[]
  date: string
  onUpdateTask?: (taskId: string, updated: Partial<Task>) => void
}

export function TimelineView({ tasks, date, onUpdateTask }: TimelineViewProps) {
  const today = getTodayISO()
  const isToday = date === today
  const [editingTimeId, setEditingTimeId] = useState<string | null>(null)

  const now = new Date()
  const minutesSince6 = (now.getHours() - START_HOUR) * 60 + now.getMinutes()
  const nowLine = minutesSince6 * PX_PER_MIN

  const positioned = positionTasks(tasks.filter((t) => t.designation))

  return (
    <div
      className="overflow-y-auto rounded-xl border border-border"
      style={{ background: 'var(--card)', maxHeight: '68vh' }}
    >
      <div className="relative" style={{ height: `${TOTAL_HEIGHT}px`, minWidth: '280px' }}>
        {/* Lignes horaires */}
        {HOURS.map((h) => (
          <div
            key={h}
            className="absolute left-0 right-0 flex items-start"
            style={{ top: (h - START_HOUR) * 60 * PX_PER_MIN }}
          >
            <span className="text-[10px] text-muted-foreground w-12 -mt-2.5 pl-2 select-none flex-shrink-0">
              {String(h).padStart(2, '0')}h
            </span>
            <div className="flex-1 border-t border-border/30" />
          </div>
        ))}

        {/* Blocs de tâches */}
        {positioned.map(({ task, top, height, startLabel }) => {
          const color = task.priority ? PRIORITY_COLORS[task.priority] : '#6366f1'
          const isDone = task.status === 'Fait'
          const isEditingTime = editingTimeId === task.id

          return (
            <div
              key={task.id}
              className={cn(
                'absolute rounded-md px-2 py-1 overflow-visible transition-all group',
                isDone ? 'opacity-40' : 'opacity-90 hover:opacity-100',
              )}
              style={{
                top,
                height,
                left: '52px',
                right: '8px',
                background: color + '25',
                borderLeft: `3px solid ${color}`,
              }}
            >
              <div className="flex items-start justify-between gap-1">
                <p className={cn('text-xs font-semibold text-foreground leading-tight truncate flex-1', isDone && 'line-through')}>
                  {task.designation}
                </p>
                {/* Time badge / input */}
                {isEditingTime ? (
                  <input
                    type="time"
                    defaultValue={task.startTime ?? startLabel}
                    autoFocus
                    onBlur={(e) => {
                      setEditingTimeId(null)
                      onUpdateTask?.(task.id, { startTime: e.target.value || null })
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                      if (e.key === 'Escape') setEditingTimeId(null)
                    }}
                    className="text-[10px] w-16 bg-transparent border-b border-primary text-foreground focus:outline-none"
                    style={{ colorScheme: 'dark' }}
                  />
                ) : (
                  <button
                    onClick={() => setEditingTimeId(task.id)}
                    title="Modifier l'heure de début"
                    className={cn(
                      'text-[10px] px-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors flex-shrink-0',
                      task.startTime ? 'text-primary font-semibold' : 'opacity-0 group-hover:opacity-100',
                    )}
                  >
                    {task.startTime ?? startLabel}
                  </button>
                )}
              </div>
              {height > 36 && task.estimatedMinutes && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {task.estimatedMinutes}min{task.domain ? ` · ${task.domain}` : ''}
                </p>
              )}
              {height > 56 && task.status !== 'À faire' && (
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-full font-medium mt-1 inline-block"
                  style={{ background: color + '33', color }}
                >
                  {task.status}
                </span>
              )}
            </div>
          )
        })}

        {/* Ligne "maintenant" */}
        {isToday && minutesSince6 > 0 && minutesSince6 < TOTAL_HOURS * 60 && (
          <div
            className="absolute left-0 right-0 z-20 pointer-events-none"
            style={{ top: nowLine }}
          >
            <div className="border-t-2 border-red-400 relative">
              <div className="absolute left-12 -top-2.5 text-[9px] text-red-400 bg-card px-1 rounded font-medium">
                maintenant
              </div>
              <div className="absolute left-9 -top-1.5 w-3 h-3 rounded-full bg-red-400" />
            </div>
          </div>
        )}

        {positioned.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ left: '52px' }}>
            <p className="text-xs text-muted-foreground">Ajoute des tâches pour les voir ici</p>
          </div>
        )}
      </div>
    </div>
  )
}
