import type { RoundContext } from '../engine/generate';
import type { Rng } from '../engine/rng';
import { WORDS_1, WORDS_2, WORDS_3, type SpellingWord } from './data/spelling';
import { pickForRound, shuffleDifferent } from './pick';

export interface SpellingRound {
  word: string;
  clue: string;
  /** 'tap' = tap letter tiles in order; 'type' = type the whole word (level 3). */
  mode: 'tap' | 'type';
  /** Tiles to tap (the word's letters, plus extra letters at level 2). Empty in 'type' mode. */
  letters: string[];
  /** Language-neutral spelling shown after a wrong answer, e.g. "c-a-t". */
  spelled: string;
}

export const BANKS: Record<1 | 2 | 3, SpellingWord[]> = { 1: WORDS_1, 2: WORDS_2, 3: WORDS_3 };
export const EXTRA_LETTERS: Record<1 | 2 | 3, number> = { 1: 0, 2: 2, 3: 0 };
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

/** PURE: the same rng always gives the same round. */
export function makeSpellingRound(rng: Rng, ctx: RoundContext): SpellingRound {
  const { level } = ctx;
  const { word, clue } = pickForRound(rng, ctx, BANKS[level]);
  const mode = level === 3 ? 'type' : 'tap';
  let letters: string[] = [];
  if (mode === 'tap') {
    const extras = rng.sample(ALPHABET.filter((c) => !word.includes(c)), EXTRA_LETTERS[level]);
    const base = word.split('');
    // Level 1 shuffles the word itself; try to avoid handing over the word already in order.
    const mixed = shuffleDifferent(rng, base);
    letters = EXTRA_LETTERS[level] ? rng.shuffle([...mixed, ...extras]) : mixed;
  }
  return { word, clue, mode, letters, spelled: word.split('').join('-') };
}

export const ROUNDS_PER_PLAY = 6;
