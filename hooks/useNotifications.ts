'use client'

import { useEffect } from 'react'
import { LS_PREFIX } from '@/lib/constants'
import { getTodayISO, getWeekId } from '@/lib/date-utils'
import { parseISO } from 'date-fns'

interface NotifSettings {
  enabled: boolean
  reminderHour: number
}

export function getNotifSettings(): NotifSettings {
  try {
    const raw = localStorage.getItem(`${LS_PREFIX}notif_settings`)
    if (raw) return JSON.parse(raw) as NotifSettings
  } catch { /* ignore */ }
  return { enabled: false, reminderHour: 9 }
}

export function saveNotifSettings(s: NotifSettings) {
  localStorage.setItem(`${LS_PREFIX}notif_settings`, JSON.stringify(s))
}

export async function requestNotifPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const perm = await Notification.requestPermission()
  return perm === 'granted'
}

function getP1TasksToday(): string[] {
  try {
    const today = getTodayISO()
    const weekId = getWeekId(parseISO(today))
    const raw = localStorage.getItem(`${LS_PREFIX}weekly_${weekId}`)
    if (!raw) return []
    const plan = JSON.parse(raw) as {
      dailyPlans?: Array<{ date: string; tasks: Array<{ designation: string; priority?: string | null; status: string }> }>
    }
    const dp = plan.dailyPlans?.find((d) => d.date === today)
    return (dp?.tasks ?? [])
      .filter((t) => t.priority === 'P1 - Critique' && t.status !== 'Fait' && t.designation)
      .map((t) => t.designation)
  } catch { return [] }
}

export function useNotifications() {
  useEffect(() => {
    const settings = getNotifSettings()
    if (!settings.enabled) return
    if (!('Notification' in window) || Notification.permission !== 'granted') return

    const now = new Date()
    const currentHour = now.getHours()
    const currentMin = now.getMinutes()
    if (currentHour !== settings.reminderHour) return

    const notifKey = `${LS_PREFIX}notif_sent_${getTodayISO()}_${settings.reminderHour}`
    if (localStorage.getItem(notifKey)) return

    const p1Tasks = getP1TasksToday()
    if (p1Tasks.length === 0) return

    localStorage.setItem(notifKey, '1')
    new Notification('🔴 Tâches P1 en attente', {
      body: p1Tasks.slice(0, 3).join('\n') + (p1Tasks.length > 3 ? `\n+${p1Tasks.length - 3} autres` : ''),
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    })

    void currentMin
  }, [])
}
