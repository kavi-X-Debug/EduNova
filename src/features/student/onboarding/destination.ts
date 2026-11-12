import { homeFor } from '@/app/home';
import { studentService } from '@/services';
import type { Role } from '@/types';

/** A post-login return path is accepted only if it is a same-app path inside the user's own area. */
export function safeFrom(from: unknown, role: Role): string | null {
  if (typeof from !== 'string' || !from.startsWith('/') || from.startsWith('//')) return null;
  const home = homeFor(role);
  return from === home || from.startsWith(`${home}/`) ? from : null;
}

/** Where to send a signed-in user: students without a saved profile go to /onboarding first. */
export async function destinationFor(role: Role, userId: string, from?: unknown): Promise<string> {
  if (role === 'student' && (await studentService.getProfile(userId)) === null) return '/onboarding';
  return safeFrom(from, role) ?? homeFor(role);
}
