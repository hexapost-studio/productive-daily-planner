'use client'

import { useState } from 'react'
import { Project } from '@/domain/projects/entities/Project'
import { ProjectType } from '@/domain/projects/entities/ProjectType'
import { PROJECT_STATUS_COLORS, IMPACT_COLORS, PRIORITY_COLORS } from '@/lib/constants'
import { saveProject, deleteProject } from '@/application/projects/GetProjects'
import { ProjectForm } from './ProjectForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PROJECT_STATUSES } from '@/domain/projects/value-objects/ProjectStatus'
import { IMPACT_LEVELS } from '@/domain/projects/value-objects/ImpactLevel'

interface ProjectBoardProps {
  projects: Project[]
  projectTypes: ProjectType[]
  onRefresh: () => void
}

export function ProjectBoard({ projects, projectTypes, onRefresh }: ProjectBoardProps) {
  const [editProject, setEditProject] = useState<Project | undefined>()
  const [creating, setCreating] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterImpact, setFilterImpact] = useState('')

  const filtered = projects.filter((p) => {
    if (filterStatus && p.status !== filterStatus) return false
    if (filterType && p.type !== filterType) return false
    if (filterImpact && p.impactLevel !== filterImpact) return false
    return true
  })

  const handleSave = (project: Project) => {
    saveProject(project)
    setEditProject(undefined)
    setCreating(false)
    onRefresh()
  }

  const handleDelete = (id: string) => {
    if (!confirm('Supprimer ce projet ?')) return
    deleteProject(id)
    onRefresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v ?? '')}>
            <SelectTrigger className="h-8 text-xs w-36 bg-card border-border">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les statuts</SelectItem>
              {PROJECT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={(v) => setFilterType(v ?? '')}>
            <SelectTrigger className="h-8 text-xs w-36 bg-card border-border">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les types</SelectItem>
              {projectTypes.map((t) => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterImpact} onValueChange={(v) => setFilterImpact(v ?? '')}>
            <SelectTrigger className="h-8 text-xs w-36 bg-card border-border">
              <SelectValue placeholder="Impact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les impacts</SelectItem>
              {IMPACT_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus size={14} className="mr-1" />
          Nouveau projet
        </Button>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">Aucun projet trouvé.</p>
            <p className="text-xs mt-1">Cliquez sur &quot;Nouveau projet&quot; pour commencer.</p>
          </div>
        )}
        {filtered.map((project) => (
          <div
            key={project.id}
            className="rounded-lg border border-border p-4 hover:border-primary/50 transition-colors"
            style={{ background: 'var(--card)' }}
          >
            <div className="flex items-start gap-3">
              <span className="text-xs text-muted-foreground w-6 text-center pt-1 flex-shrink-0">
                {project.position}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-medium text-sm text-foreground">{project.designation}</p>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => setEditProject(project)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {project.type && (
                    <Badge
                      variant="outline"
                      className="text-xs h-5 border-0"
                      style={{
                        background: projectTypes.find((t) => t.name === project.type)?.color + '33',
                        color: projectTypes.find((t) => t.name === project.type)?.color,
                      }}
                    >
                      {project.type}
                    </Badge>
                  )}
                  {project.priority && (
                    <Badge
                      variant="outline"
                      className="text-xs h-5 border-0"
                      style={{
                        background: PRIORITY_COLORS[project.priority] + '22',
                        color: PRIORITY_COLORS[project.priority],
                      }}
                    >
                      {project.priority}
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className="text-xs h-5 border-0"
                    style={{
                      background: IMPACT_COLORS[project.impactLevel] + '22',
                      color: IMPACT_COLORS[project.impactLevel],
                    }}
                  >
                    Impact {project.impactLevel}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs h-5 border-0"
                    style={{
                      background: PROJECT_STATUS_COLORS[project.status] + '33',
                      color: PROJECT_STATUS_COLORS[project.status],
                    }}
                  >
                    {project.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Progress value={project.progress} className="h-1.5" />
                  </div>
                  <span className="text-xs text-muted-foreground w-10 text-right">{project.progress}%</span>
                </div>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  {project.startDate && <span>Début: {project.startDate}</span>}
                  {project.deadline && <span>Deadline: {project.deadline}</span>}
                  {project.keyPeople && <span>Équipe: {project.keyPeople}</span>}
                </div>
                {project.comments && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.comments}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={creating || !!editProject}
        onOpenChange={(o) => { if (!o) { setCreating(false); setEditProject(undefined) } }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle>{editProject ? 'Modifier le projet' : 'Nouveau projet'}</DialogTitle>
          </DialogHeader>
          <ProjectForm
            project={editProject}
            projectTypes={projectTypes}
            onSave={handleSave}
            onCancel={() => { setCreating(false); setEditProject(undefined) }}
            nextPosition={projects.length + 1}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
