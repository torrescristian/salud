import { UserProfile } from '../UserProfile';

export interface UserProfileRepository {
  save(profile: UserProfile): Promise<UserProfile>;
  findById(id: string): Promise<UserProfile | null>;
  update(id: string, data: Partial<UserProfile>): Promise<UserProfile>;
  delete(id: string): Promise<boolean>;
  findAll(): Promise<UserProfile[]>;
}
