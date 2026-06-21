'use client'

import { useEffect, useRef, useCallback } from 'react'

type Politeness = 'polite' | 'assertive'

export function useAnnounce() {
  const regionRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = document.createElement('div')
    el.setAttribute('aria-live', 'polite')
    el.setAttribute('aria-atomic', 'true')
    el.setAttribute('role', 'status')
    el.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0'
    document.body.appendChild(el)
    regionRef.current = el
    return () => { document.body.removeChild(el) }
  }, [])

  const announce = useCallback((message: string, politeness: Politeness = 'polite') => {
    const el = regionRef.current
    if (!el) return
    el.setAttribute('aria-live', politeness)
    el.textContent = ''
    requestAnimationFrame(() => { el.textContent = message })
  }, [])

  return announce
}
