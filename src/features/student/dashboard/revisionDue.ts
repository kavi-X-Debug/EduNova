import type { RevisionItem } from '@/types';

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Same rule as the Revision page ("ready now"): due today or earlier, by calendar day.
 * Keep in sync with src/features/student/revision/scheduling.ts splitQueue.
 */
export function countReadyNow(items: readonly RevisionItem[], now: number): number {
  return items.filter((i) => startOfDay(new Date(i.dueAt).getTime()) <= startOfDay(now)).length;
}
