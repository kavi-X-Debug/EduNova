import { tk } from '@/i18n';
import type { BadgeDef } from '@/types';

/** XP needed to reach level n (n >= 1): 0, 50, 200, 450, ... (quadratic, so early levels come quickly). */
export const xpForLevel = (level: number): number => 50 * (level - 1) ** 2;
export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1;
}

export const XP = { lesson: 20, practice: 15, quiz: 30, strongQuizBonus: 20, revision: 15, review: 5, mission: 10, tutor: 5, source: 5 } as const;

/** Badge catalogue. Add a badge here + its i18n keys + a docs/BADGES.md entry (+ optional public/badges/<id>.png). */
export const BADGES: BadgeDef[] = [
  { id: 'first-lesson', titleKey: tk('rewards.badge.first-lesson.title'), descriptionKey: tk('rewards.badge.first-lesson.desc'), criteria: { metric: 'lessons_completed', target: 1 }, category: 'learning', rarity: 'common' },
  { id: 'practice-pal', titleKey: tk('rewards.badge.practice-pal.title'), descriptionKey: tk('rewards.badge.practice-pal.desc'), criteria: { metric: 'practice_completed', target: 3 }, category: 'learning', rarity: 'common' },
  { id: 'unit-complete', titleKey: tk('rewards.badge.unit-complete.title'), descriptionKey: tk('rewards.badge.unit-complete.desc'), criteria: { metric: 'units_completed', target: 1 }, category: 'learning', rarity: 'uncommon' },
  { id: 'unit-trio', titleKey: tk('rewards.badge.unit-trio.title'), descriptionKey: tk('rewards.badge.unit-trio.desc'), criteria: { metric: 'units_completed', target: 3 }, category: 'learning', rarity: 'rare' },
  { id: 'term-complete', titleKey: tk('rewards.badge.term-complete.title'), descriptionKey: tk('rewards.badge.term-complete.desc'), criteria: { metric: 'terms_completed', target: 1 }, category: 'learning', rarity: 'epic' },
  { id: 'strong-quiz', titleKey: tk('rewards.badge.strong-quiz.title'), descriptionKey: tk('rewards.badge.strong-quiz.desc'), criteria: { metric: 'strong_quizzes', target: 1 }, category: 'mastery', rarity: 'uncommon' },
  { id: 'strong-quiz-3', titleKey: tk('rewards.badge.strong-quiz-3.title'), descriptionKey: tk('rewards.badge.strong-quiz-3.desc'), criteria: { metric: 'strong_quizzes', target: 3 }, category: 'mastery', rarity: 'rare' },
  { id: 'streak-3', titleKey: tk('rewards.badge.streak-3.title'), descriptionKey: tk('rewards.badge.streak-3.desc'), criteria: { metric: 'best_streak_days', target: 3 }, category: 'habits', rarity: 'common' },
  { id: 'streak-7', titleKey: tk('rewards.badge.streak-7.title'), descriptionKey: tk('rewards.badge.streak-7.desc'), criteria: { metric: 'best_streak_days', target: 7 }, category: 'habits', rarity: 'uncommon' },
  { id: 'first-review', titleKey: tk('rewards.badge.first-review.title'), descriptionKey: tk('rewards.badge.first-review.desc'), criteria: { metric: 'reviews_completed', target: 1 }, category: 'habits', rarity: 'common' },
  { id: 'revision-streak', titleKey: tk('rewards.badge.revision-streak.title'), descriptionKey: tk('rewards.badge.revision-streak.desc'), criteria: { metric: 'revision_recall_streak', target: 5 }, category: 'habits', rarity: 'uncommon' },
  { id: 'welcome-back', titleKey: tk('rewards.badge.welcome-back.title'), descriptionKey: tk('rewards.badge.welcome-back.desc'), criteria: { metric: 'comebacks', target: 1 }, category: 'habits', rarity: 'uncommon' },
  { id: 'first-question', titleKey: tk('rewards.badge.first-question.title'), descriptionKey: tk('rewards.badge.first-question.desc'), criteria: { metric: 'tutor_questions', target: 1 }, category: 'curiosity', rarity: 'common' },
  { id: 'source-checker', titleKey: tk('rewards.badge.source-checker.title'), descriptionKey: tk('rewards.badge.source-checker.desc'), criteria: { metric: 'sources_checked', target: 1 }, category: 'curiosity', rarity: 'uncommon' },
  { id: 'quest-finisher', titleKey: tk('rewards.badge.quest-finisher.title'), descriptionKey: tk('rewards.badge.quest-finisher.desc'), criteria: { metric: 'quests_completed', target: 1 }, category: 'quests', rarity: 'common' },
  { id: 'quest-trio', titleKey: tk('rewards.badge.quest-trio.title'), descriptionKey: tk('rewards.badge.quest-trio.desc'), criteria: { metric: 'quests_completed', target: 3 }, category: 'quests', rarity: 'rare' },
];
export const badgeById = (id: string): BadgeDef | undefined => BADGES.find((b) => b.id === id);
