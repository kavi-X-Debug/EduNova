import type { RevisionItem } from '@/types';

export type Recall = 'again' | 'hard' | 'good' | 'easy';

export const RECALLS: readonly Recall[] = ['again', 'hard', 'good', 'easy'];

/** Quality (0-5) sent to recordReview; the service decides the next interval (>= 3 advances, lower resets). */
export const RECALL_QUALITY: Record<Recall, number> = { again: 1, hard: 3, good: 4, easy: 5 };

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Whole calendar days from `now` to the due date: 0 = today, negative = earlier. */
export function dayOffset(dueAt: string, now: number): number {
  return Math.round((startOfDay(new Date(dueAt).getTime()) - startOfDay(now)) / 86_400_000);
}

export interface SplitQueue {
  ready: RevisionItem[];
  upcoming: RevisionItem[];
}

/** Ready = due today or earlier. Both lists sorted by due date. */
export function splitQueue(items: readonly RevisionItem[], now: number): SplitQueue {
  const sorted = [...items].sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  return {
    ready: sorted.filter((i) => dayOffset(i.dueAt, now) <= 0),
    upcoming: sorted.filter((i) => dayOffset(i.dueAt, now) > 0),
  };
}
