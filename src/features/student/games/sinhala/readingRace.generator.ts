import { buildChoices, type RoundContext } from '../engine/generate';
import type { Rng } from '../engine/rng';
import { PASSAGES } from './data/passages';

/** One question: a short passage (shown line by line for read-along) and a question about it. */
export interface ReadingRound {
  passageId: string;
  sentences: string[];
  question: string;
  options: string[];
  /** The right answer text (exactly one option equals it). */
  answer: string;
}

export const ROUNDS_PER_PLAY = 6;

/** PURE: the same rng always gives the same round. */
export function makeReadingRound(rng: Rng, { level }: RoundContext): ReadingRound {
  const passage = rng.pick(PASSAGES[level]);
  const q = rng.pick(passage.questions);
  const { options } = buildChoices(rng, q.right, q.wrong, 3);
  return { passageId: passage.id, sentences: [...passage.sentences], question: q.question, options, answer: q.right };
}
