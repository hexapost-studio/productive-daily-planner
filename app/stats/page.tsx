'use client'

import { useEffect, useState } from 'react'
import { BarChart2, CheckCircle, Clock, Target, TrendingUp } from 'lucide-react'
import { LS_PREFIX } from '@/lib/constants'
import { getTodayWeekId, prevWeekId } from '@/lib/date-utils'

interface WeekStat {
  weekId: string
  label: string
  total: number
  done: number
  pct: number
  estimatedMin: number
  realMin: number
}

interface PriorityStat { label: string; count: number; color: string }

function loadStats() {
  const weeks: WeekStat[] = []
  let weekId = getTodayWeekId()
  for (let i = 0; i < 8; i++) {
    try {
      const raw = localStorage.getItem(`${LS_PREFIX}weekly_${weekId}`)
      if (raw) {
        const plan = JSON.parse(raw) as {
          weekNumber?: number
          dailyPlans?: Array<{ tasks: Array<{ status: string; estimatedMinutes?: number | null; realMinutes?: number | null; priority?: string | null }> }>
        }
        const allTasks = plan.dailyPlans?.flatMap((d) => d.tasks) ?? []
        if (allTasks.length > 0) {
          const done = allTasks.filter((t) => t.status === 'Fait').length
          weeks.push({
            weekId,
            label: `S${plan.weekNumber ?? weekId.split('-W')[1]}`,
            total: allTasks.length,
            done,
            pct: Math.round((done / allTasks.length) * 100),
            estimatedMin: allTasks.reduce((a, t) => a + (t.estimatedMinutes ?? 0), 0),
            realMin: allTasks.reduce((a, t) => a + (t.realMinutes ?? 0), 0),
          })
        }
      }
    } catch { /* ignore */ }
    weekId = prevWeekId(weekId)
  }
  return weeks.reverse()
}

function loadPriorityStats(): PriorityStat[] {
  const counts: Record<string, number> = { 'P1 - Critique': 0, 'P2 - Haute': 0, 'P3 - Normale': 0, 'P4 - Basse': 0, 'Sans priorité': 0 }
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(`${LS_PREFIX}weekly_`)) continue
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const plan = JSON.parse(raw) as { dailyPlans?: Array<{ tasks: Array<{ priority?: string | null }> }> }
      for (const dp of plan.dailyPlans ?? []) {
        for (const t of dp.tasks ?? []) {
          const p = t.priority ?? 'Sans priorité'
          if (p in counts) counts[p]++
          else counts['Sans priorité']++
        }
      }
    } catch { /* ignore */ }
  }
  return [
    { label: 'P1', count: counts['P1 - Critique'], color: '#ef4444' },
    { label: 'P2', count: counts['P2 - Haute'], color: '#f97316' },
    { label: 'P3', count: counts['P3 - Normale'], color: '#6366f1' },
    { label: 'P4', count: counts['P4 - Basse'], color: '#6b7280' },
    { label: 'Aucune', count: counts['Sans priorité'], color: '#374151' },
  ]
}

function loadProjectStats() {
  try {
    const raw = localStorage.getItem(`${LS_PREFIX}projects`)
    if (!raw) return []
    const projects = JSON.parse(raw) as Array<{ status: string }>
    const counts: Record<string, number> = {}
    for (const p of projects) { counts[p.status] = (counts[p.status] ?? 0) + 1 }
    return Object.entries(counts).map(([label, count]) => ({ label, count }))
  } catch { return [] }
}

const STATUS_COLORS: Record<string, string> = {
  'En cours': '#6366f1', 'Terminé': '#10b981', 'En attente': '#f59e0b', 'En pause': '#6b7280', 'Annulé': '#ef4444',
}

function BarChart({ data, maxVal, colorFn }: { data: { label: string; value: number }[]; maxVal: number; colorFn: (d: { label: string; value: number }) => string }) {
  if (maxVal === 0) return <p className="text-xs text-muted-foreground text-center py-4">Pas de données</p>
  return (
    <div className="flex items-end gap-2 h-32 mt-2">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[10px] text-muted-foreground">{d.value > 0 ? d.value : ''}</span>
          <div
            className="w-full rounded-t-md transition-all"
            style={{
              height: `${maxVal > 0 ? Math.max((d.value / maxVal) * 100, d.value > 0 ? 8 : 0) : 0}%`,
              background: colorFn(d),
              minHeight: d.value > 0 ? '4px' : '0',
            }}
          />
          <span className="text-[10px] text-muted-foreground text-center leading-tight">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color?: string }) {
  return (
    <div className="rounded-xl border border-border p-4" style={{ background: 'var(--card)' }}>
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">{icon}<span className="text-xs">{label}</span></div>
      <p className="text-2xl font-bold" style={{ color: color ?? 'var(--foreground)' }}>{value}</p>
    </div>
  )
}

