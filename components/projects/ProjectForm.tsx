'use client'

import { useState } from 'react'
import { Project } from '@/domain/projects/entities/Project'
import { PROJECT_STATUSES, ProjectStatus } from '@/domain/projects/value-objects/ProjectStatus'
import { IMPACT_LEVELS, ImpactLevel } from '@/domain/projects/value-objects/ImpactLevel'
import { ProjectType } from '@/domain/projects/entities/ProjectType'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { PRIORITIES } from '@/domain/planning/value-objects/Priority'

interface ProjectFormProps {
  project?: Project
  projectTypes: ProjectType[]
  onSave: (project: Project) => void
  onCancel: () => void
  nextPosition: number
}

const EMPTY: Omit<Project, 'id' | 'position'> = {
  designation: '',
  type: '',
  priority: '',
  impactLevel: 'Moyen',
  startDate: null,
  deadline: null,
  status: 'En attente',
  progress: 0,
  keyPeople: '',
  comments: '',
}

export function ProjectForm({ project, projectTypes, onSave, onCancel, nextPosition }: ProjectFormProps) {
  const [form, setForm] = useState<Omit<Project, 'id' | 'position'>>(project ?? EMPTY)

  const update = (partial: Partial<typeof form>) => setForm((f) => ({ ...f, ...partial }))

  const handleSave = () => {
    if (!form.designation.trim()) return
    onSave({
      id: project?.id ?? crypto.randomUUID(),
      position: project?.position ?? nextPosition,
      ...form,
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Désignation *</label>
        <Input
          value={form.designation}
          onChange={(e) => update({ designation: e.target.value })}
          placeholder="Nom du projet..."
          className="bg-muted border-border"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Type</label>
          <Select value={form.type} onValueChange={(v) => update({ type: v ?? '' })}>
            <SelectTrigger className="bg-muted border-border">
              <SelectValue placeholder="Type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">—</SelectItem>
              {projectTypes.map((t) => (
                <SelectItem key={t.id} value={t.name}>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                    {t.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Priorité</label>
          <Select value={form.priority} onValueChange={(v) => update({ priority: v ?? '' })}>
            <SelectTrigger className="bg-muted border-border">
              <SelectValue placeholder="Priorité..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">—</SelectItem>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Impact</label>
          <Select value={form.impactLevel} onValueChange={(v) => update({ impactLevel: (v ?? 'Moyen') as ImpactLevel })}>
            <SelectTrigger className="bg-muted border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {IMPACT_LEVELS.map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Statut</label>
          <Select value={form.status} onValueChange={(v) => update({ status: (v ?? 'En attente') as ProjectStatus })}>
            <SelectTrigger className="bg-muted border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Date de début</label>
          <Input
            type="date"
            value={form.startDate ?? undefined}
            onChange={(e) => update({ startDate: e.target.value || null })}
            className="bg-muted border-border"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Deadline</label>
          <Input
            type="date"
            value={form.deadline ?? undefined}
            onChange={(e) => update({ deadline: e.target.value || null })}
            className="bg-muted border-border"
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Avancement: {form.progress}%</label>
        <input
          type="range"
          min={0}
          max={100}
          value={form.progress}
          onChange={(e) => update({ progress: Number(e.target.value) })}
          className="w-full accent-primary"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Personnes clés</label>
        <Input
          value={form.keyPeople}
          onChange={(e) => update({ keyPeople: e.target.value })}
          placeholder="Noms, rôles..."
          className="bg-muted border-border"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Commentaires / Stratégies</label>
        <Textarea
          value={form.comments}
          onChange={(e) => update({ comments: e.target.value })}
          placeholder="Prochaines actions, notes..."
          className="bg-muted border-border resize-none"
          rows={3}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onCancel}>Annuler</Button>
        <Button onClick={handleSave} disabled={!form.designation.trim()}>
          {project ? 'Enregistrer' : 'Créer le projet'}
        </Button>
      </div>
    </div>
  )
}
