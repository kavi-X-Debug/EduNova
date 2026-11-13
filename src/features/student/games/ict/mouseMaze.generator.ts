// PURE generator: see docs/GAMES-AUTHORING.md.
import type { RoundContext } from '../engine/generate';
import type { Rng } from '../engine/rng';

export type Shape = 'star' | 'circle' | 'square' | 'triangle' | 'heart' | 'moon';
export type MouseAction = 'click' | 'double' | 'drag';
export const SHAPES: Shape[] = ['star', 'circle', 'square', 'triangle', 'heart', 'moon'];

export interface MouseRound {
  action: MouseAction;
  target: Shape;
  /** The four shapes on the board (the target is always one of them, no repeats). */
  shapes: Shape[];
}

export const LEVEL_ACTIONS: Record<1 | 2 | 3, MouseAction[]> = {
  1: ['click'],
  2: ['click', 'double'],
  3: ['click', 'double', 'drag'],
};

export function makeMouseRound(rng: Rng, { level, index }: RoundContext): MouseRound {
  const actions = LEVEL_ACTIONS[level];
  // walk through the actions first so every level practises each of its moves, then vary at random
  const action = index < actions.length * 2 ? actions[index % actions.length] : rng.pick(actions);
  const shapes = rng.sample(SHAPES, 4);
  return { action, target: rng.pick(shapes), shapes };
}

export const ROUNDS_PER_PLAY = 8;
