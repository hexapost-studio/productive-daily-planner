'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { getMonthCalendarDays, formatDateISO, getTodayISO, getWeekId, formatMonthYear } from '@/lib/date-utils'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LS_PREFIX } from '@/lib/constants'

const DAYS_MOBILE = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const DAYS_DESKTOP = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

interface DayMeta { total: number; hasP1: boolean; hasP2: boolean; hasP3: boolean }
type DayMap = Record<string, DayMeta>

function loadDayMap(weeks: (Date | null)[][]): DayMap {
  const map: DayMap = {}
  const seenWeeks = new Set<string>()
  for (const week of weeks) {
    const firstReal = week.find((d) => d !== null) as Date | undefined
    if (!firstReal) continue
    const weekId = getWeekId(firstReal)
    if (seenWeeks.has(weekId)) continue
    seenWeeks.add(weekId)
    try {
      const raw = localStorage.getItem(`${LS_PREFIX}weekly_${weekId}`)
      if (!raw) continue
      const plan = JSON.parse(raw) as {
        dailyPlans?: Array<{
          date: string
          tasks: Array<{ priority?: string | null; status: string }>
        }>
      }
      for (const dp of plan.dailyPlans ?? []) {
        const tasks = dp.tasks ?? []
        map[dp.date] = {
          total: tasks.length,
          hasP1: tasks.some((t) => t.priority === 'P1 - Critique'),
          hasP2: tasks.some((t) => t.priority === 'P2 - Haute'),
          hasP3: tasks.some((t) => t.priority === 'P3 - Normale' || t.priority === 'P4 - Basse'),
        }
      }
    } catch { /* ignore */ }
  }
  return map
}

export default function PlannerPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const today = getTodayISO()

  const calDays = getMonthCalendarDays(year, month)
  const weeks: (Date | null)[][] = []
  for (let i = 0; i < calDays.length; i += 7) weeks.push(calDays.slice(i, i + 7))

  const dayMap = useMemo<DayMap>(
    () => typeof window === 'undefined' ? {} : loadDayMap(weeks),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [year, month],
  )

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg md:text-xl font-bold text-foreground capitalize">
          {formatMonthYear(year, month)}
        </h1>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={prevMonth} className="h-10 w-10 p-0">
            <ChevronLeft size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()) }}
            className="text-xs h-10 px-3"
          >
            Auj.
          </Button>
          <Button variant="ghost" size="sm" onClick={nextMonth} className="h-10 w-10 p-0">
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)' }}>
        {/* Header row */}
        <div className="grid grid-cols-7 md:grid-cols-8 border-b border-border">
          <div className="hidden md:block p-2 text-center">
            <span className="text-xs text-muted-foreground">Sem.</span>
          </div>
          {DAYS_DESKTOP.map((d, i) => (
            <div key={d} className="p-2 text-center">
              <span className="text-xs font-medium text-muted-foreground">
                <span className="md:hidden">{DAYS_MOBILE[i]}</span>
                <span className="hidden md:inline">{d}</span>
              </span>
            </div>
          ))}
        </div>

        {weeks.map((week, wi) => {
          const firstReal = week.find((d) => d !== null) as Date
          const weekId = getWeekId(firstReal)
          const weekNum = weekId.split('-W')[1]

          return (
            <div key={wi} className="grid grid-cols-7 md:grid-cols-8 border-b border-border last:border-0">
              {/* Week number — desktop only */}
              <Link
                href={`/planner/week/${weekId}`}
                className="hidden md:flex p-2 items-center justify-center hover:bg-accent/50 transition-colors border-r border-border"
              >
                <span className="text-xs text-primary font-semibold">S{weekNum}</span>
              </Link>
              {week.map((day, di) => {
                if (!day) return <div key={di} className="p-1 md:p-2 min-h-[44px] md:min-h-[64px] bg-muted/20" />
                const dateStr = formatDateISO(day)
                const isToday = dateStr === today
                const isCurrentMonth = day.getMonth() === month
                const meta = dayMap[dateStr]

                return (
                  <Link
                    key={di}
                    href={`/planner/day/${dateStr}`}
                    className={cn(
                      'p-1 md:p-2 min-h-[44px] md:min-h-[64px] hover:bg-accent/50 transition-colors border-r border-border last:border-0 flex flex-col items-center md:items-start justify-start gap-0.5',
                      !isCurrentMonth && 'opacity-40',
                    )}
                  >
                    <span
                      className={cn(
                        'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0',
                        isToday
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground',
                      )}
                    >
                      {day.getDate()}
                    </span>
                    {meta && meta.total > 0 && (
                      <div className="flex gap-0.5 items-center justify-center md:justify-start flex-wrap" aria-hidden="true">
                        {/* P1 = rond plein rouge */}
                        {meta.hasP1 && <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] flex-shrink-0" title="P1 Critique" />}
                        {/* P2 = carré ambre */}
                        {meta.hasP2 && <span className="w-1.5 h-1.5 rounded-sm bg-[#d97706] flex-shrink-0" title="P2 Haute" />}
                        {/* P3 = losange violet */}
                        {meta.hasP3 && <span className="w-1.5 h-1.5 bg-[#6448b3] flex-shrink-0 rotate-45" title="P3/P4" />}
                        {!meta.hasP1 && !meta.hasP2 && !meta.hasP3 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                        )}
                        <span className="text-[9px] text-muted-foreground hidden md:inline leading-none">{meta.total}</span>
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Tap sur un jour pour y accéder • <span className="hidden md:inline">Tap sur S## pour la semaine</span>
      </p>
    </div>
  )
}
