'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getMonthCalendarDays, formatDateISO, getTodayISO, getWeekId, formatMonthYear } from '@/lib/date-utils'
import { DAYS_FR_SHORT, MONTHS_FR } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PlannerPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const today = getTodayISO()

  const calDays = getMonthCalendarDays(year, month)

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const weeks: (Date | null)[][] = []
  for (let i = 0; i < calDays.length; i += 7) {
    weeks.push(calDays.slice(i, i + 7))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground capitalize">{formatMonthYear(year, month)}</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={prevMonth}>
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()) }}
            className="text-xs"
          >
            Aujourd&apos;hui
          </Button>
          <Button variant="ghost" size="sm" onClick={nextMonth}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)' }}>
        <div className="grid grid-cols-8 border-b border-border">
          <div className="p-3 text-center">
            <span className="text-xs text-muted-foreground">Sem.</span>
          </div>
          {DAYS_FR_SHORT.map((d) => (
            <div key={d} className="p-3 text-center">
              <span className="text-xs font-medium text-muted-foreground">{d}</span>
            </div>
          ))}
        </div>

        {weeks.map((week, wi) => {
          const firstReal = week.find((d) => d !== null) as Date
          const weekId = getWeekId(firstReal)
          const weekNum = weekId.split('-W')[1]

          return (
            <div key={wi} className="grid grid-cols-8 border-b border-border last:border-0">
              <Link
                href={`/planner/week/${weekId}`}
                className="p-2 flex items-center justify-center hover:bg-accent/50 transition-colors border-r border-border"
              >
                <span className="text-xs text-primary font-semibold">S{weekNum}</span>
              </Link>
              {week.map((day, di) => {
                if (!day) {
                  return <div key={di} className="p-2 min-h-[72px] bg-muted/20" />
                }
                const dateStr = formatDateISO(day)
                const isToday = dateStr === today
                const isCurrentMonth = day.getMonth() === month

                return (
                  <Link
                    key={di}
                    href={`/planner/day/${dateStr}`}
                    className={cn(
                      'p-2 min-h-[72px] hover:bg-accent/50 transition-colors border-r border-border last:border-0',
                      !isCurrentMonth && 'opacity-40',
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={cn(
                          'text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full',
                          isToday
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground',
                        )}
                      >
                        {day.getDate()}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs">•</span>
          Aujourd&apos;hui
        </span>
        <span>Cliquez sur une semaine (S##) ou un jour pour y accéder</span>
      </div>
    </div>
  )
}
