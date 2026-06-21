'use client'

import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CalendarDays, Clock } from 'lucide-react'

interface GEvent {
  id: string
  title: string
  start?: string
  end?: string
  isAllDay: boolean
  colorId?: string
}

const GOOGLE_COLORS: Record<string, string> = {
  '1': '#7986cb', '2': '#33b679', '3': '#8e24aa', '4': '#e67c73',
  '5': '#f6c026', '6': '#f5511d', '7': '#039be5', '8': '#616161',
  '9': '#3f51b5', '10': '#0b8043', '11': '#d60000',
}

function fmtTime(dt: string | undefined) {
  if (!dt) return ''
  try {
    return format(parseISO(dt), 'HH:mm', { locale: fr })
  } catch { return '' }
}

interface CalendarEventsProps {
  date: string
}

export function CalendarEvents({ date }: CalendarEventsProps) {
  const [events, setEvents] = useState<GEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`/api/calendar?date=${date}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(true); return }
        setEvents(d.events ?? [])
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [date])

  // Si non connecté Google ou erreur → ne rien afficher
  if (loading || error || events.length === 0) return null

  return (
    <div className="rounded-xl border border-border p-3 md:p-4 space-y-2" style={{ background: 'var(--card)' }}>
      <div className="flex items-center gap-2">
        <CalendarDays size={14} className="text-primary flex-shrink-0" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Google Agenda ({events.length})
        </p>
      </div>
      <div className="space-y-1.5">
        {events.map((e) => {
          const color = e.colorId ? GOOGLE_COLORS[e.colorId] : '#6366f1'
          return (
            <div
              key={e.id}
              className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg"
              style={{ background: color + '18', borderLeft: `3px solid ${color}` }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{e.title}</p>
                {!e.isAllDay && e.start && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock size={10} className="text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      {fmtTime(e.start)}{e.end ? ` → ${fmtTime(e.end)}` : ''}
                    </span>
                  </div>
                )}
                {e.isAllDay && <span className="text-[10px] text-muted-foreground">Journée entière</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
