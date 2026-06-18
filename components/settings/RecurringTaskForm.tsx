'use client'

import { RecurringTask } from '@/domain/recurring/entities/RecurringTask'
import { DayOfWeek, DAYS_OF_WEEK } from '@/domain/recurring/value-objects/DayOfWeek'
import { saveRecurringTask, deleteRecurringTask } from '@/application/recurring/GetRecurringTasks'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { MAX_RECURRING_PER_DAY } from '@/lib/constants'
import { useState } from 'react'

interface RecurringTaskFormProps {
  tasks: RecurringTask[]
  onRefresh: () => void
}

interface DayFormProps {
  day: DayOfWeek
  tasks: RecurringTask[]
  onRefresh: () => void
}

function DayForm({ day, tasks, onRefresh }: DayFormProps) {
  const [newDesignation, setNewDesignation] = useState('')

  const handleAdd = () => {
    if (!newDesignation.trim() || tasks.length >= MAX_RECURRING_PER_DAY) return
    saveRecurringTask({
      id: crypto.randomUUID(),
      dayOfWeek: day,
      designation: newDesignation.trim(),
      domain: '',
      remarks: '',
      position: tasks.length,
    })
    setNewDesignation('')
    onRefresh()
  }

  const handleUpdate = (task: RecurringTask, field: keyof RecurringTask, value: string) => {
    saveRecurringTask({ ...task, [field]: value })
    onRefresh()
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-foreground">{day}</h4>
      <div className="space-y-1.5">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-2">
            <Input
              value={task.designation}
              onChange={(e) => handleUpdate(task, 'designation', e.target.value)}
              placeholder="Tâche récurrente..."
              className="h-7 text-xs bg-muted border-border"
            />
            <Input
              value={task.domain}
              onChange={(e) => handleUpdate(task, 'domain', e.target.value)}
              placeholder="Domaine"
              className="h-7 text-xs w-24 bg-muted border-border"
            />
            <button
              onClick={() => { deleteRecurringTask(task.id); onRefresh() }}
              className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {tasks.length < MAX_RECURRING_PER_DAY && (
          <div className="flex items-center gap-2">
            <Input
              value={newDesignation}
              onChange={(e) => setNewDesignation(e.target.value)}
              placeholder={`Ajouter (${tasks.length}/${MAX_RECURRING_PER_DAY})...`}
              className="h-7 text-xs bg-muted border-border"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button size="sm" variant="ghost" onClick={handleAdd} disabled={!newDesignation.trim()} className="h-7 px-2">
              <Plus size={12} />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export function RecurringTaskForm({ tasks, onRefresh }: RecurringTaskFormProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {DAYS_OF_WEEK.map((day) => (
        <DayForm
          key={day}
          day={day}
          tasks={tasks.filter((t) => t.dayOfWeek === day).sort((a, b) => a.position - b.position)}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  )
}
