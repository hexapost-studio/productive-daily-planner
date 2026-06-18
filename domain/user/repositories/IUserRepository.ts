import { UserProfile } from '../entities/UserProfile'

export interface IUserRepository {
  get(): UserProfile
  save(profile: UserProfile): void
}
