'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Mail, Lock, CalendarDays } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handle = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    const supabase = createClient()

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setSuccess('Vérifie ton email pour confirmer ton compte.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/')
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
            <CalendarDays size={24} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Productive Daily Planner</h1>
          <p className="text-xs text-muted-foreground">
            {mode === 'login' ? 'Connecte-toi pour synchroniser tes données' : 'Crée ton compte — gratuit'}
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-border p-6 space-y-4" style={{ background: 'var(--card)' }}>
          <div className="space-y-3">
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-3.5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="ton@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 h-11 bg-muted border-border"
                onKeyDown={(e) => e.key === 'Enter' && handle()}
              />
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-3.5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 h-11 bg-muted border-border"
                onKeyDown={(e) => e.key === 'Enter' && handle()}
              />
            </div>
          </div>

          {error && <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-xs text-green-400 bg-green-400/10 px-3 py-2 rounded-lg">{success}</p>}

          <Button onClick={handle} className="w-full h-11" disabled={loading || !email || !password}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : mode === 'login' ? 'Se connecter' : 'Créer un compte'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-2 text-xs text-muted-foreground">ou</span>
            </div>
          </div>

          <Button variant="outline" onClick={handleGoogle} className="w-full h-11 border-border gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          {mode === 'login' ? "Pas encore de compte ?" : 'Déjà un compte ?'}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
            className="text-primary hover:underline"
          >
            {mode === 'login' ? "S'inscrire" : 'Se connecter'}
          </button>
        </p>

        <p className="text-center text-xs text-muted-foreground">
          <button onClick={() => router.push('/')} className="hover:text-foreground transition-colors">
            Continuer sans compte →
          </button>
        </p>
      </div>
    </div>
  )
}
