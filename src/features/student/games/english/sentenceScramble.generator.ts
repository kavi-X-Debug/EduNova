import type { RoundContext } from '../engine/generate';
import type { Rng } from '../engine/rng';
import { SENTENCES_1, SENTENCES_2, SENTENCES_3 } from './data/sentences';
import { pickForRound, shuffleDifferent } from './pick';

export interface ScrambleRound {
  /** The sentence in its right order. */
  sentence: string;
  /** Its words in the right order. */
  words: string[];
  /** The word tiles, shuffled (never already in the right order). */
  tiles: string[];
}

export const BANKS: Record<1 | 2 | 3, string[]> = { 1: SENTENCES_1, 2: SENTENCES_2, 3: SENTENCES_3 };

/** PURE: the same rng always gives the same round. */
export function makeScrambleRound(rng: Rng, ctx: RoundContext): ScrambleRound {
  const sentence = pickForRound(rng, ctx, BANKS[ctx.level]);
  const words = sentence.split(' ');
  return { sentence, words, tiles: shuffleDifferent(rng, words) };
}

export const ROUNDS_PER_PLAY = 6;
