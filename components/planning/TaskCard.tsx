'use client'

import { Task } from '@/domain/planning/entities/Task'
import { TASK_STATUSES, TaskStatus } from '@/domain/planning/value-objects/TaskStatus'
import { PRIORITIES } from '@/domain/planning/value-objects/Priority'
import { STATUS_COLORS, PRIORITY_COLORS } from '@/lib/constants'
import { Trash2, RepeatIcon } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onChange: (updated: Task) => void
  onDelete: () => void
  compact?: boolean
}

export function TaskCard({ task, onChange, onDelete, compact }: TaskCardProps) {
  const update = (partial: Partial<Task>) => onChange({ ...task, ...partial })

  if (compact) {
    return (
      <div className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-accent/50 group">
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: STATUS_COLORS[task.status] }}
        />
        <span className="text-xs text-foreground truncate flex-1">{task.designation || '—'}</span>
        {task.isRecurring && <RepeatIcon size={10} className="text-muted-foreground flex-shrink-0" />}
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border p-3 space-y-2" style={{ background: 'var(--card)' }}>
      <div className="flex items-start gap-2">
        <span className="text-xs text-muted-foreground w-6 text-center pt-1">{task.position + 1}.</span>
        <div className="flex-1 space-y-2">
          <Input
            value={task.designation}
            onChange={(e) => update({ designation: e.target.value })}
            placeholder="Désignation de la tâche..."
            className="h-8 text-sm bg-transparent border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
          />
          <div className="flex flex-wrap gap-2">
            <Input
              value={task.domain}
              onChange={(e) => update({ domain: e.target.value })}
              placeholder="Domaine"
              className="h-7 text-xs w-28 bg-muted border-border"
            />
            <Select
              value={task.priority ?? ''}
              onValueChange={(v) => update({ priority: (v || null) as Task['priority'] })}
            >
              <SelectTrigger className="h-7 text-xs w-36 bg-muted border-border">
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
            <Select
              value={task.status}
              onValueChange={(v) => update({ status: (v ?? 'À faire') as TaskStatus })}
            >
              <SelectTrigger className="h-7 text-xs w-32 bg-muted border-border">
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
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              min={0}
              value={task.estimatedMinutes ?? ''}
              onChange={(e) => update({ estimatedMinutes: e.target.value ? Number(e.target.value) : null })}
              placeholder="Estimé (min)"
              className="h-7 text-xs w-28 bg-muted border-border"
            />
            <Input
              type="number"
              min={0}
              value={task.realMinutes ?? ''}
              onChange={(e) => update({ realMinutes: e.target.value ? Number(e.target.value) : null })}
              placeholder="Réel (min)"
              className="h-7 text-xs w-28 bg-muted border-border"
            />
            {task.isRecurring && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <RepeatIcon size={12} /> récurrente
              </span>
            )}
          </div>
          <Input
            value={task.remarks}
            onChange={(e) => update({ remarks: e.target.value })}
            placeholder="Remarques..."
            className="h-7 text-xs bg-muted border-border"
          />
        </div>
        <button
          onClick={onDelete}
          className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
