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
  Cloud,
  BarChart2,
  Inbox,
  Target,
} from 'lucide-react'
import { GlobalSearch } from '@/components/search/GlobalSearch'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  icon: React.ReactNode
  label: string
  exact?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard', exact: true },
  { href: '/inbox', icon: <Inbox size={20} />, label: 'Inbox' },
  { href: '/planner', icon: <CalendarDays size={20} />, label: 'Planificateur' },
  { href: '/projects', icon: <FolderKanban size={20} />, label: 'Projets' },
  { href: '/goals', icon: <Target size={20} />, label: 'Objectifs' },
  { href: '/stats', icon: <BarChart2 size={20} />, label: 'Statistiques' },
  { href: '/settings', icon: <Settings size={20} />, label: 'Paramètres' },
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
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          /* Mobile: drawer plein format */
          'fixed top-0 left-0 h-full z-40 flex flex-col border-r border-border transition-all duration-200',
          'w-60',
          /* Tablette (md-lg): icon-only 64px, pas de texte */
          'md:translate-x-0 md:static md:z-auto md:flex md:w-16',
          /* Desktop (lg+): plein format 240px avec texte */
          'lg:w-60',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
        style={{ background: 'var(--sidebar)' }}
      >
        {/* Logo / Brand */}
        <div className={cn(
          'flex items-center border-b border-border',
          'md:justify-center md:px-0 md:py-4',
          'lg:justify-between lg:px-4 lg:py-4',
          'px-4 py-4',
        )}>
          <div className="lg:block md:hidden">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">PDP 2025</p>
            <p className="text-sm font-semibold text-foreground truncate mt-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
              {userName || 'Mon Planner'}
            </p>
          </div>
          {/* Tablette : icône seule */}
          <div className="hidden md:flex lg:hidden items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <CalendarDays size={20} className="text-primary" />
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-xl text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search — desktop only */}
        <div className="px-3 py-2 border-b border-border hidden lg:block">
          <GlobalSearch />
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 space-y-1 px-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={item.label}
                aria-label={item.label}
                aria-current={isActive(item) ? 'page' : undefined}
                className={cn(
                  'flex items-center rounded-xl text-sm font-medium transition-colors min-h-[44px]',
                  /* Tablette : icône centrée */
                  'md:justify-center md:px-0 md:gap-0',
                  /* Desktop : icône + label */
                  'lg:justify-start lg:gap-3 lg:px-3',
                  'gap-3 px-3',
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                {item.icon}
                <span className="flex-1 lg:block md:hidden">{item.label}</span>
                {active && <ChevronRight size={14} className="lg:block md:hidden" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className={cn(
          'border-t border-border',
          'md:py-3 md:px-2',
          'lg:p-4 lg:space-y-3',
          'p-4 space-y-3',
        )}>
          {/* Progress — desktop only */}
          <div className="hidden lg:block">
            <p className="text-xs text-muted-foreground mb-2">Progression aujourd&apos;hui</p>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${todayProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">{todayProgress}% complété</p>
          </div>

          {/* Cloud sync */}
          <Link href="/auth" onClick={onClose}>
            <button
              title="Sync cloud / Google"
              className={cn(
                'flex items-center rounded-xl text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors min-h-[40px]',
                'md:justify-center md:w-full md:gap-0 md:px-0',
                'lg:gap-2 lg:px-3 lg:w-full',
                'gap-2 px-3 w-full',
              )}
            >
              <Cloud size={16} />
              <span className="lg:inline md:hidden">Sync cloud</span>
            </button>
          </Link>
        </div>
      </aside>
    </>
  )
}
