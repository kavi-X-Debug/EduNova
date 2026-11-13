import { buildChoices, type RoundContext } from '../engine/generate';
import type { Rng } from '../engine/rng';
import { assembleSort, type SortRound } from './sortHelpers';

export type MagnetBin = 'sticks' | 'notSticks';
export type Pole = 'N' | 'S';

/** Things a magnet pulls (iron or steel). */
export const MAGNETIC = ['nail', 'paperClip', 'needle', 'nut', 'safetyPin'] as const;
/** Everyday things a magnet ignores. */
export const EASY_NOT = ['woodSpoon', 'plasticComb', 'paper', 'rubberBand', 'leaf', 'glassMarble', 'eraser', 'stone'] as const;
/** Metals that look like they should stick, but do not. */
export const TRICKY_NOT = ['aluminiumFoil', 'copperWire'] as const;

export type MagnetRound =
  | ({ kind: 'sort' } & SortRound<MagnetBin>)
  /** Two bar magnets face to face: the right end of the left one (`a`) and the left end of the right one (`b`). */
  | { kind: 'poles'; a: Pole; b: Pole; answer: 'attract' | 'repel' }
  | { kind: 'pickup'; options: string[]; answer: string };

export const ROUNDS_PER_PLAY = 8;
/** Level 1: sort 4 things; level 2: sort 6 things (one tricky metal); level 3: poles and "which one sticks". */
export const LEVEL_SPEC = { 1: { sortCount: 4 }, 2: { sortCount: 6 }, 3: { sortCount: 0 } } as const;

export function makeMagnetRound(rng: Rng, { level }: RoundContext): MagnetRound {
  if (level === 1) {
    return { kind: 'sort', ...assembleSort<MagnetBin>(rng, [['sticks', rng.sample(MAGNETIC, 2)], ['notSticks', rng.sample(EASY_NOT, 2)]]) };
  }
  if (level === 2) {
    return {
      kind: 'sort',
      ...assembleSort<MagnetBin>(rng, [['sticks', rng.sample(MAGNETIC, 3)], ['notSticks', [...rng.sample(EASY_NOT, 2), rng.pick(TRICKY_NOT)]]]),
    };
  }
  if (rng.chance(0.5)) {
    const a: Pole = rng.pick(['N', 'S'] as const);
    const b: Pole = rng.pick(['N', 'S'] as const);
    return { kind: 'poles', a, b, answer: a === b ? 'repel' : 'attract' };
  }
  const answer = rng.pick(MAGNETIC);
  const { options } = buildChoices(rng, answer, [...rng.sample(EASY_NOT, 2), rng.pick(TRICKY_NOT)], 4);
  return { kind: 'pickup', options, answer };
}
