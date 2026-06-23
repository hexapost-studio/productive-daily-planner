import { InboxItem } from '@/domain/inbox/entities/InboxItem'
import { LS_PREFIX } from '@/lib/constants'

const KEY = `${LS_PREFIX}inbox`

export class LocalStorageInboxRepository {
  getAll(): InboxItem[] {
    try {
      const raw = localStorage.getItem(KEY)
      return raw ? (JSON.parse(raw) as InboxItem[]) : []
    } catch { return [] }
  }

  save(item: InboxItem): void {
    const items = this.getAll().filter((i) => i.id !== item.id)
    localStorage.setItem(KEY, JSON.stringify([...items, item]))
  }

  delete(id: string): void {
    localStorage.setItem(KEY, JSON.stringify(this.getAll().filter((i) => i.id !== id)))
  }

  saveAll(items: InboxItem[]): void {
    localStorage.setItem(KEY, JSON.stringify(items))
  }
}
