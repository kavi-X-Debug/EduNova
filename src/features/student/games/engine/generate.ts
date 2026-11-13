import type { GameLevel } from '@/types';
import { createRng, type Rng } from './rng';

export interface RoundContext {
  /** 0-based round number. */
  index: number;
  level: GameLevel;
}

/**
 * Builds every round of a play up front, deterministically. Round i uses its own generator seeded
 * `${seed}#${i}`, so a round does not depend on how many numbers earlier rounds used.
 * `makeRound` must be PURE (use only the `rng` it is given).
 */
export function generateRounds<R>(seed: string, level: GameLevel, count: number, makeRound: (rng: Rng, ctx: RoundContext) => R): R[] {
  return Array.from({ length: count }, (_, index) => makeRound(createRng(`${seed}#${index}`), { index, level }));
}

export interface Choices<T> {
  options: T[];
  /** Index of the right answer inside `options`. */
  correctIndex: number;
}

/**
 * Shuffles one right answer among distractors. Duplicates of the right answer (and of each other) are
 * dropped (compared with `same`, default ===), so there is always exactly one right option.
 * Returns at most `count` options and always includes the right one.
 */
export function buildChoices<T>(rng: Rng, correct: T, distractors: readonly T[], count = 4, same: (a: T, b: T) => boolean = (a, b) => a === b): Choices<T> {
  const unique: T[] = [];
  for (const d of distractors) if (!same(d, correct) && !unique.some((u) => same(u, d))) unique.push(d);
  const options = rng.shuffle([correct, ...rng.shuffle(unique).slice(0, Math.max(0, count - 1))]);
  return { options, correctIndex: options.findIndex((o) => same(o, correct)) };
}

/**
 * Near-miss numeric distractors around `correct` (never equal to it, never repeated).
 * `min`/`max` keep them inside a sensible range (e.g. on a number line). May return fewer than `n` if the range is tiny.
 */
export function numericDistractors(rng: Rng, correct: number, n: number, opts: { spread?: number; min?: number; max?: number } = {}): number[] {
  const { spread = 3, min = -Infinity, max = Infinity } = opts;
  const pool: number[] = [];
  for (let d = 1; d <= spread; d++) {
    for (const v of [correct - d, correct + d]) if (v >= min && v <= max) pool.push(v);
  }
  return rng.sample(pool, n);
}
