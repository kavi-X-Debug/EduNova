import { describe, expect, it } from 'vitest';
import { generateRounds } from '../engine/generate';
import { FACTS, makeMixedRound, ROUNDS_PER_PLAY } from './mixedChallenge.generator';

describe('mixed challenge generator', () => {
  it('is deterministic and fresh per seed', () => {
    expect(generateRounds('x', 2, ROUNDS_PER_PLAY, makeMixedRound)).toEqual(generateRounds('x', 2, ROUNDS_PER_PLAY, makeMixedRound));
    expect(generateRounds('x', 2, ROUNDS_PER_PLAY, makeMixedRound)).not.toEqual(generateRounds('y', 2, ROUNDS_PER_PLAY, makeMixedRound));
  });
  for (const level of [1, 2, 3] as const) {
    it(`level ${level}: rotates maths, science and ICT; maths is right and unique; facts exist; no repeated fact`, () => {
      for (let s = 0; s < 200; s++) {
        const rounds = generateRounds(`m${s}`, level, ROUNDS_PER_PLAY, makeMixedRound);
        expect(rounds.map((r) => r.subject)).toEqual(['maths', 'science', 'ict', 'maths', 'science', 'ict']);
        const facts = rounds.flatMap((r) => (r.subject === 'maths' ? [] : [r.fact]));
        expect(new Set(facts).size).toBe(facts.length);
        for (const r of rounds) {
          if (r.subject === 'maths') {
            expect(r.options.filter((o) => o === r.answer)).toHaveLength(1);
            expect(new Set(r.options).size).toBe(r.options.length);
            expect(r.options.length).toBeGreaterThanOrEqual(3);
            expect(r.options.every((o) => o >= 0)).toBe(true);
            expect(r.working.endsWith(`= ${r.answer}`)).toBe(true);
            // evaluate the sum to be sure the answer is right
            expect(Function(`return ${r.sum.replace('×', '*')}`)()).toBe(r.answer);
          } else {
            const f = FACTS.find((x) => x.id === r.fact)!;
            expect(f.subject).toBe(r.subject);
            expect(f.level).toBeLessThanOrEqual(level);
            expect(f.isTrue).toBe(r.isTrue);
          }
        }
      }
    });
  }
  it('has both true and false facts in each subject', () => {
    for (const s of ['science', 'ict']) {
      expect(FACTS.some((f) => f.subject === s && f.isTrue)).toBe(true);
      expect(FACTS.some((f) => f.subject === s && !f.isTrue)).toBe(true);
    }
  });
});
