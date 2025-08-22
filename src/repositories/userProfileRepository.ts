import { UserProfile } from "../types/health";
import { BaseLocalStorageRepository } from "./baseRepository";

const STORAGE_KEY = "health_user_profile";

export interface UserProfileRepository {
  getUserProfile(): UserProfile | null;
  saveUserProfile(profile: UserProfile): void;
}

class LocalStorageUserProfileRepository extends BaseLocalStorageRepository implements UserProfileRepository {

  getUserProfile(): UserProfile | null {
    return this.getItem<UserProfile>(STORAGE_KEY);
  }

  saveUserProfile(profile: UserProfile): void {
    this.setItem(STORAGE_KEY, profile);
  }
}

export const userProfileRepository = new LocalStorageUserProfileRepository();
