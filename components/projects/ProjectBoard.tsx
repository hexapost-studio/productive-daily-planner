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
import { Plus, Trash2, Pencil, Briefcase, SlidersHorizontal, X, LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PROJECT_STATUSES } from '@/domain/projects/value-objects/ProjectStatus'
import { IMPACT_LEVELS } from '@/domain/projects/value-objects/ImpactLevel'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

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
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)
  const activeFiltersCount = [filterStatus, filterType, filterImpact].filter(Boolean).length

  const KANBAN_COLS = ['En attente', 'En cours', 'En pause', 'Terminé', 'Annulé'] as const

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault()
    setDragOverCol(null)
    const id = e.dataTransfer.getData('projectId')
    const project = projects.find((p) => p.id === id)
    if (!project || project.status === targetStatus) return
    saveProject({ ...project, status: targetStatus as Project['status'] })
    onRefresh()
  }

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
      {/* ── MOBILE action bar : 3 slots exactement ──────────────────── */}
      <div className="flex md:hidden items-center gap-2">

        {/* Slot 1 — Filtres (badge = nb filtres actifs) */}
        <button
          onClick={() => setFilterSheetOpen(true)}
          className={cn(
            'relative flex items-center gap-2 h-11 px-4 rounded-xl border text-sm font-medium transition-colors flex-1',
            activeFiltersCount > 0
              ? 'border-primary bg-primary/8 text-primary'
              : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40',
          )}
        >
          <SlidersHorizontal size={16} />
          <span>Filtres</span>
          {activeFiltersCount > 0 && (
            <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Slot 2 — Toggle vue */}
        <div className="flex items-center rounded-xl border border-border p-1 bg-muted flex-shrink-0">
          <button
            onClick={() => setViewMode('list')}
            className={cn('flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
              viewMode === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
            aria-label="Vue liste"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={cn('flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
              viewMode === 'kanban' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
            aria-label="Vue kanban"
          >
            <LayoutGrid size={16} />
          </button>
        </div>

        {/* Slot 3 — CTA primaire */}
        <Button onClick={() => setCreating(true)} className="h-11 px-4 flex-shrink-0 gap-1.5 rounded-xl">
          <Plus size={16} />
          <span>Nouveau</span>
        </Button>
      </div>

      {/* ── DESKTOP action bar : filtres inline + toggle + CTA ──────── */}
      <div className="hidden md:flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v ?? '')}>
            <SelectTrigger className="h-10 text-sm w-36 bg-card border-border flex-shrink-0 rounded-xl">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous statuts</SelectItem>
              {PROJECT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={(v) => setFilterType(v ?? '')}>
            <SelectTrigger className="h-10 text-sm w-36 bg-card border-border flex-shrink-0 rounded-xl">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous types</SelectItem>
              {projectTypes.map((t) => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterImpact} onValueChange={(v) => setFilterImpact(v ?? '')}>
            <SelectTrigger className="h-10 text-sm w-32 bg-card border-border flex-shrink-0 rounded-xl">
              <SelectValue placeholder="Impact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous impacts</SelectItem>
              {IMPACT_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          {activeFiltersCount > 0 && (
            <button
              onClick={() => { setFilterStatus(''); setFilterType(''); setFilterImpact('') }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors h-10 px-2"
            >
              <X size={12} /> Réinitialiser
            </button>
          )}
        </div>
        <div className="flex items-center rounded-xl border border-border p-1 bg-muted flex-shrink-0">
          <button
            onClick={() => setViewMode('list')}
            className={cn('flex items-center justify-center w-8 h-8 rounded-lg transition-colors',
              viewMode === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
          >
            <List size={14} />
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={cn('flex items-center justify-center w-8 h-8 rounded-lg transition-colors',
              viewMode === 'kanban' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
          >
            <LayoutGrid size={14} />
          </button>
        </div>
        <Button onClick={() => setCreating(true)} className="h-10 flex-shrink-0 gap-1 rounded-xl">
          <Plus size={14} /> Nouveau projet
        </Button>
      </div>

      {/* Sheet filtres — mobile only, contient TOUS les filtres */}
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl border-border bg-card px-0">
          <SheetHeader className="px-5 pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <SheetTitle>Filtres</SheetTitle>
              {activeFiltersCount > 0 && (
                <span className="text-xs text-primary font-semibold">
                  {activeFiltersCount} actif{activeFiltersCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </SheetHeader>
          <div className="px-5 pt-4 space-y-4 pb-8">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Statut</p>
              <div className="flex flex-wrap gap-2">
                {['', ...PROJECT_STATUSES].map((s) => (
                  <button
                    key={s || 'all'}
                    onClick={() => setFilterStatus(s)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                      filterStatus === s
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
                    )}
                  >
                    {s || 'Tous'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Type</p>
              <div className="flex flex-wrap gap-2">
                {['', ...projectTypes.map((t) => t.name)].map((t) => (
                  <button
                    key={t || 'all'}
                    onClick={() => setFilterType(t)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                      filterType === t
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
                    )}
                  >
                    {t || 'Tous'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Impact</p>
              <div className="flex flex-wrap gap-2">
                {['', ...IMPACT_LEVELS].map((l) => (
                  <button
                    key={l || 'all'}
                    onClick={() => setFilterImpact(l)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                      filterImpact === l
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
                    )}
                  >
                    {l || 'Tous'}
                  </button>
                ))}
              </div>
            </div>
            {activeFiltersCount > 0 && (
              <button
                className="w-full flex items-center justify-center gap-1.5 h-10 text-sm text-muted-foreground hover:text-destructive transition-colors"
                onClick={() => { setFilterStatus(''); setFilterType(''); setFilterImpact('') }}
              >
                <X size={14} /> Réinitialiser les filtres
              </button>
            )}
            <Button className="w-full h-11" onClick={() => setFilterSheetOpen(false)}>
              Appliquer
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Kanban view */}
      {viewMode === 'kanban' && (
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'] }}>
          {KANBAN_COLS.map((col) => {
            const colProjects = projects.filter((p) => p.status === col)
            const isDragOver = dragOverCol === col
            return (
              <div
                key={col}
                onDragOver={(e) => { e.preventDefault(); setDragOverCol(col) }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={(e) => handleDrop(e, col)}
                className={cn(
                  'flex-shrink-0 w-60 rounded-xl border p-3 space-y-2 transition-colors',
                  isDragOver ? 'border-primary bg-primary/5' : 'border-border',
                )}
                style={{ background: isDragOver ? undefined : 'var(--card)' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-foreground">{col}</p>
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{colProjects.length}</span>
                </div>
                {colProjects.map((project) => (
                  <div
                    key={project.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('projectId', project.id)}
                    className="rounded-lg border border-border p-3 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
                    style={{ background: 'var(--background)' }}
                  >
                    <p className="text-sm font-medium text-foreground leading-snug mb-1.5 line-clamp-2">{project.designation}</p>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <Progress value={project.progress} className="h-1" />
                      </div>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">{project.progress}%</span>
                    </div>
                    {project.type && (
                      <p className="text-[10px] text-muted-foreground mt-1.5 truncate">
                        {project.type}{project.impactLevel ? ` · ${project.impactLevel}` : ''}
                      </p>
                    )}
                    <div className="flex gap-1 mt-2">
                      <button onClick={() => setEditProject(project)} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent">
                        <Pencil size={11} />
                      </button>
                      <button onClick={() => handleDelete(project.id)} className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))}
                {colProjects.length === 0 && (
                  <div className="text-center py-6 text-xs text-muted-foreground/50 border border-dashed border-border/50 rounded-lg">
                    Glisser ici
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Project cards — list view */}
      {viewMode === 'list' && <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)' }}>
              <Briefcase size={28} className="text-primary" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-foreground text-sm">
                {filterStatus || filterType || filterImpact ? 'Aucun projet ne correspond aux filtres' : 'Ton board est vide'}
              </p>
              <p className="text-xs text-muted-foreground max-w-[240px]">
                {filterStatus || filterType || filterImpact
                  ? 'Essaie de modifier ou réinitialiser les filtres'
                  : 'Commence par créer ton premier projet pour le suivre ici'}
              </p>
            </div>
            {!filterStatus && !filterType && !filterImpact && (
              <Button size="sm" onClick={() => setCreating(true)} className="gap-1.5 h-10">
                <Plus size={14} /> Créer un projet
              </Button>
            )}
            {(filterStatus || filterType || filterImpact) && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 h-10 border-border"
                onClick={() => { setFilterStatus(''); setFilterType(''); setFilterImpact('') }}
              >
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        )}
        {filtered.map((project) => (
          <div
            key={project.id}
            className="rounded-xl border border-border p-4 hover:border-primary/50 transition-colors"
            style={{ background: 'var(--card)' }}
          >
            {/* Top row: name + actions */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-start gap-2 min-w-0">
                <span className="text-xs text-muted-foreground w-5 text-center pt-0.5 flex-shrink-0">
                  {project.position}
                </span>
                <p className="font-semibold text-sm text-foreground leading-snug">{project.designation}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => setEditProject(project)}
                  className="p-2 rounded text-muted-foreground hover:text-foreground hover:bg-accent min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-2 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mb-3 ml-7">
              {project.type && (
                <Badge
                  variant="outline"
                  className="text-xs h-5 border-0"
                  style={{
                    background: (projectTypes.find((t) => t.name === project.type)?.color ?? '#6366f1') + '33',
                    color: projectTypes.find((t) => t.name === project.type)?.color ?? '#6366f1',
                  }}
                >
                  {project.type}
                </Badge>
              )}
              {project.priority && (
                <Badge
                  variant="outline"
                  className="text-xs h-5 border-0"
                  style={{ background: PRIORITY_COLORS[project.priority] + '22', color: PRIORITY_COLORS[project.priority] }}
                >
                  {project.priority}
                </Badge>
              )}
              <Badge
                variant="outline"
                className="text-xs h-5 border-0"
                style={{ background: IMPACT_COLORS[project.impactLevel] + '22', color: IMPACT_COLORS[project.impactLevel] }}
              >
                Impact {project.impactLevel}
              </Badge>
              <Badge
                variant="outline"
                className="text-xs h-5 border-0"
                style={{ background: PROJECT_STATUS_COLORS[project.status] + '33', color: PROJECT_STATUS_COLORS[project.status] }}
              >
                {project.status}
              </Badge>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-3 ml-7">
              <div className="flex-1">
                <Progress value={project.progress} className="h-2" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground w-10 text-right">{project.progress}%</span>
            </div>

            {/* Meta */}
            <div className="flex gap-3 mt-2 text-xs text-muted-foreground ml-7 flex-wrap">
              {project.startDate && <span>Début: {project.startDate}</span>}
              {project.deadline && <span>Deadline: {project.deadline}</span>}
              {project.keyPeople && <span className="hidden sm:inline">Équipe: {project.keyPeople}</span>}
            </div>
            {project.comments && (
              <p className="text-xs text-muted-foreground mt-1.5 ml-7 line-clamp-2">{project.comments}</p>
            )}
          </div>
        ))}
      </div>}

      <Dialog
        open={creating || !!editProject}
        onOpenChange={(o) => { if (!o) { setCreating(false); setEditProject(undefined) } }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border mx-4">
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
