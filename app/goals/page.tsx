'use client'

import { useEffect, useState } from 'react'
import { Goal, GoalPeriod, GoalStatus, KeyResult } from '@/domain/goals/entities/Goal'
import { LocalStorageGoalRepository } from '@/infrastructure/persistence/LocalStorageGoalRepository'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Target, Plus, Trash2, ChevronDown, ChevronUp, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const repo = new LocalStorageGoalRepository()
const PERIODS: GoalPeriod[] = ['semaine', 'mois', 'trimestre', 'année']
const STATUSES: GoalStatus[] = ['actif', 'atteint', 'abandonné']
const STATUS_COLORS: Record<GoalStatus, string> = { actif: '#8d4b00', atteint: '#2d6a4f', abandonné: '#887364' }
const PERIOD_LABELS: Record<GoalPeriod, string> = { semaine: 'Semaine', mois: 'Mois', trimestre: 'Trimestre', année: 'Année' }

function goalProgress(goal: Goal): number {
  if (!goal.keyResults.length) return 0
  const avg = goal.keyResults.reduce((a, kr) => a + Math.min(100, (kr.current / Math.max(kr.target, 1)) * 100), 0) / goal.keyResults.length
  return Math.round(avg)
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: '', period: 'mois' as GoalPeriod, dueDate: '', description: '' })
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  const refresh = () => setGoals(repo.getAll())
  useEffect(() => { refresh() }, [])

  const saveGoal = () => {
    if (!form.title.trim()) return
    const goal: Goal = {
      id: editingGoal?.id ?? crypto.randomUUID(),
      title: form.title.trim(),
      description: form.description || undefined,
      period: form.period,
      status: 'actif',
      keyResults: editingGoal?.keyResults ?? [],
      linkedProjectIds: editingGoal?.linkedProjectIds ?? [],
      createdAt: editingGoal?.createdAt ?? new Date().toISOString(),
      dueDate: form.dueDate || undefined,
    }
    repo.save(goal)
    refresh()
    setCreating(false)
    setEditingGoal(null)
    setForm({ title: '', period: 'mois', dueDate: '', description: '' })
    setExpanded(goal.id)
  }

  const addKeyResult = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return
    const kr: KeyResult = { id: crypto.randomUUID(), title: '', target: 100, current: 0, unit: '%' }
    repo.save({ ...goal, keyResults: [...goal.keyResults, kr] })
    refresh()
  }

  const updateKR = (goalId: string, krId: string, patch: Partial<KeyResult>) => {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return
    repo.save({ ...goal, keyResults: goal.keyResults.map((kr) => kr.id === krId ? { ...kr, ...patch } : kr) })
    refresh()
  }

  const deleteKR = (goalId: string, krId: string) => {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return
    repo.save({ ...goal, keyResults: goal.keyResults.filter((kr) => kr.id !== krId) })
    refresh()
  }

  const updateStatus = (goal: Goal, status: GoalStatus) => {
    repo.save({ ...goal, status })
    refresh()
  }

  const remove = (id: string) => { repo.delete(id); refresh() }

  const GoalForm = () => (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">{editingGoal ? 'Modifier' : 'Nouvel objectif'}</p>
      <Input placeholder="Titre de l'objectif *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="h-11 bg-card border-border" aria-label="Titre de l'objectif" />
      <Input placeholder="Description (optionnelle)" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="h-10 bg-card border-border text-sm" aria-label="Description" />
      <div className="flex gap-2 flex-wrap">
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button key={p} type="button" onClick={() => setForm((f) => ({ ...f, period: p }))}
              className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-colors', form.period === p ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50')}>
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
        <input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} aria-label="Date d'échéance" className="h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" style={{ colorScheme: 'light' }} />
      </div>
      <div className="flex gap-2">
        <Button onClick={saveGoal} disabled={!form.title.trim()} className="h-10 gap-1.5 rounded-xl"><Check size={14} /> Enregistrer</Button>
        <Button variant="ghost" onClick={() => { setCreating(false); setEditingGoal(null) }} className="h-10 rounded-xl"><X size={14} /></Button>
      </div>
    </div>
  )

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Target size={22} className="text-primary" />
          <div>
            <h1 className="text-xl font-bold text-foreground">Objectifs</h1>
            <p className="text-xs text-muted-foreground">{goals.filter((g) => g.status === 'actif').length} actif{goals.filter((g) => g.status === 'actif').length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {!creating && !editingGoal && (
          <Button onClick={() => setCreating(true)} className="h-10 gap-1.5 rounded-xl"><Plus size={16} /> Objectif</Button>
        )}
      </div>

      {(creating || editingGoal) && <GoalForm />}

      {goals.length === 0 && !creating ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center"><Target size={28} className="text-primary" /></div>
          <p className="font-semibold text-foreground">Aucun objectif défini</p>
          <p className="text-xs text-muted-foreground max-w-xs">Définis tes objectifs OKR pour relier tes projets et tâches à une vision plus grande.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => {
            const pct = goalProgress(goal)
            const isOpen = expanded === goal.id
            return (
              <div key={goal.id} className="rounded-2xl border border-border overflow-hidden" style={{ background: 'var(--card)' }}>
                <button onClick={() => setExpanded(isOpen ? null : goal.id)} className="w-full text-left p-4 flex items-start gap-3 hover:bg-accent/30 transition-colors" aria-expanded={isOpen}>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: STATUS_COLORS[goal.status] + '20', color: STATUS_COLORS[goal.status] }}>{goal.status}</span>
                      <span className="text-xs text-muted-foreground">{PERIOD_LABELS[goal.period]}{goal.dueDate ? ` · ${goal.dueDate}` : ''}</span>
                    </div>
                    <p className="font-semibold text-sm text-foreground">{goal.title}</p>
                    <Progress value={pct} className="h-1.5" aria-label={`Progression : ${pct}%`} />
                    <p className="text-xs text-muted-foreground">{pct}% · {goal.keyResults.length} résultat{goal.keyResults.length !== 1 ? 's' : ''} clé{goal.keyResults.length !== 1 ? 's' : ''}</p>
                  </div>
                  {isOpen ? <ChevronUp size={16} className="text-muted-foreground mt-1 flex-shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground mt-1 flex-shrink-0" />}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                    {goal.description && <p className="text-sm text-muted-foreground">{goal.description}</p>}

                    {/* Key Results */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Résultats clés</p>
                      {goal.keyResults.map((kr) => (
                        <div key={kr.id} className="flex items-center gap-2 rounded-xl bg-muted p-2.5">
                          <div className="flex-1 min-w-0 space-y-1">
                            <input value={kr.title} onChange={(e) => updateKR(goal.id, kr.id, { title: e.target.value })} placeholder="Résultat clé..." className="w-full bg-transparent text-sm text-foreground focus:outline-none" aria-label="Titre du résultat clé" />
                            <div className="flex items-center gap-2">
                              <input type="number" value={kr.current} onChange={(e) => updateKR(goal.id, kr.id, { current: Number(e.target.value) })} className="w-16 h-7 bg-card border border-border rounded-lg px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" aria-label="Valeur actuelle" />
                              <span className="text-xs text-muted-foreground">/</span>
                              <input type="number" value={kr.target} onChange={(e) => updateKR(goal.id, kr.id, { target: Number(e.target.value) })} className="w-16 h-7 bg-card border border-border rounded-lg px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" aria-label="Valeur cible" />
                              <input value={kr.unit} onChange={(e) => updateKR(goal.id, kr.id, { unit: e.target.value })} className="w-12 h-7 bg-card border border-border rounded-lg px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="%" aria-label="Unité" />
                              <Progress value={Math.min(100, (kr.current / Math.max(kr.target, 1)) * 100)} className="flex-1 h-1.5" />
                            </div>
                          </div>
                          <button onClick={() => deleteKR(goal.id, kr.id)} aria-label="Supprimer ce résultat clé" className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"><Trash2 size={13} /></button>
                        </div>
                      ))}
                      <Button size="sm" variant="ghost" onClick={() => addKeyResult(goal.id)} className="h-9 gap-1.5 rounded-xl text-xs w-full">
                        <Plus size={13} /> Ajouter un résultat clé
                      </Button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      {STATUSES.filter((s) => s !== goal.status).map((s) => (
                        <button key={s} onClick={() => updateStatus(goal, s)} className="px-3 py-1.5 rounded-full text-xs border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors">
                          Marquer comme {s}
                        </button>
                      ))}
                      <button onClick={() => remove(goal.id)} className="px-3 py-1.5 rounded-full text-xs border border-border text-destructive/70 hover:border-destructive hover:text-destructive transition-colors ml-auto">
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
