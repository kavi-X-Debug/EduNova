import type { GamePlayInput, GameStat, Mastery } from '@/types';
import { makeMastery } from '@/lib/mastery';

/**
 * Mock game progress (in memory + localStorage), per student. Private: nothing here lists or compares students.
 * Mastery nudge rules (educationally safe): small, bounded, and only ever moves the BAND through `makeMastery`;
 * no mark or percent is stored or shown. Total movement a game can cause per concept is capped
 * (-NUDGE_FLOOR .. +NUDGE_CEIL), so playing games can never replace lessons and quizzes.
 */
const KEY = 'edunova.mock.games.';
export const NUDGE_FLOOR = 0.05;
export const NUDGE_CEIL = 0.15;

interface State {
  stats: Record<string, GameStat>;
  /** Cumulative mastery change per concept caused by games. */
  nudged: Record<string, number>;
}

const states = new Map<string, State>();

function load(userId: string): State {
  const mem = states.get(userId);
  if (mem) return mem;
  let s: State = { stats: {}, nudged: {} };
  try {
    const raw = window.localStorage.getItem(KEY + userId);
    if (raw) {
      const p = JSON.parse(raw) as Partial<State>;
      s = { stats: p.stats ?? {}, nudged: p.nudged ?? {} };
    }
  } catch {
    /* ignore unreadable storage */
  }
  states.set(userId, s);
  return s;
}

function save(userId: string, s: State): void {
  try {
    window.localStorage.setItem(KEY + userId, JSON.stringify(s));
  } catch {
    /* storage unavailable: progress lasts for this session only */
  }
}

/** Pure: how much one play moves a concept (before the cumulative cap). Between -0.02 and +0.04. */
export function nudgeFor(correct: number, total: number): number {
  const ratio = total > 0 ? correct / total : 0;
  return Math.min(0.04, Math.max(-0.02, (ratio - 0.6) * 0.1));
}

export function recordGame(userId: string, gameId: string, input: GamePlayInput, mastery: Mastery[]): GameStat {
  const s = load(userId);
  const now = new Date().toISOString();
  const stars = Math.min(3, Math.max(1, Math.round(input.stars)));
  const prev = s.stats[gameId];
  const stat: GameStat = {
    gameId,
    subject: input.subject,
    plays: (prev?.plays ?? 0) + 1,
    bestStars: Math.max(prev?.bestStars ?? 0, stars),
    lastStars: stars,
    lastPlayedAt: now,
  };
  s.stats[gameId] = stat;

  const delta = nudgeFor(input.correct, input.total);
  for (const conceptId of input.conceptIds) {
    const i = mastery.findIndex((m) => m.conceptId === conceptId);
    if (i < 0) continue; // never invent mastery for a concept the child has not started
    const before = s.nudged[conceptId] ?? 0;
    const after = Math.min(NUDGE_CEIL, Math.max(-NUDGE_FLOOR, before + delta));
    const applied = after - before;
    if (applied === 0) continue;
    s.nudged[conceptId] = after;
    mastery[i] = makeMastery(conceptId, mastery[i].level + applied, now);
  }
  save(userId, s);
  return { ...stat };
}

export function listStats(userId: string): GameStat[] {
  return Object.values(load(userId).stats).map((x) => ({ ...x }));
}
