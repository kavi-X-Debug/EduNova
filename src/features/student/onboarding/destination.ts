import { studentService } from '@/services';
import type { Role } from '@/types';

const HOME: Record<Role, string> = { student: '/student', teacher: '/teacher', admin: '/admin' };

/** Where to send a signed-in user: students without a saved profile go to /onboarding. */
export async function destinationFor(role: Role, userId: string): Promise<string> {
  if (role === 'student' && (await studentService.getProfile(userId)) === null) return '/onboarding';
  return HOME[role];
}
