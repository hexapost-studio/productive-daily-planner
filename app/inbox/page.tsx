'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { InboxItem } from '@/domain/inbox/entities/InboxItem'
import { LocalStorageInboxRepository } from '@/infrastructure/persistence/LocalStorageInboxRepository'
import { PRIORITY_COLORS } from '@/lib/constants'
import { PRIORITIES } from '@/domain/planning/value-objects/Priority'
import type { Priority } from '@/domain/planning/value-objects/Priority'
import { getTodayISO } from '@/lib/date-utils'
import { getDailyPlan, saveDailyPlan } from '@/application/planning/GetDailyPlan'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Inbox, Plus, Trash2, CalendarDays, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const repo = new LocalStorageInboxRepository()

export default function InboxPage() {
  const router = useRouter()
  const [items, setItems] = useState<InboxItem[]>([])
  const [input, setInput] = useState('')
  const [priority, setPriority] = useState<Priority | ''>('')
  const [schedulingId, setSchedulingId] = useState<string | null>(null)
  const [scheduleDate, setScheduleDate] = useState(getTodayISO())

  const refresh = () => setItems(repo.getAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt)))

  useEffect(() => { refresh() }, [])

  const add = () => {
    if (!input.trim()) return
    const item: InboxItem = {
      id: crypto.randomUUID(),
      designation: input.trim(),
      priority: (priority || null) as InboxItem['priority'],
      createdAt: new Date().toISOString(),
    }
    repo.save(item)
    setInput('')
    setPriority('')
    refresh()
  }

  const remove = (id: string) => { repo.delete(id); refresh() }

  const schedule = (item: InboxItem) => {
    const plan = getDailyPlan(scheduleDate)
    const task = {
      id: crypto.randomUUID(),
      designation: item.designation,
      domain: item.domain ?? '',
      priority: item.priority ?? null,
      estimatedMinutes: null,
      realMinutes: null,
      status: 'À faire' as const,
      remarks: item.notes ?? '',
      position: plan.tasks.length,
      isRecurring: false,
    }
    saveDailyPlan({ ...plan, tasks: [...plan.tasks, task] })
    repo.delete(item.id)
    refresh()
    setSchedulingId(null)
    router.push(`/planner/day/${scheduleDate}`)
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Inbox size={22} className="text-primary" />
        <div>
          <h1 className="text-xl font-bold text-foreground">Inbox</h1>
          <p className="text-xs text-muted-foreground">{items.length} élément{items.length !== 1 ? 's' : ''} en attente</p>
        </div>
      </div>

      {/* Capture rapide */}
      <div className="rounded-2xl border border-border p-4 space-y-3" style={{ background: 'var(--card)' }}>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Capture rapide</p>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="Ce qui te traverse l'esprit..."
            className="flex-1 h-11 bg-muted border-border rounded-xl"
            aria-label="Nouvelle idée ou tâche"
            autoFocus
          />
          <Select value={priority} onValueChange={(v) => setPriority(v as Priority | '')}>
            <SelectTrigger className="h-11 w-28 bg-muted border-border rounded-xl flex-shrink-0">
              <SelectValue placeholder="Priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">—</SelectItem>
              {PRIORITIES.map((p: Priority) => (
                <SelectItem key={p} value={p}><span style={{ color: PRIORITY_COLORS[p] }}>{p.split(' - ')[0]}</span></SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={add} className="h-11 w-11 p-0 flex-shrink-0 rounded-xl" aria-label="Ajouter">
            <Plus size={18} />
          </Button>
        </div>
      </div>

      {/* Liste */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Inbox size={28} className="text-primary" />
          </div>
          <p className="font-semibold text-foreground">Inbox vide ✨</p>
          <p className="text-xs text-muted-foreground max-w-[220px]">Capture toutes tes idées ici, puis planifie-les quand tu es prêt.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border p-4 space-y-3" style={{ background: 'var(--card)' }}>
              <div className="flex items-start gap-3">
                {item.priority && (
                  <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: PRIORITY_COLORS[item.priority] }} aria-hidden="true" />
                )}
                <p className="text-sm text-foreground flex-1">{item.designation}</p>
                <button onClick={() => remove(item.id)} aria-label={`Supprimer ${item.designation}`} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center">
                  <Trash2 size={14} />
                </button>
              </div>

              {schedulingId === item.id ? (
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="h-10 flex-1 rounded-xl border border-border bg-muted px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    aria-label="Date de planification"
                    style={{ colorScheme: 'light' }}
                  />
                  <Button size="sm" onClick={() => schedule(item)} className="h-10 gap-1 rounded-xl flex-shrink-0">
                    <ArrowRight size={14} /> Planifier
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSchedulingId(null)} className="h-10 rounded-xl flex-shrink-0">Annuler</Button>
                </div>
              ) : (
                <button
                  onClick={() => setSchedulingId(item.id)}
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <CalendarDays size={12} /> Planifier dans un jour
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