export default function StatsPage() {
  const [weeks, setWeeks] = useState<WeekStat[]>([])
  const [priorities, setPriorities] = useState<PriorityStat[]>([])
  const [projectStats, setProjectStats] = useState<{ label: string; count: number }[]>([])

  useEffect(() => {
    setWeeks(loadStats())
    setPriorities(loadPriorityStats())
    setProjectStats(loadProjectStats())
  }, [])

  const totalDone = weeks.reduce((a, w) => a + w.done, 0)
  const totalTasks = weeks.reduce((a, w) => a + w.total, 0)
  const avgPct = weeks.length > 0 ? Math.round(weeks.reduce((a, w) => a + w.pct, 0) / weeks.length) : 0
  const totalRealH = Math.round(weeks.reduce((a, w) => a + w.realMin, 0) / 60)

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <BarChart2 size={22} className="text-primary" />
        <h1 className="text-xl font-bold text-foreground">Statistiques</h1>
      </div>

      {/* KPI cards — 2 cols mobile, 4 cols tablet+ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Tâches faites" value={String(totalDone)} icon={<CheckCircle size={14} />} color="#10b981" />
        <StatCard label="Total planifiées" value={String(totalTasks)} icon={<Target size={14} />} />
        <StatCard label="Taux moyen" value={`${avgPct}%`} icon={<TrendingUp size={14} />} color="#6366f1" />
        <StatCard label="Heures réelles" value={`${totalRealH}h`} icon={<Clock size={14} />} color="#f59e0b" />
      </div>

      {/* Completion rate per week */}
      <div className="rounded-xl border border-border p-4 md:p-5" style={{ background: 'var(--card)' }}>
        <h2 className="font-semibold text-sm text-foreground mb-1">Taux de complétion — 8 dernières semaines</h2>
        <p className="text-xs text-muted-foreground mb-3">% de tâches terminées par semaine</p>
        {weeks.length === 0
          ? <p className="text-xs text-muted-foreground text-center py-6">Pas encore de données. Commence à planifier tes journées !</p>
          : <BarChart
              data={weeks.map((w) => ({ label: w.label, value: w.pct }))}
              maxVal={100}
              colorFn={(d) => d.value >= 80 ? '#10b981' : d.value >= 50 ? '#6366f1' : '#f97316'}
            />
        }
      </div>

      {/* 2-col charts grid on tablet+ */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Temps estimé vs réel */}
        <div className="rounded-xl border border-border p-4 md:p-5" style={{ background: 'var(--card)' }}>
          <h2 className="font-semibold text-sm text-foreground mb-1">Temps estimé vs réel (min)</h2>
          <p className="text-xs text-muted-foreground mb-3">Par semaine</p>
          {weeks.length === 0
            ? <p className="text-xs text-muted-foreground text-center py-6">Pas de données</p>
            : <div className="flex items-end gap-2 h-32 mt-2">
                {weeks.map((w) => {
                  const max = Math.max(...weeks.map((x) => Math.max(x.estimatedMin, x.realMin)), 1)
                  return (
                    <div key={w.weekId} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex gap-0.5 items-end" style={{ height: '112px' }}>
                        <div className="flex-1 rounded-t-sm bg-primary/40" style={{ height: `${(w.estimatedMin / max) * 100}%`, minHeight: w.estimatedMin > 0 ? '2px' : '0' }} />
                        <div className="flex-1 rounded-t-sm bg-primary" style={{ height: `${(w.realMin / max) * 100}%`, minHeight: w.realMin > 0 ? '2px' : '0' }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{w.label}</span>
                    </div>
                  )
                })}
              </div>
          }
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary/40" /><span className="text-xs text-muted-foreground">Estimé</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary" /><span className="text-xs text-muted-foreground">Réel</span></div>
          </div>
        </div>

        {/* Répartition par priorité */}
        <div className="rounded-xl border border-border p-4 md:p-5" style={{ background: 'var(--card)' }}>
          <h2 className="font-semibold text-sm text-foreground mb-1">Répartition par priorité</h2>
          <p className="text-xs text-muted-foreground mb-3">Toutes les tâches confondues</p>
          <BarChart
            data={priorities.map((p) => ({ label: p.label, value: p.count }))}
            maxVal={Math.max(...priorities.map((p) => p.count), 1)}
            colorFn={(d) => priorities.find((p) => p.label === d.label)?.color ?? '#6366f1'}
          />
        </div>
      </div>

      {/* Projets par statut */}
      {projectStats.length > 0 && (
        <div className="rounded-xl border border-border p-4 md:p-5" style={{ background: 'var(--card)' }}>
          <h2 className="font-semibold text-sm text-foreground mb-4">Projets par statut</h2>
          <div className="flex flex-wrap gap-3">
            {projectStats.map(({ label, count }) => (
              <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[label] ?? '#6b7280' }} />
                <span className="text-sm font-medium text-foreground">{count}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
