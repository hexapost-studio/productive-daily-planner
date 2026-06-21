'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, X, Clock, Target, Sparkles } from 'lucide-react'

interface MorningRitualProps {
  onComplete: (data: { availableHours: number; intentions: string[] }) => void
  onSkip: () => void
}

export function MorningRitual({ onComplete, onSkip }: MorningRitualProps) {
  const [step, setStep] = useState(0)
  const [hours, setHours] = useState(8)
  const [intentions, setIntentions] = useState(['', '', ''])
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()

    const trap = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSkip()
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    }
    el.addEventListener('keydown', trap)
    return () => el.removeEventListener('keydown', trap)
  }, [step, onSkip])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  const next = () => {
    if (step < 2) setStep((s) => s + 1)
    else onComplete({ availableHours: hours, intentions: intentions.filter(Boolean) })
  }

  const skip = () => {
    sessionStorage.setItem('ritual_skipped', '1')
    onSkip()
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onSkip() }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Rituel matinal — étape ${step + 1} sur 3`}
        className="w-full max-w-md rounded-2xl border border-border p-6 space-y-6"
        style={{ background: 'var(--card)' }}
      >
        {/* Progress dots */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i < step ? 'bg-primary w-3' : i === step ? 'bg-primary w-6' : 'bg-border w-3'
                }`}
              />
            ))}
          </div>
          <button onClick={skip} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent">
            <X size={16} />
          </button>
        </div>

        {/* Step 0 — Greeting */}
        {step === 0 && (
          <div className="text-center space-y-4 py-2">
            <div className="text-5xl">☀️</div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{greeting} !</h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Prends 2 minutes pour planifier ta journée<br/>intentionnellement.
              </p>
            </div>
            <div className="text-xs text-muted-foreground bg-muted rounded-xl px-4 py-3 italic leading-relaxed">
              &ldquo;La productivité, c&apos;est choisir ce qui compte<br/>avant que quelque chose l&apos;impose.&rdquo;
            </div>
          </div>
        )}

        {/* Step 1 — Hours */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-primary flex-shrink-0" />
              <h2 className="text-lg font-bold text-foreground">Combien d&apos;heures as-tu ?</h2>
            </div>
            <p className="text-sm text-muted-foreground">Hors réunions et imprévus.</p>

            <div className="flex items-center gap-4 py-2">
              <button
                onClick={() => setHours((h) => Math.max(1, h - 1))}
                className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-xl hover:bg-accent transition-colors font-medium"
              >
                −
              </button>
              <div className="flex-1 text-center">
                <span className="text-5xl font-bold text-primary">{hours}</span>
                <span className="text-xl text-muted-foreground ml-1.5">h</span>
              </div>
              <button
                onClick={() => setHours((h) => Math.min(16, h + 1))}
                className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-xl hover:bg-accent transition-colors font-medium"
              >
                +
              </button>
            </div>

            <div className="flex gap-2 justify-center">
              {[4, 6, 8].map((h) => (
                <button
                  key={h}
                  onClick={() => setHours(h)}
                  className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors ${
                    hours === h
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Intentions */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target size={20} className="text-primary flex-shrink-0" />
              <h2 className="text-lg font-bold text-foreground">Tes 3 intentions du jour</h2>
            </div>
            <p className="text-sm text-muted-foreground">Ce qui compte vraiment aujourd&apos;hui.</p>
            <div className="space-y-2.5">
              {intentions.map((val, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <Input
                    value={val}
                    onChange={(e) => setIntentions((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
                    placeholder={['Ce qui compte le plus...', 'Ensuite...', 'Et aussi...'][i]}
                    className="h-11 bg-muted border-border"
                    autoFocus={i === 0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && i < 2) {
                        const next = document.querySelectorAll<HTMLInputElement>('input[placeholder]')[i + 1]
                        next?.focus()
                      }
                      if (e.key === 'Enter' && i === 2) next()
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="flex gap-2">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="h-11 border-border px-4">
              ←
            </Button>
          )}
          <Button onClick={next} className="flex-1 h-11 gap-2">
            {step < 2 ? (
              <><ArrowRight size={16} /> Continuer</>
            ) : (
              <><Sparkles size={16} /> Lancer ma journée !</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
