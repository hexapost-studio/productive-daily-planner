'use client'

import { useState } from 'react'
import { Task } from '@/domain/planning/entities/Task'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TaskCard } from './TaskCard'
import { GripVertical, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SortableItemProps {
  task: Task
  date: string
  onChange: (updated: Task) => void
  onDelete: () => void
  onInsertAfter: () => void
  isGapHovered: boolean
  onGapEnter: () => void
  onGapLeave: () => void
  showFAB: boolean
}

function SortableItem({
  task, date, onChange, onDelete, onInsertAfter,
  isGapHovered, onGapEnter, onGapLeave, showFAB,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        position: 'relative',
        zIndex: isDragging ? 50 : 'auto',
      }}
      className="group/sortable"
    >
      <div className="relative">
        <button
          {...attributes}
          {...listeners}
          type="button"
          aria-label={`Réordonner la tâche "${task.designation || 'sans titre'}". Utilise Espace pour saisir, puis les flèches pour déplacer.`}
          className="absolute left-0 top-0 bottom-0 w-5 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover/sortable:opacity-60 focus-visible:opacity-100 transition-opacity z-10 touch-none"
          style={{ left: '-20px' }}
        >
          <GripVertical size={13} className="text-muted-foreground" aria-hidden="true" />
        </button>
        <TaskCard task={task} date={date} onChange={onChange} onDelete={onDelete} />
      </div>

      {showFAB && (
        <button
          type="button"
          aria-label={`Insérer une tâche après "${task.designation || 'cette tâche'}"`}
          className="relative h-3 w-full flex items-center justify-center focus-visible:opacity-100"
          onMouseEnter={onGapEnter}
          onMouseLeave={onGapLeave}
          onClick={onInsertAfter}
        >
          <div className={cn(
            'flex items-center gap-1.5 transition-all duration-150',
            isGapHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
          )}>
            <div className="h-px bg-primary/40 w-16" />
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-md shadow-primary/30">
              <Plus size={11} className="text-primary-foreground" />
            </div>
            <div className="h-px bg-primary/40 w-16" />
          </div>
        </button>
      )}
    </div>
  )
}

interface SortableTaskListProps {
  tasks: Task[]
  date: string
  onReorder: (tasks: Task[]) => void
  onChange: (taskId: string, updated: Task) => void
  onDelete: (taskId: string) => void
  onInsertAt: (afterIndex: number) => void
  maxReached: boolean
}

export function SortableTaskList({
  tasks, date, onReorder, onChange, onDelete, onInsertAt, maxReached,
}: SortableTaskListProps) {
  const [hoveredGap, setHoveredGap] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = tasks.findIndex((t) => t.id === active.id)
    const newIdx = tasks.findIndex((t) => t.id === over.id)
    const reordered = arrayMove(tasks, oldIdx, newIdx).map((t, i) => ({ ...t, position: i }))
    onReorder(reordered)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-0 pl-5">
          {tasks.map((task, i) => (
            <SortableItem
              key={task.id}
              task={task}
              date={date}
              onChange={(updated) => onChange(task.id, updated)}
              onDelete={() => onDelete(task.id)}
              onInsertAfter={() => onInsertAt(i)}
              isGapHovered={hoveredGap === i}
              onGapEnter={() => setHoveredGap(i)}
              onGapLeave={() => setHoveredGap(null)}
              showFAB={!maxReached}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
