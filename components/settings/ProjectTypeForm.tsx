'use client'

import { useState } from 'react'
import { ProjectType } from '@/domain/projects/entities/ProjectType'
import { saveProjectType, deleteProjectType } from '@/application/projects/GetProjects'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Trash2, Plus } from 'lucide-react'
import { MAX_PROJECT_TYPES, PROJECT_TYPE_COLORS } from '@/lib/constants'

interface ProjectTypeFormProps {
  types: ProjectType[]
  onRefresh: () => void
}

export function ProjectTypeForm({ types, onRefresh }: ProjectTypeFormProps) {
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PROJECT_TYPE_COLORS[types.length % PROJECT_TYPE_COLORS.length])

  const handleAdd = () => {
    if (!newName.trim() || types.length >= MAX_PROJECT_TYPES) return
    saveProjectType({
      id: crypto.randomUUID(),
      name: newName.trim(),
      color: newColor,
      position: types.length + 1,
    })
    setNewName('')
    setNewColor(PROJECT_TYPE_COLORS[(types.length + 1) % PROJECT_TYPE_COLORS.length])
    onRefresh()
  }

  const handleDelete = (id: string) => {
    deleteProjectType(id)
    onRefresh()
  }

  const handleUpdateName = (type: ProjectType, name: string) => {
    saveProjectType({ ...type, name })
    onRefresh()
  }

  return (
    <div className="space-y-3 max-w-md">
      <p className="text-xs text-muted-foreground">
        {types.length}/{MAX_PROJECT_TYPES} types définis
      </p>
      <div className="space-y-2">
        {types.map((type) => (
          <div key={type.id} className="flex items-center gap-2">
            <input
              type="color"
              value={type.color}
              onChange={(e) => { saveProjectType({ ...type, color: e.target.value }); onRefresh() }}
              className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent"
            />
            <Input
              value={type.name}
              onChange={(e) => handleUpdateName(type, e.target.value)}
              className="h-8 text-sm bg-muted border-border"
            />
            <button
              onClick={() => handleDelete(type.id)}
              className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      {types.length < MAX_PROJECT_TYPES && (
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent"
          />
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nouveau type..."
            className="h-8 text-sm bg-muted border-border"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button size="sm" onClick={handleAdd} disabled={!newName.trim()}>
            <Plus size={14} />
          </Button>
        </div>
      )}
    </div>
  )
}
