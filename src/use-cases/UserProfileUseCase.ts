import { UserProfile, calculateDefaultGlucoseLimits, calculateDefaultPressureLimits } from '../domain/UserProfile';
import { UserProfileRepository } from '../domain/repositories/UserProfileRepository';

export interface CreateUserProfileData {
  name: string;
  birthDate: Date;
  weight: number;
  height: number;
  medicalConditions: string[];
}

export interface UpdateUserProfileData {
  name?: string;
  weight?: number;
  height?: number;
  medicalConditions?: string[];
  glucoseLimits?: {
    fasting?: { min: number; max: number };
    postPrandial?: { min: number; max: number };
  };
  pressureLimits?: {
    systolic?: { min: number; max: number };
    diastolic?: { min: number; max: number };
  };
  measurementFrequency?: {
    glucose?: number;
    pressure?: number;
  };
}

export class UserProfileUseCase {
  constructor(private userProfileRepository: UserProfileRepository) {}

  async createProfile(data: CreateUserProfileData): Promise<UserProfile> {
    if (!this.validateProfileData(data)) {
      throw new Error('Invalid user data provided');
    }

    const age = this.calculateAgeFromBirthDate(data.birthDate);
    const glucoseLimits = calculateDefaultGlucoseLimits(age, data.weight, data.height);
    const pressureLimits = calculateDefaultPressureLimits(age, data.weight, data.height);

    const userProfile = new UserProfile({
      id: this.generateId(),
      ...data,
      glucoseLimits,
      pressureLimits,
      measurementFrequency: {
        glucose: 3,
        pressure: 2
      }
    });

    return await this.userProfileRepository.save(userProfile);
  }

  async updateProfile(id: string, data: UpdateUserProfileData): Promise<UserProfile> {
    const existingProfile = await this.userProfileRepository.findById(id);
    if (!existingProfile) {
      throw new Error('User profile not found');
    }

    // Validate updated values
    if (data.weight !== undefined && data.weight <= 0) {
      throw new Error('Weight must be positive');
    }
    if (data.height !== undefined && data.height <= 0) {
      throw new Error('Height must be positive');
    }
    if (data.glucoseLimits?.fasting && data.glucoseLimits.fasting.min >= data.glucoseLimits.fasting.max) {
      throw new Error('Min value must be less than max value');
    }

    const updatedProfile = await this.userProfileRepository.update(id, data);
    return updatedProfile;
  }

  async getProfile(id: string): Promise<UserProfile> {
    const profile = await this.userProfileRepository.findById(id);
    if (!profile) {
      throw new Error('User profile not found');
    }
    return profile;
  }

  async deleteProfile(id: string): Promise<boolean> {
    const existingProfile = await this.userProfileRepository.findById(id);
    if (!existingProfile) {
      throw new Error('User profile not found');
    }

    return await this.userProfileRepository.delete(id);
  }

  async getAllProfiles(): Promise<UserProfile[]> {
    return await this.userProfileRepository.findAll();
  }

  validateProfileData(data: CreateUserProfileData): boolean {
    if (!data.name || data.name.trim() === '') {
      return false;
    }
    if (data.weight <= 0) {
      return false;
    }
    if (data.height <= 0) {
      return false;
    }
    if (!data.birthDate) {
      return false;
    }
    if (!data.medicalConditions) {
      return false;
    }
    return true;
  }

  async calculateBMI(id: string): Promise<number> {
    const profile = await this.getProfile(id);
    return profile.calculateBMI();
  }

  async calculateAge(id: string): Promise<number> {
    const profile = await this.getProfile(id);
    return profile.getAge();
  }

  private calculateAgeFromBirthDate(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
