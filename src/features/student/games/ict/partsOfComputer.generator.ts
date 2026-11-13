// PURE generator: see docs/GAMES-AUTHORING.md.
import type { RoundContext } from '../engine/generate';
import type { Rng } from '../engine/rng';

export type Group = 'input' | 'output' | 'inside';
/** Device id -> its group. The job text of a device uses the same id (games.ict.partsOfComputer.job.<id>). */
export const DEVICES: Record<string, Group> = {
  keyboard: 'input', mouse: 'input', microphone: 'input',
  monitor: 'output', printer: 'output', speaker: 'output',
  cpu: 'inside', disk: 'inside',
};
export const DEVICE_IDS = Object.keys(DEVICES);
export const GROUPS: Group[] = ['input', 'output', 'inside'];

export type PartsRound =
  | { mode: 'match'; devices: string[]; /** job ids in their shown order (a job id is its device id) */ jobs: string[] }
  | { mode: 'sort'; devices: string[] };

export const MATCH_PAIRS: Record<1 | 2, number> = { 1: 3, 2: 4 };

export function makePartsRound(rng: Rng, { level }: RoundContext): PartsRound {
  if (level === 3) {
    // some of each group, so no bin stays empty
    const pick = (g: Group) => rng.sample(DEVICE_IDS.filter((d) => DEVICES[d] === g), 2);
    return { mode: 'sort', devices: rng.shuffle([...pick('input'), ...pick('output'), ...pick('inside')]) };
  }
  const devices = rng.sample(DEVICE_IDS, MATCH_PAIRS[level]);
  let jobs = rng.shuffle(devices);
  for (let i = 0; i < 20 && jobs.every((j, k) => j === devices[k]); i++) jobs = rng.shuffle(devices);
  return { mode: 'match', devices, jobs };
}

export const ROUNDS_PER_PLAY = 6;
