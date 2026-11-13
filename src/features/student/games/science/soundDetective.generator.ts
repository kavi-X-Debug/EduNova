import { buildChoices, type RoundContext } from '../engine/generate';
import type { Rng } from '../engine/rng';

export const LOUD = ['drum', 'thunder', 'busHorn', 'siren', 'aeroplane', 'trainHorn', 'waterfall', 'loudSpeaker'] as const;
export const SOFT = ['whisper', 'clockTick', 'leafRustle', 'mouse', 'catPurr', 'pageTurn', 'breeze', 'dripTap'] as const;
export const HIGH = ['birdChirp', 'whistle', 'mosquito', 'smallBell', 'flute', 'kettle', 'violin'] as const;
export const LOW = ['lionRoar', 'elephantCall', 'bullfrog', 'tractor', 'tuba', 'cowMoo', 'foghorn'] as const;
/** Level 3: statements about sound, each true or false. */
export const STATEMENTS: ReadonlyArray<{ id: string; truth: boolean }> = [
  { id: 'vibrate', truth: true },
  { id: 'water', truth: true },
  { id: 'wood', truth: true },
  { id: 'air', truth: true },
  { id: 'space', truth: false },
  { id: 'ears', truth: true },
  { id: 'eyes', truth: false },
  { id: 'stillDrum', truth: false },
  { id: 'harder', truth: true },
  { id: 'shortString', truth: true },
  { id: 'thunderNatural', truth: true },
  { id: 'birdArtificial', truth: false },
  { id: 'hornArtificial', truth: true },
  { id: 'musicNoise', truth: false },
];

type Trait = 'loud' | 'soft' | 'high' | 'low';
export type SoundRound =
  /** One sound, two answers: loud or soft (level 1), high or low (level 2). */
  | { kind: 'either'; item: string; pair: [Trait, Trait]; answer: Trait }
  /** Pick the one sound with the asked trait out of three. */
  | { kind: 'oneOf'; ask: 'loud' | 'high' | 'low'; options: string[]; answer: string }
  | { kind: 'statement'; id: string; truth: boolean };

export const ROUNDS_PER_PLAY = 8;
export const LEVEL_SPEC = { 1: 'loud or soft', 2: 'high or low', 3: 'true or false' } as const;

export function makeSoundRound(rng: Rng, { level }: RoundContext): SoundRound {
  if (level === 3) {
    const s = rng.pick(STATEMENTS);
    return { kind: 'statement', id: s.id, truth: s.truth };
  }
  const first = level === 1 ? LOUD : HIGH;
  const second = level === 1 ? SOFT : LOW;
  const pair: [Trait, Trait] = level === 1 ? ['loud', 'soft'] : ['high', 'low'];
  if (rng.chance(0.5)) {
    const answer = rng.pick(pair);
    return { kind: 'either', item: rng.pick(answer === pair[0] ? first : second), pair, answer };
  }
  // 'oneOf': the loud one (one loud, two soft), or the high / low one (one of its kind, two of the other)
  const ask = level === 1 ? 'loud' : rng.pick(['high', 'low'] as const);
  const rightPool = ask === 'low' ? second : first;
  const otherPool = ask === 'low' ? first : second;
  const answer = rng.pick(rightPool);
  const { options } = buildChoices(rng, answer, rng.sample(otherPool, 2), 3);
  return { kind: 'oneOf', ask, options, answer };
}
