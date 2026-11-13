import type { RoundContext } from '../engine/generate';
import type { Rng } from '../engine/rng';
import { SENTENCES } from './data/sentences';

export interface SentenceTile {
  id: string;
  text: string;
}

/** One question: put the shuffled word tiles in order. */
export interface SentenceRound {
  sentenceId: string;
  /** The natural order. */
  answer: string[];
  /** Another order that is also right (two middle words swapped), or null. */
  alternative: string[] | null;
  /** The tiles, shuffled so they do not already make a right sentence. */
  tiles: SentenceTile[];
}

export const ROUNDS_PER_PLAY = 6;

const same = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

/** Right when the placed words are in the natural order or in the accepted alternative. */
export const isSentenceRight = (round: Pick<SentenceRound, 'answer' | 'alternative'>, placed: readonly string[]): boolean =>
  same(placed, round.answer) || (round.alternative !== null && same(placed, round.alternative));

/** PURE: the same rng always gives the same round. */
export function makeSentenceRound(rng: Rng, { level }: RoundContext): SentenceRound {
  const item = rng.pick(SENTENCES[level]);
  const answer = [...item.words];
  const alternative = item.swapMiddle ? [answer[0], answer[2], answer[1], answer[3]] : null;
  const right = { answer, alternative };
  let order = rng.shuffle(answer);
  for (let tries = 0; tries < 20 && isSentenceRight(right, order); tries++) order = rng.shuffle(answer);
  if (isSentenceRight(right, order)) order = [...answer].reverse(); // cannot happen for 3+ different words; belt and braces
  return { sentenceId: item.id, answer, alternative, tiles: order.map((text, i) => ({ id: `w${i}`, text })) };
}
