import type { RoundContext } from '../engine/generate';
import type { Rng } from '../engine/rng';
import { PICTURE_WORDS, type PictureId, type PictureWord } from './data/words';

/** One question. 'word': show a picture, pick its word. 'picture': show a word, pick its picture. */
export interface MatchRound {
  mode: 'word' | 'picture';
  /** The thing the question is about. */
  target: PictureId;
  /** Choices (picture ids; for mode 'word' the word is `wordOf(id).word`). Exactly one is the target. */
  options: PictureId[];
}

export const OPTION_COUNT: Record<1 | 2 | 3, number> = { 1: 3, 2: 4, 3: 4 };
export const ROUNDS_PER_PLAY = 8;

/**
 * Level 1: 3 words. Level 2: 4 words that look alike (same number of pieces). Level 3: the other way round, a word and 4 pictures.
 * PURE.
 */
export function makeMatchRound(rng: Rng, { level }: RoundContext): MatchRound {
  const target: PictureWord = rng.pick(PICTURE_WORDS);
  const others = PICTURE_WORDS.filter((p) => p.id !== target.id);
  const count = OPTION_COUNT[level] - 1;
  let distractors: PictureWord[];
  if (level === 2) {
    const alike = rng.shuffle(others.filter((p) => p.syllables.length === target.syllables.length));
    const rest = rng.shuffle(others.filter((p) => p.syllables.length !== target.syllables.length));
    distractors = [...alike, ...rest].slice(0, count);
  } else {
    distractors = rng.sample(others, count);
  }
  const options = rng.shuffle([target, ...distractors]).map((p) => p.id);
  return { mode: level === 3 ? 'picture' : 'word', target: target.id, options };
}
