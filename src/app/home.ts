import type { Role } from '@/types';

const HOME: Record<Role, string> = { student: '/student', teacher: '/teacher', admin: '/admin' };
export const homeFor = (role: Role) => HOME[role];
