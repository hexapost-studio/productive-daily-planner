'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserProfileForm } from '@/components/settings/UserProfileForm'
import { ProjectTypeForm } from '@/components/settings/ProjectTypeForm'
import { RecurringTaskForm } from '@/components/settings/RecurringTaskForm'
import { getProjectTypes } from '@/application/projects/GetProjects'
import { getRecurringTasks } from '@/application/recurring/GetRecurringTasks'
import { ProjectType } from '@/domain/projects/entities/ProjectType'
import { RecurringTask } from '@/domain/recurring/entities/RecurringTask'
import { Settings, Bell, BellOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getNotifSettings, saveNotifSettings, requestNotifPermission } from '@/hooks/useNotifications'

export default function SettingsPage() {
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([])
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([])
  const [notifEnabled, setNotifEnabled] = useState(false)
  const [notifHour, setNotifHour] = useState(9)
  const [notifSupported, setNotifSupported] = useState(true)

  const refreshTypes = () => setProjectTypes(getProjectTypes())
  const refreshRecurring = () => setRecurringTasks(getRecurringTasks())

  useEffect(() => {
    refreshTypes()
    refreshRecurring()
    setNotifSupported('Notification' in window)
    const s = getNotifSettings()
    setNotifEnabled(s.enabled)
    setNotifHour(s.reminderHour)
  }, [])

  const toggleNotifications = async () => {
    if (!notifEnabled) {
      const granted = await requestNotifPermission()
      if (!granted) return
    }
    const next = !notifEnabled
    setNotifEnabled(next)
    saveNotifSettings({ enabled: next, reminderHour: notifHour })
  }

  const updateNotifHour = (h: number) => {
    setNotifHour(h)
    saveNotifSettings({ enabled: notifEnabled, reminderHour: h })
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4 md:space-y-6">
      <div className="flex items-center gap-3">
        <Settings size={22} className="text-primary" />
        <h1 className="text-xl font-bold text-foreground">Paramètres</h1>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="bg-muted border border-border">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="types">Types de projets</TabsTrigger>
          <TabsTrigger value="recurring">Tâches récurrentes</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <div className="rounded-xl border border-border p-6" style={{ background: 'var(--card)' }}>
            <h2 className="font-semibold text-foreground mb-4">Profil utilisateur</h2>
            <UserProfileForm />
          </div>
        </TabsContent>

        <TabsContent value="types" className="mt-6">
          <div className="rounded-xl border border-border p-6" style={{ background: 'var(--card)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Types de projets</h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="inline-flex">
                      <Button variant="outline" size="sm" disabled className="border-border text-muted-foreground pointer-events-none">
                        Importer depuis Excel
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Fonctionnalité à venir dans une prochaine version</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <ProjectTypeForm types={projectTypes} onRefresh={refreshTypes} />
          </div>
        </TabsContent>

        <TabsContent value="recurring" className="mt-6">
          <div className="rounded-xl border border-border p-6" style={{ background: 'var(--card)' }}>
            <div className="mb-4">
              <h2 className="font-semibold text-foreground">Tâches récurrentes</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Ces tâches sont automatiquement injectées dans chaque nouvelle journée correspondante.
                Maximum {5} par jour.
              </p>
            </div>
            <RecurringTaskForm tasks={recurringTasks} onRefresh={refreshRecurring} />
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <div className="rounded-xl border border-border p-6 space-y-5" style={{ background: 'var(--card)' }}>
            <div>
              <h2 className="font-semibold text-foreground mb-1">Notifications</h2>
              <p className="text-xs text-muted-foreground">Reçois une notification browser pour tes tâches P1 non commencées.</p>
            </div>
            {!notifSupported && (
              <p className="text-sm text-muted-foreground">Les notifications ne sont pas supportées par ce navigateur.</p>
            )}
            {notifSupported && (
              <>
                <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-3">
                    {notifEnabled ? <Bell size={18} className="text-primary" /> : <BellOff size={18} className="text-muted-foreground" />}
                    <div>
                      <p className="text-sm font-medium text-foreground">Rappels P1</p>
                      <p className="text-xs text-muted-foreground">{notifEnabled ? 'Activés' : 'Désactivés'}</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleNotifications}
                    className={`relative w-11 h-6 rounded-full transition-colors ${notifEnabled ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifEnabled ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
                {notifEnabled && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Heure du rappel matinal</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={0}
                        max={23}
                        value={notifHour}
                        onChange={(e) => updateNotifHour(Number(e.target.value))}
                        className="w-20 h-10 rounded-lg border border-border bg-muted text-foreground text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-sm text-muted-foreground">h00</span>
                    </div>
                    <p className="text-xs text-muted-foreground">La notification s&apos;affiche une fois par jour à cette heure si tu as des tâches P1 non commencées.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
