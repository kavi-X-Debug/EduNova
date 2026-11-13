import type { PasswordChange, UserProfile } from '@/types';

/** Shared by all roles. Grade/subjects/language for students stay on StudentService.get/saveProfile. */
export interface ProfileService {
  getProfile(userId: string): Promise<UserProfile>;
  updateProfile(userId: string, patch: Partial<Omit<UserProfile, 'userId'>>): Promise<UserProfile>;
  /** MOCK ONLY: validates the shape and succeeds. No password is stored or checked. Rejects with Error('weak'|'same'|'missing'). */
  changePassword(userId: string, change: PasswordChange): Promise<void>;
}
