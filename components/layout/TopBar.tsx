'use client'

import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'

interface TopBarProps {
  onMenuClick: () => void
  userName?: string
  children?: React.ReactNode
}

function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Mon Planner'
  if (pathname.startsWith('/planner/day')) return 'Ma Journée'
  if (pathname.startsWith('/planner/week')) return 'Ma Semaine'
  if (pathname.startsWith('/planner')) return 'Calendrier'
  if (pathname.startsWith('/focus')) return 'Focus'
  if (pathname.startsWith('/projects')) return 'Projets'
  if (pathname.startsWith('/stats')) return 'Statistiques'
  if (pathname.startsWith('/settings')) return 'Réglages'
  if (pathname.startsWith('/auth')) return 'Connexion'
  return 'Productive Daily Planner'
}

export function TopBar({ onMenuClick, children }: TopBarProps) {
  const pathname = usePathname()
  const title = getPageTitle(pathname)

  return (
    <header
      className="h-14 border-b border-border flex items-center px-3 gap-2 md:hidden flex-shrink-0"
      style={{ background: 'var(--sidebar)' }}
    >
      <button
        onClick={onMenuClick}
        className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0 transition-colors"
        aria-label="Menu"
      >
        <Menu size={20} />
      </button>

      <span
        className="flex-1 text-center text-sm font-semibold truncate"
        style={{ fontFamily: 'var(--font-heading)', color: 'var(--foreground)' }}
      >
        {title}
      </span>

      {children ? (
        <div className="flex-shrink-0">{children}</div>
      ) : (
        <div className="w-[44px]" />
      )}
    </header>
  )
}
