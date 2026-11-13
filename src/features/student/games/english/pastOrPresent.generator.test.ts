import { describe, expect, it } from 'vitest';
import { generateRounds } from '../engine/generate';
import { BANKS, ITEM_COUNT, makeTenseRound, ROUNDS_PER_PLAY } from './pastOrPresent.generator';

describe('past or present generator', () => {
  it('is deterministic for a seed and fresh for another', () => {
    expect(generateRounds('x', 2, ROUNDS_PER_PLAY, makeTenseRound)).toEqual(generateRounds('x', 2, ROUNDS_PER_PLAY, makeTenseRound));
    expect(generateRounds('x', 2, ROUNDS_PER_PLAY, makeTenseRound)).not.toEqual(generateRounds('y', 2, ROUNDS_PER_PLAY, makeTenseRound));
  });
  for (const level of [1, 2, 3] as const) {
    it(`level ${level}: right count, both tenses, no repeated sentence, the cue is in the sentence`, () => {
      for (let s = 0; s < 80; s++) {
        for (const r of generateRounds(`seed${s}`, level, ROUNDS_PER_PLAY, makeTenseRound)) {
          expect(r.items).toHaveLength(ITEM_COUNT[level]);
          expect(new Set(r.items.map((i) => i.text)).size).toBe(r.items.length);
          expect(r.items.filter((i) => i.tense === 'past').length).toBeGreaterThanOrEqual(2);
          expect(r.items.filter((i) => i.tense === 'present').length).toBeGreaterThanOrEqual(2);
          for (const i of r.items) expect(i.text.toLowerCase()).toContain(i.cue.toLowerCase());
        }
      }
    });
  }
  it('banks have a cue for every sentence', () => {
    for (const l of [1, 2, 3] as const) for (const i of BANKS[l]) expect(i.cue.length).toBeGreaterThan(0);
  });
});
