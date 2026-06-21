'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarDays, Briefcase, Settings, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', icon: LayoutDashboard, label: 'Accueil', exact: true },
  { href: '/planner', icon: CalendarDays, label: 'Planner' },
  { href: '/projects', icon: Briefcase, label: 'Projets' },
  { href: '/stats', icon: BarChart2, label: 'Stats' },
  { href: '/settings', icon: Settings, label: 'Réglages' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex md:hidden z-50 bottom-nav-safe"
      style={{ background: 'var(--sidebar)', borderTop: '1px solid var(--border)', height: '72px' }}
    >
      {NAV_ITEMS.map(({ href, icon: Icon, label, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            aria-label={label}
            className="flex-1 flex flex-col items-center justify-center gap-1 transition-all min-h-[44px] relative"
          >
            {/* Pill indicator */}
            <span
              className={cn(
                'flex items-center justify-center w-12 h-7 rounded-full transition-all duration-200',
                isActive
                  ? 'bg-primary/12'
                  : 'bg-transparent',
              )}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={cn(
                  'transition-colors duration-200',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
              />
            </span>
            <span
              className={cn(
                'text-[10px] font-semibold leading-none transition-colors duration-200',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
