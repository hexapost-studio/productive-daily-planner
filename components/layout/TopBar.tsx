'use client'

import { Menu } from 'lucide-react'

interface TopBarProps {
  onMenuClick: () => void
  title?: string
}

export function TopBar({ onMenuClick, title }: TopBarProps) {
  return (
    <header className="h-14 border-b border-border flex items-center px-4 gap-4 bg-card lg:hidden">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
      >
        <Menu size={20} />
      </button>
      {title && <span className="font-semibold text-sm truncate">{title}</span>}
    </header>
  )
}
