import type { RevisionItem } from '@/types';

export type Recall = 'again' | 'hard' | 'good' | 'easy';

export const RECALLS: readonly Recall[] = ['again', 'hard', 'good', 'easy'];

/** Spaced-repetition: how far to push the next review, from how well it was recalled. */
export function nextIntervalDays(current: number, recall: Recall): number {
  switch (recall) {
    case 'again':
      return 1;
    case 'hard':
      return Math.max(1, Math.ceil(current * 1.2));
    case 'good':
      return Math.max(2, Math.round(current * 2));
    case 'easy':
      return Math.max(3, Math.round(current * 3));
  }
}

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
