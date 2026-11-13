import type { RoundContext } from '../engine/generate';
import type { Rng } from '../engine/rng';
import { BUILDER_POOLS, PICTURE_WORDS, wordOf, type PictureId } from './data/words';

export interface BuilderTile {
  /** Unique id inside the round (`t0`, `t1`...). */
  id: string;
  /** One syllable (letter with its signs). */
  text: string;
}

/** One question: build the word of a picture from tiles (some levels add spare tiles that do not belong). */
export interface WordBuilderRound {
  picture: PictureId;
  /** The word to build. */
  word: string;
  /** The right tiles in order, e.g. ["බ", "ළ", "ලා"]. */
  answer: string[];
  /** All tiles, shuffled: the right ones plus `spare` extras. */
  tiles: BuilderTile[];
}

export const SPARE_TILES: Record<1 | 2 | 3, number> = { 1: 0, 2: 1, 3: 2 };
export const ROUNDS_PER_PLAY = 6;

/** Right when the placed texts spell the word, in order. */
export const isWordBuilt = (round: Pick<WordBuilderRound, 'answer'>, placed: readonly string[]): boolean =>
  placed.length === round.answer.length && placed.every((t, i) => t === round.answer[i]);

/** PURE: the same rng always gives the same round. */
export function makeWordBuilderRound(rng: Rng, { level }: RoundContext): WordBuilderRound {
  const picture = rng.pick(BUILDER_POOLS[level]);
  const { word, syllables } = wordOf(picture);
  // spare tiles: syllables of other words that are not needed (and are all different), so there is exactly one way to build the word
  const taken = new Set(syllables);
  const pool = Array.from(new Set(PICTURE_WORDS.filter((p) => p.id !== picture).flatMap((p) => p.syllables))).filter((s) => !taken.has(s));
  const spare = rng.sample(pool, SPARE_TILES[level]);
  const tiles = rng.shuffle([...syllables, ...spare]).map((text, i) => ({ id: `t${i}`, text }));
  return { picture, word, answer: [...syllables], tiles };
}
