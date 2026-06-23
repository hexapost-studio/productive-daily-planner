import { Contact } from '@/domain/contacts/entities/Contact'
import { LS_PREFIX } from '@/lib/constants'

const KEY = `${LS_PREFIX}contacts`

export class LocalStorageContactRepository {
  getAll(): Contact[] {
    try {
      const raw = localStorage.getItem(KEY)
      return raw ? (JSON.parse(raw) as Contact[]) : []
    } catch { return [] }
  }

  save(contact: Contact): void {
    const all = this.getAll().filter((c) => c.id !== contact.id)
    localStorage.setItem(KEY, JSON.stringify([...all, contact]))
  }

  delete(id: string): void {
    localStorage.setItem(KEY, JSON.stringify(this.getAll().filter((c) => c.id !== id)))
  }

  saveAll(contacts: Contact[]): void {
    localStorage.setItem(KEY, JSON.stringify(contacts))
  }
}
