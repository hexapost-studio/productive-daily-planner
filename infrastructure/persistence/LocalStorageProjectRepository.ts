import { Project } from '@/domain/projects/entities/Project'
import { ProjectType } from '@/domain/projects/entities/ProjectType'
import { IProjectRepository, IProjectTypeRepository } from '@/domain/projects/repositories/IProjectRepository'
import { LS_PREFIX } from '@/lib/constants'

const PROJECTS_KEY = `${LS_PREFIX}projects`
const TYPES_KEY = `${LS_PREFIX}project_types`

export class LocalStorageProjectRepository implements IProjectRepository {
  private load(): Project[] {
    try {
      const raw = localStorage.getItem(PROJECTS_KEY)
      if (!raw) return []
      return JSON.parse(raw) as Project[]
    } catch {
      return []
    }
  }

  private persist(projects: Project[]): void {
    try {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
    } catch {
      // ignore
    }
  }

  getAll(): Project[] {
    return this.load().sort((a, b) => a.position - b.position)
  }

  save(project: Project): void {
    const all = this.load()
    const idx = all.findIndex((p) => p.id === project.id)
    if (idx >= 0) {
      all[idx] = project
    } else {
      all.push(project)
    }
    this.persist(all)
  }

  delete(id: string): void {
    const all = this.load().filter((p) => p.id !== id)
    this.persist(all)
  }
}

export class LocalStorageProjectTypeRepository implements IProjectTypeRepository {
  private load(): ProjectType[] {
    try {
      const raw = localStorage.getItem(TYPES_KEY)
      if (!raw) return []
      return JSON.parse(raw) as ProjectType[]
    } catch {
      return []
    }
  }

  private persist(types: ProjectType[]): void {
    try {
      localStorage.setItem(TYPES_KEY, JSON.stringify(types))
    } catch {
      // ignore
    }
  }

  getAll(): ProjectType[] {
    return this.load().sort((a, b) => a.position - b.position)
  }

  save(type: ProjectType): void {
    const all = this.load()
    const idx = all.findIndex((t) => t.id === type.id)
    if (idx >= 0) {
      all[idx] = type
    } else {
      all.push(type)
    }
    this.persist(all)
  }

  delete(id: string): void {
    const all = this.load().filter((t) => t.id !== id)
    this.persist(all)
  }
}
