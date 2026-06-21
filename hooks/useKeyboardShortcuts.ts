'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getTodayISO, prevDay, nextDay } from '@/lib/date-utils'

export function useKeyboardShortcuts() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore quand on tape dans un input / textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
      // Ignore avec modificateurs
      if (e.ctrlKey || e.metaKey || e.altKey) return

      const dayMatch = pathname.match(/\/planner\/day\/(\d{4}-\d{2}-\d{2})/)
      const currentDate = dayMatch?.[1]

      switch (e.key) {
        case 'g':
        case 'h':
          e.preventDefault()
          router.push('/')
          break
        case 'p':
          e.preventDefault()
          router.push('/planner')
          break
        case 't':
          e.preventDefault()
          router.push(`/planner/day/${getTodayISO()}`)
          break
        case 'b':
          e.preventDefault()
          router.push('/projects')
          break
        case 'ArrowLeft':
          if (currentDate) { e.preventDefault(); router.push(`/planner/day/${prevDay(currentDate)}`) }
          break
        case 'ArrowRight':
          if (currentDate) { e.preventDefault(); router.push(`/planner/day/${nextDay(currentDate)}`) }
          break
        case 'Escape':
          if (pathname.startsWith('/focus')) router.back()
          break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [router, pathname])
}
