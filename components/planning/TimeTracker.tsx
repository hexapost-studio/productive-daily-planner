import { Task } from '@/domain/planning/entities/Task'
import { Clock, Timer, CheckCircle } from 'lucide-react'

interface TimeTrackerProps {
  tasks: Task[]
}

export function TimeTracker({ tasks }: TimeTrackerProps) {
  const totalEstimated = tasks.reduce((acc, t) => acc + (t.estimatedMinutes ?? 0), 0)
  const totalReal = tasks.reduce((acc, t) => acc + (t.realMinutes ?? 0), 0)
  const remaining = tasks
    .filter((t) => t.status !== 'Fait')
    .reduce((acc, t) => acc + (t.estimatedMinutes ?? 0), 0)
  const done = tasks.filter((t) => t.status === 'Fait').length

  const fmt = (min: number) => {
    const h = Math.floor(min / 60)
    const m = min % 60
    return h > 0 ? `${h}h${m > 0 ? m + 'min' : ''}` : `${m}min`
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-lg p-3 border border-border bg-card">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Clock size={14} />
          <span className="text-xs">Estimé</span>
        </div>
        <p className="text-lg font-semibold text-foreground">{totalEstimated > 0 ? fmt(totalEstimated) : '—'}</p>
      </div>
      <div className="rounded-lg p-3 border border-border bg-card">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Timer size={14} />
          <span className="text-xs">Réel</span>
        </div>
        <p className="text-lg font-semibold text-foreground">{totalReal > 0 ? fmt(totalReal) : '—'}</p>
      </div>
      <div className="rounded-lg p-3 border border-border bg-card">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Clock size={14} />
          <span className="text-xs">Restant</span>
        </div>
        <p className="text-lg font-semibold" style={{ color: remaining > 0 ? '#f59e0b' : '#10b981' }}>
          {remaining > 0 ? fmt(remaining) : '0min'}
        </p>
      </div>
      <div className="rounded-lg p-3 border border-border bg-card">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <CheckCircle size={14} />
          <span className="text-xs">Complètes</span>
        </div>
        <p className="text-lg font-semibold" style={{ color: '#10b981' }}>
          {done}/{tasks.length}
        </p>
      </div>
    </div>
  )
}
