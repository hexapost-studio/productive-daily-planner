'use client'

import { useEffect, useState } from 'react'
import { getProjects, getProjectTypes } from '@/application/projects/GetProjects'
import { Project } from '@/domain/projects/entities/Project'
import { ProjectType } from '@/domain/projects/entities/ProjectType'
import { ProjectBoard } from '@/components/projects/ProjectBoard'
import { FolderKanban } from 'lucide-react'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([])

  const refresh = () => {
    setProjects(getProjects())
    setProjectTypes(getProjectTypes())
  }

  useEffect(() => {
    refresh()
  }, [])

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4 md:space-y-6">
      <div className="flex items-center gap-3">
        <FolderKanban size={22} className="text-primary" />
        <div>
          <h1 className="text-xl font-bold text-foreground">Project Board</h1>
          <p className="text-xs text-muted-foreground">{projects.length} projet{projects.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <ProjectBoard projects={projects} projectTypes={projectTypes} onRefresh={refresh} />
    </div>
  )
}
