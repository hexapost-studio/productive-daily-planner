'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  FolderKanban,
  Settings,
  ChevronRight,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  icon: React.ReactNode
  label: string
  exact?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard', exact: true },
  { href: '/planner', icon: <CalendarDays size={18} />, label: 'Planificateur' },
  { href: '/projects', icon: <FolderKanban size={18} />, label: 'Projets' },
  { href: '/settings', icon: <Settings size={18} />, label: 'Paramètres' },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
  userName: string
  todayProgress: number
}

export function Sidebar({ open, onClose, userName, todayProgress }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 z-40 flex flex-col border-r border-border transition-transform duration-200',
          'lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{ background: 'var(--sidebar)' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">PDP 2025</p>
            <p className="text-sm font-semibold text-foreground truncate mt-0.5">
              {userName || 'Mon Planner'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors group',
                isActive(item)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {isActive(item) && <ChevronRight size={14} />}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Progression aujourd&apos;hui</p>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${todayProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">{todayProgress}% complété</p>
        </div>
      </aside>
    </>
  )
}
