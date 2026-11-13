import type { RoundContext } from '../engine/generate';
import type { Rng } from '../engine/rng';
import { TENSES_1, TENSES_2, TENSES_3, type TenseSentence } from './data/tenses';
import { playOrder } from './pick';

export interface TenseRound {
  /** Sentences to sort, in tray order. At least two of each tense. */
  items: TenseSentence[];
}

export const BANKS: Record<1 | 2 | 3, TenseSentence[]> = { 1: TENSES_1, 2: TENSES_2, 3: TENSES_3 };
export const ITEM_COUNT: Record<1 | 2 | 3, number> = { 1: 4, 2: 5, 3: 6 };

/** PURE: the same rng always gives the same round. */
export function makeTenseRound(rng: Rng, ctx: RoundContext): TenseRound {
  const n = ITEM_COUNT[ctx.level];
  const bank = BANKS[ctx.level];
  const order = playOrder(ctx, bank, rng);
  const turn = ctx.index * n;
  const rotated = [...order.slice(turn % order.length), ...order.slice(0, turn % order.length)];
  const past = rotated.filter((s) => s.tense === 'past');
  const present = rotated.filter((s) => s.tense === 'present');
  const nPast = rng.pick([Math.floor(n / 2), Math.ceil(n / 2)]);
  const items = rng.shuffle([...past.slice(0, nPast), ...present.slice(0, n - nPast)]);
  return { items };
}

export const ROUNDS_PER_PLAY = 5;
