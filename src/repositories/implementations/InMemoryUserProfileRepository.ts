import { UserProfile } from '../../domain/UserProfile';
import { UserProfileRepository } from '../UserProfileRepository';

export class InMemoryUserProfileRepository implements UserProfileRepository {
  private profiles: UserProfile[] = [];

  async save(profile: UserProfile): Promise<UserProfile> {
    const existingIndex = this.profiles.findIndex(p => p.id === profile.id);
    
    if (existingIndex >= 0) {
      this.profiles[existingIndex] = profile;
    } else {
      this.profiles.push(profile);
    }
    
    return profile;
  }

  async findById(id: string): Promise<UserProfile | null> {
    return this.profiles.find(p => p.id === id) || null;
  }

  async findByUserId(userId: string): Promise<UserProfile | null> {
    return this.profiles.find(p => p.userId === userId) || null;
  }

  async update(id: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    const existingIndex = this.profiles.findIndex(p => p.id === id);
    
    if (existingIndex === -1) {
      throw new Error(`Profile with id ${id} not found`);
    }
    
    this.profiles[existingIndex] = { ...this.profiles[existingIndex], ...profile };
    return this.profiles[existingIndex];
  }

  async delete(id: string): Promise<void> {
    const index = this.profiles.findIndex(p => p.id === id);
    if (index !== -1) {
      this.profiles.splice(index, 1);
    }
  }

  async findActiveProfiles(): Promise<UserProfile[]> {
    return this.profiles.filter(p => p.isActive);
  }

  async findByAgeRange(minAge: number, maxAge: number): Promise<UserProfile[]> {
    return this.profiles.filter(p => {
      const age = this.calculateAge(p.dateOfBirth);
      return age >= minAge && age <= maxAge;
    });
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}
