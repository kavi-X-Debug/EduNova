import type { Role, User } from '@/types';
export interface AuthService {
  signIn(email: string, role: Role): Promise<User>;
  signOut(): Promise<void>;
  currentUser(): Promise<User | null>;
}
