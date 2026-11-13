import type { RoundContext } from '../engine/generate';
import type { Rng } from '../engine/rng';
import { OPPOSITES, PLURALS, YOUNG_ANIMALS, type PairKind, type WordPair } from './data/wordPairs';
import { playOrder, shuffleDifferent } from './pick';

/** One round: match every word on the left with its partner on the right. */
export interface WordMatchRound {
  kind: PairKind;
  /** The pairs in left-column order. */
  pairs: { a: string; b: string }[];
  /** rightOrder[j] = which pair's `b` is shown at row j of the right column. Never the identity. */
  rightOrder: number[];
}

export const PAIR_COUNT: Record<1 | 2 | 3, number> = { 1: 4, 2: 5, 3: 6 };
export const KINDS: Record<1 | 2 | 3, PairKind[]> = {
  1: ['opposite', 'young'],
  2: ['opposite', 'plural', 'young'],
  3: ['plural', 'young', 'opposite'],
};
const BANK: Record<PairKind, WordPair[]> = { opposite: OPPOSITES, plural: PLURALS, young: YOUNG_ANIMALS };

/** PURE: the same rng always gives the same round. */
export function makeWordMatchRound(rng: Rng, ctx: RoundContext): WordMatchRound {
  const { level, index } = ctx;
  const kinds = KINDS[level];
  const kind = kinds[index % kinds.length];
  const n = PAIR_COUNT[level];
  // Pairs up to this level, the level's own (harder) tier first; a play-level shuffle, rotated per round of this kind.
  const pool = BANK[kind].filter((p) => p.tier <= level);
  const ordered = [...playOrder(ctx, pool, rng)].sort((x, y) => Number(y.tier === level) - Number(x.tier === level));
  const turn = Math.floor(index / kinds.length);
  const start = (turn * n) % ordered.length;
  const rotated = [...ordered.slice(start), ...ordered.slice(0, start)];
  const used = new Set<string>();
  const pairs: { a: string; b: string }[] = [];
  for (const p of rotated) {
    if (pairs.length === n) break;
    if (used.has(p.a) || used.has(p.b)) continue; // every word on the board appears once
    used.add(p.a);
    used.add(p.b);
    pairs.push({ a: p.a, b: p.b });
  }
  const rightOrder = shuffleDifferent(rng, pairs.map((_, i) => i));
  return { kind, pairs, rightOrder };
}

export const ROUNDS_PER_PLAY = 5;
