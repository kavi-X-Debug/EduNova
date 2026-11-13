import type { RoundContext } from '../engine/generate';
import type { Rng } from '../engine/rng';
import { STORIES_1, STORIES_2, STORIES_3, type Story } from './data/stories';
import { pickForRound, shuffleDifferent } from './pick';

export interface StoryRound {
  id: string;
  /** The steps in the right order. */
  steps: string[];
  /** The order the cards start in: indexes into `steps`, never the right order. */
  order: number[];
}

export const BANKS: Record<1 | 2 | 3, Story[]> = { 1: STORIES_1, 2: STORIES_2, 3: STORIES_3 };

/** PURE: the same rng always gives the same round. */
export function makeStoryRound(rng: Rng, ctx: RoundContext): StoryRound {
  const story = pickForRound(rng, ctx, BANKS[ctx.level]);
  return { id: story.id, steps: story.steps, order: shuffleDifferent(rng, story.steps.map((_, i) => i)) };
}

export const ROUNDS_PER_PLAY = 4;
