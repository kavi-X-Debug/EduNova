import type { BadgeProgress, RewardEvent, RewardOutcome, RewardSummary } from '@/types';

/**
 * Rewards are private to the student. There is deliberately NO method that lists or compares other
 * students; the only cross-user read is `getBadgeCount` (a count, for a teacher's encouragement).
 */
export interface RewardsService {
  getSummary(userId: string): Promise<RewardSummary>;
  /** Whole catalogue with earned/locked state and progress toward each criterion. */
  listBadges(userId: string): Promise<BadgeProgress[]>;
  /** Most recently earned first. */
  listRecentBadges(userId: string, limit?: number): Promise<BadgeProgress[]>;
  /** Count only (teacher student-detail). Never a rank or comparison. */
  getBadgeCount(studentId: string): Promise<{ earned: number; total: number }>;
  /** Records a completion event: grants XP, updates the streak, awards badges. Returns what changed. */
  recordEvent(userId: string, event: RewardEvent): Promise<RewardOutcome>;
}
