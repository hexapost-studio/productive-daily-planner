'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'
import { GlobalSearch } from '@/components/search/GlobalSearch'
import { getTodayISO, getWeekId } from '@/lib/date-utils'
import { parseISO } from 'date-fns'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useNotifications } from '@/hooks/useNotifications'
import { Suspense } from 'react'
import { SyncTrigger } from './SyncTrigger'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  useKeyboardShortcuts()
  useNotifications()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userName, setUserName] = useState('')
  const [todayProgress, setTodayProgress] = useState(0)

  useEffect(() => {
    try {
      const user = localStorage.getItem('pdp_v1_user')
      if (user) {
        const parsed = JSON.parse(user) as { name?: string }
        setUserName(parsed.name ?? '')
      }
    } catch { /* ignore */ }

    try {
      const today = getTodayISO()
      const weekId = getWeekId(parseISO(today))
      const raw = localStorage.getItem(`pdp_v1_weekly_${weekId}`)
      if (raw) {
        const plan = JSON.parse(raw) as { dailyPlans?: Array<{ date: string; tasks: Array<{ status: string }> }> }
        const daily = plan.dailyPlans?.find((d) => d.date === today)
        if (daily && daily.tasks.length > 0) {
          const done = daily.tasks.filter((t) => t.status === 'Fait').length
          setTodayProgress(Math.round((done / daily.tasks.length) * 100))
        }
      }
    } catch { /* ignore */ }
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <a href="#main-content" className="skip-link">Aller au contenu principal</a>
      <Suspense><SyncTrigger /></Suspense>
      {/* Sidebar — desktop only */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={userName}
        todayProgress={todayProgress}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} userName={userName}>
          <GlobalSearch />
        </TopBar>
        <main id="main-content" className="flex-1 overflow-y-auto main-content-mobile md:pb-0" tabIndex={-1}>
          {children}
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <BottomNav />
    </div>
  )
}
