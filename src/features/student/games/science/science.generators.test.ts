import { describe, expect, it } from 'vitest';
import { generateRounds } from '../engine/generate';
import type { GameLevel } from '@/types';
import { ANIMAL_EATERS, CHAINS_3, CHAINS_4, makeFoodRound, PLANT_EATERS, PLANTS, ROUNDS_PER_PLAY as FOOD_N } from './foodChainBuilder.generator';
import { EASY_NOT, MAGNETIC, makeMagnetRound, ROUNDS_PER_PLAY as MAGNET_N, TRICKY_NOT } from './magnetLab.generator';
import { LEVEL_SPEC as LIGHT_SPEC, makeLightRound, NOT_SOURCES, OPAQUE, ROUNDS_PER_PLAY as LIGHT_N, SOURCES, TRANSLUCENT, TRANSPARENT } from './lightShadows.generator';
import { HIGH, LOUD, LOW, makeSoundRound, ROUNDS_PER_PLAY as SOUND_N, SOFT, STATEMENTS } from './soundDetective.generator';
import { LEVEL_SPEC as WATER_SPEC, makeWaterRound, ROUNDS_PER_PLAY as WATER_N, THEMES } from './waterCycleOrder.generator';
import { CONDUCTORS, INSULATORS, makeCircuitRound, ROUNDS_PER_PLAY as CIRCUIT_N } from './circuitBuilder.generator';
import type { SequenceRound, SortRound } from './sortHelpers';
import { wrongItems } from './sortHelpers';

const LEVELS: GameLevel[] = [1, 2, 3];
const SEEDS = 120;

/** Runs `check` on many rounds of every level; also checks determinism and that another seed gives other rounds. */
function suite<R>(name: string, count: number, make: Parameters<typeof generateRounds<R>>[3], check: (r: R, level: GameLevel) => void) {
  describe(name, () => {
    it('is deterministic for a seed and fresh for another seed', () => {
      for (const l of LEVELS) {
        expect(generateRounds('x', l, count, make)).toEqual(generateRounds('x', l, count, make));
        expect(generateRounds('x', l, count, make)).not.toEqual(generateRounds('y', l, count, make));
      }
    });
    for (const level of LEVELS) {
      it(`level ${level}: every round is valid`, () => {
        for (let s = 0; s < SEEDS; s++) for (const r of generateRounds(`seed${s}`, level, count, make)) check(r, level);
      });
    }
  });
}

function checkSort<B extends string>(r: SortRound<B>, items: number, bins: number, pools: Record<string, readonly string[]>) {
  expect(r.items).toHaveLength(items);
  expect(new Set(r.items).size).toBe(items);
  expect(new Set(r.bins).size).toBe(bins);
  for (const id of r.items) expect(pools[r.truth[id]], `${id} in ${r.truth[id]}`).toContain(id);
  // every bin is used, and a perfect placement has no wrong items
  for (const b of r.bins) expect(r.items.some((id) => r.truth[id] === b)).toBe(true);
  expect(wrongItems(r, r.truth)).toEqual([]);
  expect(wrongItems(r, {})).toHaveLength(items);
}
function checkSeq(r: SequenceRound, n: number) {
  expect(r.order).toHaveLength(n);
  expect(new Set(r.order).size).toBe(n);
  expect([...r.shuffled].sort()).toEqual([...r.order].sort());
  expect(r.shuffled).not.toEqual(r.order);
}

suite('magnet lab', MAGNET_N, makeMagnetRound, (r, level) => {
  const pool = { sticks: MAGNETIC, notSticks: [...EASY_NOT, ...TRICKY_NOT] };
  if (level === 1) {
    expect(r.kind).toBe('sort');
    if (r.kind === 'sort') checkSort(r, 4, 2, pool);
  } else if (level === 2) {
    expect(r.kind).toBe('sort');
    if (r.kind === 'sort') {
      checkSort(r, 6, 2, pool);
      expect(r.items.filter((id) => (TRICKY_NOT as readonly string[]).includes(id))).toHaveLength(1);
    }
  } else if (r.kind === 'poles') {
    expect(r.answer).toBe(r.a === r.b ? 'repel' : 'attract');
  } else {
    expect(r.kind).toBe('pickup');
    if (r.kind === 'pickup') {
      expect(r.options).toHaveLength(4);
      expect(new Set(r.options).size).toBe(4);
      expect(r.options.filter((o) => (MAGNETIC as readonly string[]).includes(o))).toEqual([r.answer]);
    }
  }
});
describe('magnet lab level 3 mixes both kinds', () => {
  it('has poles and pickup rounds', () => {
    const kinds = new Set(generateRounds('k', 3, 60, makeMagnetRound).map((r) => r.kind));
    expect(kinds).toEqual(new Set(['poles', 'pickup']));
  });
});

