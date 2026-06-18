'use client'

import { useState, useEffect } from 'react'
import { UserProfile } from '@/domain/user/entities/UserProfile'
import { LocalStorageUserRepository } from '@/infrastructure/persistence/LocalStorageUserRepository'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function UserProfileForm() {
  const [profile, setProfile] = useState<UserProfile>({ name: '', plannerStartDate: null })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const repo = new LocalStorageUserRepository()
    setProfile(repo.get())
  }, [])

  const handleSave = () => {
    const repo = new LocalStorageUserRepository()
    repo.save(profile)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4 max-w-md">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Votre nom</label>
        <Input
          value={profile.name}
          onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
          placeholder="Prénom Nom"
          className="bg-muted border-border"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">
          Date de démarrage du planner (dernier lundi de l&apos;année précédente)
        </label>
        <Input
          type="date"
          value={profile.plannerStartDate ?? ''}
          onChange={(e) => setProfile((p) => ({ ...p, plannerStartDate: e.target.value || null }))}
          className="bg-muted border-border"
        />
      </div>
      <Button onClick={handleSave}>
        {saved ? 'Enregistré ✓' : 'Enregistrer'}
      </Button>
    </div>
  )
}
