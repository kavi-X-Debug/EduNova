import { buildChoices, type RoundContext } from '../engine/generate';
import type { Rng } from '../engine/rng';
import { SCENE_AFTER, SCENES_1, SCENES_2, TIME_ITEMS, TIME_PREPOSITIONS, type SceneId, type TimeItem } from './data/prepositions';
import { playOrder } from './pick';

/** The blank in "The ball is ___ the box." */
export interface PrepositionRound {
  /** 'scene' = look at the picture; 'time' = on / in / at with days and times (level 3). */
  mode: 'scene' | 'time';
  scene?: SceneId;
  /** Words before and after the blank. */
  before: string;
  after: string;
  answer: string;
  options: string[];
  /** Time rounds: which rule explains it ('on' | 'at' | 'in') and the deciding word. */
  rule?: 'on' | 'at' | 'in';
  example?: string;
}

type Entry = { mode: 'scene'; scene: SceneId } | { mode: 'time'; item: TimeItem };

/** Pictures that could honestly be described with either word: never offered together. */
const CONFLICTS: Partial<Record<SceneId, SceneId[]>> = {
  near: ['in front of', 'behind', 'between'],
  'in front of': ['near', 'behind'],
  behind: ['near', 'in front of'],
};

function sceneRound(rng: Rng, scene: SceneId, optionCount: number): PrepositionRound {
  const pool = SCENES_2.filter((s) => s !== scene && !CONFLICTS[scene]?.includes(s));
  const options = buildChoices(rng, scene as string, pool, optionCount).options;
  return { mode: 'scene', scene, before: 'The ball is', after: SCENE_AFTER[scene], answer: scene, options };
}

/** PURE: the same rng always gives the same round. */
export function makePrepositionRound(rng: Rng, ctx: RoundContext): PrepositionRound {
  const { level, index } = ctx;
  if (level === 1) {
    // each of in / on / under comes round in turn
    const scene = playOrder(ctx, SCENES_1, rng)[index % SCENES_1.length];
    return sceneRound(rng, scene, 3);
  }
  const bank: Entry[] =
    level === 2
      ? SCENES_2.map((scene) => ({ mode: 'scene', scene }))
      : [...SCENES_2.map((scene): Entry => ({ mode: 'scene', scene })), ...TIME_ITEMS.map((item): Entry => ({ mode: 'time', item }))];
  const entry = playOrder(ctx, bank, rng)[index % bank.length];
  if (entry.mode === 'scene') return sceneRound(rng, entry.scene, 4);
  const { item } = entry;
  return { mode: 'time', before: item.before, after: item.after, answer: item.answer, options: rng.shuffle(TIME_PREPOSITIONS), rule: item.answer, example: item.example };
}

export const ROUNDS_PER_PLAY = 7;
