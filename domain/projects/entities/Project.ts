import { ProjectStatus } from '../value-objects/ProjectStatus'
import { ImpactLevel } from '../value-objects/ImpactLevel'

export interface Project {
  id: string
  position: number
  designation: string
  type: string
  priority: string
  impactLevel: ImpactLevel
  startDate: string | null
  deadline: string | null
  status: ProjectStatus
  progress: number
  keyPeople: string
  comments: string
}
