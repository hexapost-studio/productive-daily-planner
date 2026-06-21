'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, CalendarDays, Briefcase, RefreshCcw } from 'lucide-react'
import { LS_PREFIX } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface SearchResult {
  type: 'task' | 'project'
  id: string
  title: string
  subtitle: string
  href: string
  priority?: string | null
}

function searchAll(query: string): SearchResult[] {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  const results: SearchResult[] = []

  // Recherche dans tous les plans hebdo
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(`${LS_PREFIX}weekly_`)) continue
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const plan = JSON.parse(raw) as {
        dailyPlans?: Array<{
          date: string
          tasks: Array<{ id: string; designation: string; domain: string; priority?: string | null; status: string }>
        }>
      }
      for (const dp of plan.dailyPlans ?? []) {
        for (const task of dp.tasks ?? []) {
          if (!task.designation) continue
          if (task.designation.toLowerCase().includes(q) || task.domain?.toLowerCase().includes(q)) {
            results.push({
              type: 'task',
              id: task.id,
              title: task.designation,
              subtitle: dp.date,
              href: `/planner/day/${dp.date}`,
              priority: task.priority,
            })
            if (results.length >= 20) return results
          }
        }
      }
    } catch { /* ignore */ }
  }

  // Recherche dans les projets
  try {
    const raw = localStorage.getItem(`${LS_PREFIX}projects`)
    if (raw) {
      const projects = JSON.parse(raw) as Array<{ id: string; designation: string; status: string; type?: string }>
      for (const p of projects) {
        if (p.designation?.toLowerCase().includes(q) || p.type?.toLowerCase().includes(q)) {
          results.push({
            type: 'project',
            id: p.id,
            title: p.designation,
            subtitle: `${p.status}${p.type ? ` · ${p.type}` : ''}`,
            href: '/projects',
          })
          if (results.length >= 20) return results
        }
      }
    }
  } catch { /* ignore */ }

  return results
}

const PRIORITY_DOT: Record<string, string> = {
  'P1 - Critique': '#ef4444',
  'P2 - Haute': '#f97316',
  'P3 - Normale': '#6366f1',
  'P4 - Basse': '#6b7280',
}

export function GlobalSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIdx, setSelectedIdx] = useState(0)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const search = useCallback((q: string) => {
    setQuery(q)
    setSelectedIdx(0)
    setResults(searchAll(q))
  }, [])

  const navigate = (href: string) => {
    router.push(href)
    setOpen(false)
    setQuery('')
    setResults([])
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && results[selectedIdx]) navigate(results[selectedIdx].href)
  }

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      className="flex items-center justify-center w-10 h-10 rounded-xl border border-border bg-muted text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-accent transition-colors"
      aria-label="Rechercher"
    >
      <Search size={16} />
      <span className="hidden sm:inline text-xs ml-1.5">Rechercher</span>
      <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-background border border-border font-mono">⌘K</kbd>
    </button>
  )

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-lg rounded-xl border border-border shadow-2xl overflow-hidden" style={{ background: 'var(--card)' }}>
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search size={16} className="text-muted-foreground flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => search(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Rechercher une tâche, un projet..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button onClick={() => setOpen(false)} className="p-1 rounded text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query && results.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
              <RefreshCcw size={20} className="opacity-40" />
              <p className="text-sm">Aucun résultat pour « {query} »</p>
            </div>
          )}
          {!query && (
            <p className="text-xs text-muted-foreground text-center py-8">Tape pour chercher dans tes tâches et projets</p>
          )}

          {results.length > 0 && (
            <div className="py-2">
              {/* Group tasks */}
              {results.filter((r) => r.type === 'task').length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-1.5 flex items-center gap-1.5">
                    <CalendarDays size={11} /> Tâches
                  </p>
                  {results.filter((r) => r.type === 'task').map((r, i) => {
                    const absIdx = results.indexOf(r)
                    return (
                      <button
                        key={r.id}
                        onClick={() => navigate(r.href)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                          absIdx === selectedIdx ? 'bg-primary/15' : 'hover:bg-accent/50',
                        )}
                      >
                        {r.priority && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PRIORITY_DOT[r.priority] ?? '#6366f1' }} />}
                        {!r.priority && <span className="w-2 h-2 rounded-full bg-muted-foreground flex-shrink-0" />}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-foreground truncate">{r.title}</p>
                          <p className="text-[10px] text-muted-foreground">{r.subtitle}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
              {/* Group projects */}
              {results.filter((r) => r.type === 'project').length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-1.5 flex items-center gap-1.5 mt-1">
                    <Briefcase size={11} /> Projets
                  </p>
                  {results.filter((r) => r.type === 'project').map((r) => {
                    const absIdx = results.indexOf(r)
                    return (
                      <button
                        key={r.id}
                        onClick={() => navigate(r.href)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                          absIdx === selectedIdx ? 'bg-primary/15' : 'hover:bg-accent/50',
                        )}
                      >
                        <Briefcase size={14} className="text-primary flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-foreground truncate">{r.title}</p>
                          <p className="text-[10px] text-muted-foreground">{r.subtitle}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-border px-4 py-2 flex gap-3 text-[10px] text-muted-foreground">
          <span>↑↓ naviguer</span>
          <span>↵ ouvrir</span>
          <span>Esc fermer</span>
        </div>
      </div>
    </div>
  )
}
