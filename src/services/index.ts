// Features import ONLY from '@/services'.
// To move to Express + Supabase, replace the four instances below; nothing else changes.
import type { AdminService } from './admin';
import type { AuthService } from './auth';
import type { StudentService } from './student';
import type { TeacherService } from './teacher';
import { mockAdminService, mockAuthService, mockStudentService, mockTeacherService } from '@/mocks/mockServices';

export type { AuthService } from './auth';
export type { StudentService, StudentProfile } from './student';
export type { TeacherService } from './teacher';
export type { AdminService } from './admin';

export const authService: AuthService = mockAuthService;
export const studentService: StudentService = mockStudentService;
export const teacherService: TeacherService = mockTeacherService;
export const adminService: AdminService = mockAdminService;

// Mock-only helper (remove with the mocks): failure/empty toggles.
export { mockControls } from '@/mocks/config';
