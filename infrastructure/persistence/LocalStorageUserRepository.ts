import { UserProfile } from '@/domain/user/entities/UserProfile'
import { IUserRepository } from '@/domain/user/repositories/IUserRepository'
import { LS_PREFIX } from '@/lib/constants'

const KEY = `${LS_PREFIX}user`

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  plannerStartDate: null,
}

export class LocalStorageUserRepository implements IUserRepository {
  get(): UserProfile {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return { ...DEFAULT_PROFILE }
      return JSON.parse(raw) as UserProfile
    } catch {
      return { ...DEFAULT_PROFILE }
    }
  }

  save(profile: UserProfile): void {
    try {
      localStorage.setItem(KEY, JSON.stringify(profile))
    } catch {
      // localStorage unavailable (SSR or quota exceeded)
    }
  }
}
