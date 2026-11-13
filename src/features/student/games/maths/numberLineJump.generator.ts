// Generators import the PURE engine modules directly (no React), so they run in plain unit tests.
import { buildChoices, numericDistractors, type RoundContext } from '../engine/generate';
import type { Rng } from '../engine/rng';

/** One question: the frog starts at `start`, makes each jump in turn (positive = right, negative = left). */
export interface NumberLineRound {
  min: number;
  max: number;
  start: number;
  jumps: number[];
  /** Where the frog lands. */
  answer: number;
  /** 'choose' = tap one of `options`; 'type' = use the number pad. */
  mode: 'choose' | 'type';
  options: number[];
  /** Language-neutral working, e.g. "5 + 3 - 2 = 6". */
  sum: string;
}

interface Spec { min: number; max: number; jumps: [number, number]; maxJump: number; mode: NumberLineRound['mode'] }
export const LEVEL_SPEC: Record<1 | 2 | 3, Spec> = {
  1: { min: 0, max: 10, jumps: [1, 1], maxJump: 5, mode: 'choose' },
  2: { min: 0, max: 20, jumps: [2, 2], maxJump: 8, mode: 'choose' },
  3: { min: -10, max: 10, jumps: [2, 3], maxJump: 9, mode: 'type' },
};

/** The frog never leaves the line: every landing is inside [min, max]. */
function walk(rng: Rng, spec: Spec, count: number): { start: number; jumps: number[] } {
  const start = rng.int(spec.min, spec.max);
  let pos = start;
  const jumps: number[] = [];
  for (let i = 0; i < count; i++) {
    const options: number[] = [];
    for (let d = 1; d <= spec.maxJump; d++) {
      if (pos + d <= spec.max) options.push(d);
      if (pos - d >= spec.min) options.push(-d);
    }
    const jump = rng.pick(options);
    jumps.push(jump);
    pos += jump;
  }
  return { start, jumps };
}

export const workingOut = (start: number, jumps: number[]): string => {
  const answer = jumps.reduce((a, b) => a + b, start);
  return `${start}${jumps.map((j) => (j < 0 ? ` - ${-j}` : ` + ${j}`)).join('')} = ${answer}`;
};

/** PURE: the same rng always gives the same round. */
export function makeNumberLineRound(rng: Rng, { level }: RoundContext): NumberLineRound {
  const spec = LEVEL_SPEC[level];
  const count = rng.int(spec.jumps[0], spec.jumps[1]);
  let picked = walk(rng, spec, count);
  if (level === 3) {
    // challenge level: make sure the frog crosses zero, so negative numbers matter
    for (let tries = 0; tries < 30; tries++) {
      const path = picked.jumps.reduce<number[]>((acc, j) => [...acc, acc[acc.length - 1] + j], [picked.start]);
      if (path.some((p) => p < 0) && path.some((p) => p > 0)) break;
      picked = walk(rng, spec, count);
    }
  }
  const answer = picked.jumps.reduce((a, b) => a + b, picked.start);
  const options =
    spec.mode === 'choose'
      ? buildChoices(rng, answer, numericDistractors(rng, answer, 5, { spread: 3, min: spec.min, max: spec.max })).options
      : [];
  return { min: spec.min, max: spec.max, start: picked.start, jumps: picked.jumps, answer, mode: spec.mode, options, sum: workingOut(picked.start, picked.jumps) };
}

export const ROUNDS_PER_PLAY = 8;
