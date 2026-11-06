import type { Role } from '@/types';
import { readOnboarding } from './onboardingStorage';

const HOME: Record<Role, string> = { student: '/student', teacher: '/teacher', admin: '/admin' };

/** Where to send a signed-in user: students who have not onboarded go to /onboarding. */
export function destinationFor(role: Role, userId: string): string {
  if (role === 'student' && !readOnboarding(userId)) return '/onboarding';
  return HOME[role];
}
