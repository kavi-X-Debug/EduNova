import type { LearningPathStep } from '@/types';

/** A day's plan is at most this many steps. */
export const PLAN_SIZE = 3;

export interface TodaysPlan {
  /** Up to three steps, in the order to do them. */
  steps: LearningPathStep[];
  /** The step the big Start button leads to (first not done), if any. */
  next?: LearningPathStep;
  /** Minutes still to go (steps not done yet). */
  minutesLeft: number;
  /** Every step in the plan is finished (and there was at least one). */
  allDone: boolean;
}

interface Snapshot {
  day: string;
  ids: string[];
}

const key = (userId: string) => `edunova.plan.${userId}`;
const dayOf = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

function readSnapshot(userId: string): Snapshot | null {
  try {
    const raw = window.localStorage.getItem(key(userId));
    if (!raw) return null;
    const v = JSON.parse(raw) as Snapshot;
    return typeof v.day === 'string' && Array.isArray(v.ids) ? v : null;
  } catch {
    return null;
  }
}

function writeSnapshot(userId: string, snap: Snapshot): void {
  try {
    window.localStorage.setItem(key(userId), JSON.stringify(snap));
  } catch {
    /* storage unavailable: the plan is simply recomputed next time */
  }
}

/** Pure: pick the steps to do next. Steps already in progress come first, then the next step of each subject. */
export function pickUpcoming(path: readonly LearningPathStep[], size = PLAN_SIZE): LearningPathStep[] {
  const inProgress = path.filter((s) => s.status === 'in_progress');
  const next = path.filter((s) => s.status === 'next');
  return [...inProgress, ...next].slice(0, size);
}

/** Pure: turn a list of plan steps into the summary the Home card needs. */
export function summarisePlan(steps: LearningPathStep[]): TodaysPlan {
  const open = steps.filter((s) => s.status !== 'done');
  return {
    steps,
    next: open.find((s) => s.status === 'in_progress') ?? open[0],
    minutesLeft: open.reduce((sum, s) => sum + s.estimatedMinutes, 0),
    allDone: steps.length > 0 && open.length === 0,
  };
}

/**
 * Today's plan. The step ids are frozen for the calendar day (localStorage, this device only) so a step the child
 * finishes stays on the card with a checkmark instead of vanishing. A new day, or ids that no longer exist,
 * builds a fresh plan. Idempotent: calling it twice in a row returns the same plan.
 */
export function resolveTodaysPlan(userId: string, path: readonly LearningPathStep[], now = new Date()): TodaysPlan {
  const day = dayOf(now);
  const stored = readSnapshot(userId);
  const byId = new Map(path.map((s) => [s.id, s]));
  if (stored && stored.day === day && stored.ids.length > 0 && stored.ids.every((id) => byId.has(id))) {
    return summarisePlan(stored.ids.map((id) => byId.get(id) as LearningPathStep));
  }
  const steps = pickUpcoming(path);
  if (steps.length > 0) writeSnapshot(userId, { day, ids: steps.map((s) => s.id) });
  return summarisePlan(steps);
}
