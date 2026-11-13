import type { RoundContext } from '../engine/generate';
import type { Rng } from '../engine/rng';
import { assembleSort, type SortRound } from './sortHelpers';

export type LightBin = 'source' | 'notSource' | 'opaque' | 'transparent' | 'translucent';

export const SOURCES = ['sun', 'torch', 'candle', 'lamp', 'firefly', 'star'] as const;
export const NOT_SOURCES = ['moon', 'mirror', 'book', 'stone', 'tree', 'chair'] as const;
export const OPAQUE = ['woodBoard', 'brickWall', 'metalTray', 'cardboard', 'schoolBag', 'umbrella'] as const;
export const TRANSPARENT = ['clearGlass', 'clearWater', 'plasticWrap', 'spectacleLens', 'air', 'windowPane'] as const;
export const TRANSLUCENT = ['tracingPaper', 'frostedGlass', 'waxPaper', 'thinCloth', 'bathroomGlass', 'lampshade'] as const;

export type LightRound = SortRound<LightBin>;
export const ROUNDS_PER_PLAY = 8;
/** Level 1: light sources (2 bins, 4 items); level 2: 3 kinds of material (4 items); level 3: 3 kinds (6 items). */
export const LEVEL_SPEC = { 1: { bins: 2, items: 4 }, 2: { bins: 3, items: 4 }, 3: { bins: 3, items: 6 } } as const;

export function makeLightRound(rng: Rng, { level }: RoundContext): LightRound {
  if (level === 1) return assembleSort<LightBin>(rng, [['source', rng.sample(SOURCES, 2)], ['notSource', rng.sample(NOT_SOURCES, 2)]]);
  const counts = level === 2 ? rng.shuffle([2, 1, 1]) : [2, 2, 2];
  return assembleSort<LightBin>(rng, [
    ['opaque', rng.sample(OPAQUE, counts[0])],
    ['transparent', rng.sample(TRANSPARENT, counts[1])],
    ['translucent', rng.sample(TRANSLUCENT, counts[2])],
  ]);
}