suite('light and shadows', LIGHT_N, makeLightRound, (r, level) => {
  const pool = { source: SOURCES, notSource: NOT_SOURCES, opaque: OPAQUE, transparent: TRANSPARENT, translucent: TRANSLUCENT };
  checkSort(r, LIGHT_SPEC[level].items, LIGHT_SPEC[level].bins, pool);
});

suite('sound detective', SOUND_N, makeSoundRound, (r, level) => {
  if (level === 3) {
    expect(r.kind).toBe('statement');
    if (r.kind === 'statement') expect(STATEMENTS.find((s) => s.id === r.id)?.truth).toBe(r.truth);
  } else if (r.kind === 'either') {
    const first = level === 1 ? LOUD : HIGH;
    const second = level === 1 ? SOFT : LOW;
    expect(r.pair).toEqual(level === 1 ? ['loud', 'soft'] : ['high', 'low']);
    expect(r.answer).toBe((first as readonly string[]).includes(r.item) ? r.pair[0] : r.pair[1]);
    expect([...first, ...second]).toContain(r.item);
  } else if (r.kind === 'oneOf') {
    const kind = (id: string) => ((LOUD as readonly string[]).includes(id) ? 'loud' : (HIGH as readonly string[]).includes(id) ? 'high' : (LOW as readonly string[]).includes(id) ? 'low' : 'other');
    expect(r.options).toHaveLength(3);
    expect(new Set(r.options).size).toBe(3);
    expect(r.options.filter((o) => kind(o) === r.ask)).toEqual([r.answer]);
  } else throw new Error('unexpected kind');
});
describe('sound detective statements', () => {
  it('have unique ids and both true and false ones', () => {
    expect(new Set(STATEMENTS.map((s) => s.id)).size).toBe(STATEMENTS.length);
    expect(STATEMENTS.some((s) => s.truth)).toBe(true);
    expect(STATEMENTS.some((s) => !s.truth)).toBe(true);
  });
});

suite('water cycle order', WATER_N, makeWaterRound, (r, level) => {
  checkSeq(r, WATER_SPEC[level].steps);
  const full: readonly string[] = THEMES[r.theme];
  const at = full.indexOf(r.order[0]);
  expect(at).toBeGreaterThanOrEqual(0);
  expect(r.order).toEqual(full.slice(at, at + r.order.length));
});

suite('food chain builder', FOOD_N, makeFoodRound, (r, level) => {
  if (level === 3) {
    expect(r.kind).toBe('sort');
    if (r.kind === 'sort') checkSort(r, 6, 3, { plant: PLANTS, plantEater: PLANT_EATERS, animalEater: ANIMAL_EATERS });
  } else {
    expect(r.kind).toBe('chain');
    if (r.kind === 'chain') {
      checkSeq(r, level === 1 ? 3 : 4);
      const known = (level === 1 ? CHAINS_3 : CHAINS_4).map((c) => c.join());
      expect(known).toContain(r.order.join());
    }
  }
});

suite('electric circuit builder', CIRCUIT_N, makeCircuitRound, (r, level) => {
  if (level === 1) {
    expect(r.kind).toBe('missing');
    if (r.kind === 'missing') {
      expect([...r.options].sort()).toEqual(['battery', 'bulb', 'switch']);
      expect(r.options.filter((o) => o === r.missing)).toHaveLength(1);
    }
  } else if (level === 2) {
    expect(r.kind).toBe('willLight');
    if (r.kind === 'willLight') expect(r.lights).toBe(r.fault === 'none');
  } else {
    expect(r.kind).toBe('sort');
    if (r.kind === 'sort') checkSort(r, 6, 2, { conductor: CONDUCTORS, insulator: INSULATORS });
  }
});
describe('electric circuit builder level 2 mixes working and broken circuits', () => {
  it('has both', () => {
    const rounds = generateRounds('c', 2, 80, makeCircuitRound);
    expect(rounds.some((r) => r.kind === 'willLight' && r.lights)).toBe(true);
    expect(rounds.some((r) => r.kind === 'willLight' && !r.lights)).toBe(true);
  });
});
