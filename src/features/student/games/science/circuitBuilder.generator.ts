import type { RoundContext } from '../engine/generate';
import type { Rng } from '../engine/rng';
import { assembleSort, type SortRound } from './sortHelpers';

export type Part = 'battery' | 'bulb' | 'switch';
export type Fault = 'none' | 'switchOpen' | 'wireBroken' | 'noBattery' | 'noBulb';
export type CircuitBin = 'conductor' | 'insulator';

export const CONDUCTORS = ['copperWire', 'ironNail', 'aluminiumFoil', 'steelSpoon', 'pencilLead'] as const;
export const INSULATORS = ['plasticRuler', 'rubber', 'woodStick', 'glassCup', 'paper', 'cloth'] as const;
export const FAULTS: readonly Fault[] = ['none', 'switchOpen', 'wireBroken', 'noBattery', 'noBulb'];

export type CircuitRound =
  /** Level 1: one part is missing from the loop; tap the part that must go there. */
  | { kind: 'missing'; missing: Part; options: Part[] }
  /** Level 2: will the bulb light? `fault` says what is wrong (or none). Only a complete, closed loop lights. */
  | { kind: 'willLight'; fault: Fault; lights: boolean }
  /** Level 3: test materials, sort them into conductors and insulators. */
  | ({ kind: 'sort' } & SortRound<CircuitBin>);

export const ROUNDS_PER_PLAY = 8;
export const LEVEL_SPEC = { 1: 'missing part', 2: 'will it light', 3: 'conductors and insulators' } as const;

export function makeCircuitRound(rng: Rng, { level }: RoundContext): CircuitRound {
  if (level === 1) {
    const missing = rng.pick(['battery', 'bulb', 'switch'] as const);
    return { kind: 'missing', missing, options: rng.shuffle(['battery', 'bulb', 'switch'] as const) };
  }
  if (level === 2) {
    const fault: Fault = rng.chance(0.35) ? 'none' : rng.pick(FAULTS.filter((f) => f !== 'none'));
    return { kind: 'willLight', fault, lights: fault === 'none' };
  }
  return { kind: 'sort', ...assembleSort<CircuitBin>(rng, [['conductor', rng.sample(CONDUCTORS, 3)], ['insulator', rng.sample(INSULATORS, 3)]]) };
}
