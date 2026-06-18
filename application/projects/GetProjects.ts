import { Project } from '@/domain/projects/entities/Project'
import { ProjectType } from '@/domain/projects/entities/ProjectType'
import {
  LocalStorageProjectRepository,
  LocalStorageProjectTypeRepository,
} from '@/infrastructure/persistence/LocalStorageProjectRepository'

const projectRepo = () => new LocalStorageProjectRepository()
const typeRepo = () => new LocalStorageProjectTypeRepository()

export function getProjects(): Project[] {
  return projectRepo().getAll()
}

export function saveProject(project: Project): void {
  projectRepo().save(project)
}

export function deleteProject(id: string): void {
  projectRepo().delete(id)
}

export function getProjectTypes(): ProjectType[] {
  return typeRepo().getAll()
}

export function saveProjectType(type: ProjectType): void {
  typeRepo().save(type)
}

export function deleteProjectType(id: string): void {
  typeRepo().delete(id)
}
