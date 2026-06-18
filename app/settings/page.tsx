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
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function SettingsPage() {
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([])
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([])

  const refreshTypes = () => setProjectTypes(getProjectTypes())
  const refreshRecurring = () => setRecurringTasks(getRecurringTasks())

  useEffect(() => {
    refreshTypes()
    refreshRecurring()
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Settings size={22} className="text-primary" />
        <h1 className="text-xl font-bold text-foreground">Paramètres</h1>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="bg-muted border border-border">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="types">Types de projets</TabsTrigger>
          <TabsTrigger value="recurring">Tâches récurrentes</TabsTrigger>
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
      </Tabs>
    </div>
  )
}
