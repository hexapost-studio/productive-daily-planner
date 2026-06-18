import { Project } from '../entities/Project'
import { ProjectType } from '../entities/ProjectType'

export interface IProjectRepository {
  getAll(): Project[]
  save(project: Project): void
  delete(id: string): void
}

export interface IProjectTypeRepository {
  getAll(): ProjectType[]
  save(type: ProjectType): void
  delete(id: string): void
}
