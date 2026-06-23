import { Priority } from '@/domain/planning/value-objects/Priority'

export interface InboxItem {
  id: string
  designation: string
  domain?: string
  priority?: Priority | null
  notes?: string
  createdAt: string
}
