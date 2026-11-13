import type { RoundContext } from '../engine/generate';
import type { Rng } from '../engine/rng';
import { assembleSequence, assembleSort, type SequenceRound, type SortRound } from './sortHelpers';

/** Food chains: the plant first, then whoever eats it, then whoever eats that. */
export const CHAINS_3: ReadonlyArray<readonly string[]> = [
  ['grass', 'deer', 'leopard'],
  ['paddy', 'grasshopper', 'frog'],
  ['waterWeed', 'smallFish', 'heron'],
  ['leaf', 'caterpillar', 'myna'],
];
export const CHAINS_4: ReadonlyArray<readonly string[]> = [
  ['paddy', 'grasshopper', 'frog', 'snake'],
  ['leaf', 'caterpillar', 'myna', 'hawk'],
  ['waterWeed', 'snail', 'fish', 'heron'],
  ['grass', 'grasshopper', 'myna', 'hawk'],
];
export type FoodBin = 'plant' | 'plantEater' | 'animalEater';
export const PLANTS = ['grass', 'paddy', 'waterWeed', 'mangoTree', 'coconutPalm'] as const;
export const PLANT_EATERS = ['deer', 'grasshopper', 'caterpillar', 'snail', 'elephant', 'cow'] as const;
export const ANIMAL_EATERS = ['leopard', 'frog', 'snake', 'eagle', 'hawk', 'heron'] as const;

export type FoodRound = ({ kind: 'chain' } & SequenceRound) | ({ kind: 'sort' } & SortRound<FoodBin>);
export const ROUNDS_PER_PLAY = 6;
/** Level 1: chain of 3; level 2: chain of 4; level 3: sort 6 living things by what they eat. */
export const LEVEL_SPEC = { 1: { chain: 3 }, 2: { chain: 4 }, 3: { chain: 0 } } as const;

export function makeFoodRound(rng: Rng, { level }: RoundContext): FoodRound {
  if (level === 3) {
    return {
      kind: 'sort',
      ...assembleSort<FoodBin>(rng, [['plant', rng.sample(PLANTS, 2)], ['plantEater', rng.sample(PLANT_EATERS, 2)], ['animalEater', rng.sample(ANIMAL_EATERS, 2)]]),
    };
  }
  return { kind: 'chain', ...assembleSequence(rng, [...rng.pick(level === 1 ? CHAINS_3 : CHAINS_4)]) };
}
