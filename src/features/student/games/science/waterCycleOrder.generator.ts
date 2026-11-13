import type { RoundContext } from '../engine/generate';
import type { Rng } from '../engine/rng';
import { assembleSequence, type SequenceRound } from './sortHelpers';

/** Three little stories about water, each with 6 steps in the right order. A round shows a window of 4, 5 or 6 steps. */
export const THEMES = {
  sea: ['seaWarm', 'vapourRise', 'cloudForm', 'rainFalls', 'riverFlows', 'backToSea'],
  puddle: ['puddleFill', 'sunShines', 'puddleWarm', 'turnsVapour', 'vapourUp', 'puddleGone'],
  hill: ['cloudsGather', 'hillRain', 'streamForms', 'streamRiver', 'riverLake', 'lakeWarm'],
} as const;
export type ThemeId = keyof typeof THEMES;

export interface WaterRound extends SequenceRound {
  theme: ThemeId;
}
export const ROUNDS_PER_PLAY = 6;
export const LEVEL_SPEC = { 1: { steps: 4 }, 2: { steps: 5 }, 3: { steps: 6 } } as const;

export function makeWaterRound(rng: Rng, { level }: RoundContext): WaterRound {
  const theme = rng.pick(Object.keys(THEMES) as ThemeId[]);
  const full = THEMES[theme];
  const n = LEVEL_SPEC[level].steps;
  const start = rng.int(0, full.length - n);
  return { theme, ...assembleSequence(rng, full.slice(start, start + n)) };
}
