// Features import ONLY from '@/services'.
// To move to Express + Supabase, replace the four instances below; nothing else changes.
import type { AdminService } from './admin';
import type { AuthService } from './auth';
import type { StudentService } from './student';
import type { TeacherService } from './teacher';
import type { ProfileService } from './profile';
import type { RewardsService } from './rewards';
import { mockAdminService, mockAuthService, mockStudentService, mockTeacherService } from '@/mocks/mockServices';
import { mockProfileService } from '@/mocks/profile';
import { mockRewardsService } from '@/mocks/rewards';
import { withRewardNotifications, withRewards } from './rewardHooks';

export type { AuthService } from './auth';
export type { StudentService, StudentProfile } from './student';
export type { TeacherService } from './teacher';
export type { AdminService } from './admin';
export type { ProfileService } from './profile';
export type { RewardsService } from './rewards';
export { onRewardOutcome } from './rewardHooks';

export const authService: AuthService = mockAuthService;
export const profileService: ProfileService = mockProfileService;
export const rewardsService: RewardsService = withRewardNotifications(mockRewardsService);
// Completion flows record reward events (XP, streak, badges) through rewardsService.
export const studentService: StudentService = withRewards(mockStudentService, rewardsService);
export const teacherService: TeacherService = mockTeacherService;
export const adminService: AdminService = mockAdminService;

// Mock-only helper (remove with the mocks): failure/empty toggles.
export { mockControls } from '@/mocks/config';
