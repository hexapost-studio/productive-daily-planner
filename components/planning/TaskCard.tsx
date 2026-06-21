'use client'

import { Task } from '@/domain/planning/entities/Task'
import { TASK_STATUSES, TaskStatus } from '@/domain/planning/value-objects/TaskStatus'
import { PRIORITIES } from '@/domain/planning/value-objects/Priority'
import { STATUS_COLORS, PRIORITY_COLORS } from '@/lib/constants'
import { Trash2, RepeatIcon, Zap } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onChange: (updated: Task) => void
  onDelete: () => void
  compact?: boolean
  date?: string
}

export function TaskCard({ task, onChange, onDelete, compact, date }: TaskCardProps) {
  const update = (partial: Partial<Task>) => onChange({ ...task, ...partial })
  const taskNum = task.position + 1

  if (compact) {
    return (
      <div className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-accent/50 group">
        <span className="w-2 h-2 rounded-full flex-shrink-0" aria-hidden="true" style={{ background: STATUS_COLORS[task.status] }} />
        <span className="text-xs text-foreground truncate flex-1">{task.designation || '—'}</span>
        {task.isRecurring && <RepeatIcon size={10} aria-label="Tâche récurrente" className="text-muted-foreground flex-shrink-0" />}
      </div>
    )
  }

  const priorityColor = task.priority ? PRIORITY_COLORS[task.priority] : 'transparent'
  const cardId = `task-${task.id}`

  return (
    <article
      className="rounded-lg border border-border p-3 space-y-2.5 overflow-hidden relative"
      style={{ background: 'var(--card)' }}
      aria-labelledby={`${cardId}-title`}
    >
      {/* Barre priorité gauche — décorative */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg transition-colors duration-200"
        style={{ background: priorityColor }}
        aria-hidden="true"
      />

      {/* Row 1 : désignation + actions */}
      <div className="flex items-start gap-2 pl-2">
        <span className="text-xs text-muted-foreground w-5 text-center pt-2.5 flex-shrink-0" aria-hidden="true">
          {taskNum}.
        </span>
        <div className="flex-1 min-w-0">
          <label htmlFor={`${cardId}-designation`} className="sr-only">
            Désignation de la tâche {taskNum}
          </label>
          <Input
            id={`${cardId}-designation`}
            value={task.designation}
            onChange={(e) => update({ designation: e.target.value })}
            placeholder="Désignation de la tâche..."
            className="h-10 text-sm bg-transparent border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary flex-1 w-full"
          />
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {date && task.status !== 'Fait' && (
            <Link href={`/focus/${date}/${task.id}`}>
              <button
                className="p-2 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={`Mode focus — ${task.designation || `tâche ${taskNum}`}`}
              >
                <Zap size={15} aria-hidden="true" />
              </button>
            </Link>
          )}
          <button
            onClick={onDelete}
            className="p-2 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={`Supprimer — ${task.designation || `tâche ${taskNum}`}`}
          >
            <Trash2 size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Row 2 : domaine + priorité + statut */}
      <div className="flex flex-wrap gap-2 ml-9">
        <div>
          <label htmlFor={`${cardId}-domain`} className="sr-only">Domaine de la tâche {taskNum}</label>
          <Input
            id={`${cardId}-domain`}
            value={task.domain}
            onChange={(e) => update({ domain: e.target.value })}
            placeholder="Domaine"
            className="h-10 text-sm w-28 bg-muted border-border"
          />
        </div>
        <div>
          <label htmlFor={`${cardId}-priority`} className="sr-only">Priorité de la tâche {taskNum}</label>
          <Select
            value={task.priority ?? ''}
            onValueChange={(v) => update({ priority: (v || null) as Task['priority'] })}
          >
            <SelectTrigger id={`${cardId}-priority`} className="h-10 text-sm w-36 bg-muted border-border" aria-label={`Priorité — ${task.priority ?? 'Non définie'}`}>
              <SelectValue placeholder="Priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">—</SelectItem>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  <span style={{ color: PRIORITY_COLORS[p] }}>{p}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label htmlFor={`${cardId}-status`} className="sr-only">Statut de la tâche {taskNum}</label>
          <Select
            value={task.status}
            onValueChange={(v) => update({ status: (v ?? 'À faire') as TaskStatus })}
          >
            <SelectTrigger id={`${cardId}-status`} className="h-10 text-sm w-32 bg-muted border-border" aria-label={`Statut — ${task.status}`}>
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
        </div>
      </div>

      {/* Row 3 : temps estimé + réel */}
      <div className="flex gap-2 items-center ml-9 flex-wrap">
        <div>
          <label htmlFor={`${cardId}-estimated`} className="sr-only">Temps estimé en minutes — tâche {taskNum}</label>
          <Input
            id={`${cardId}-estimated`}
            type="number"
            min={0}
            value={task.estimatedMinutes ?? ''}
            onChange={(e) => update({ estimatedMinutes: e.target.value ? Number(e.target.value) : null })}
            placeholder="Estimé (min)"
            className="h-10 text-sm w-32 bg-muted border-border"
          />
        </div>
        <div>
          <label htmlFor={`${cardId}-real`} className="sr-only">Temps réel passé en minutes — tâche {taskNum}</label>
          <Input
            id={`${cardId}-real`}
            type="number"
            min={0}
            value={task.realMinutes ?? ''}
            onChange={(e) => update({ realMinutes: e.target.value ? Number(e.target.value) : null })}
            placeholder="Réel (min)"
            className="h-10 text-sm w-32 bg-muted border-border"
          />
        </div>
        {task.isRecurring && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground" aria-label="Tâche récurrente">
            <RepeatIcon size={12} aria-hidden="true" /> récurrente
          </span>
        )}
      </div>

      {/* Row 4 : remarques */}
      <div className="ml-9">
        <label htmlFor={`${cardId}-remarks`} className="sr-only">Remarques — tâche {taskNum}</label>
        <Input
          id={`${cardId}-remarks`}
          value={task.remarks}
          onChange={(e) => update({ remarks: e.target.value })}
          placeholder="Remarques..."
          className="h-10 text-sm bg-muted border-border w-full"
        />
      </div>
    </article>
  )
}
