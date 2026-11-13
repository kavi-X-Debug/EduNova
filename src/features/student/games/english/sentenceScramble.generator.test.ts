import { describe, expect, it } from 'vitest';
import { generateRounds } from '../engine/generate';
import { BANKS, makeScrambleRound, ROUNDS_PER_PLAY } from './sentenceScramble.generator';

describe('sentence scramble generator', () => {
  it('is deterministic for a seed and fresh for another', () => {
    expect(generateRounds('x', 2, ROUNDS_PER_PLAY, makeScrambleRound)).toEqual(generateRounds('x', 2, ROUNDS_PER_PLAY, makeScrambleRound));
    expect(generateRounds('x', 2, ROUNDS_PER_PLAY, makeScrambleRound)).not.toEqual(generateRounds('y', 2, ROUNDS_PER_PLAY, makeScrambleRound));
  });
  for (const level of [1, 2, 3] as const) {
    it(`level ${level}: tiles are the sentence's words, mixed up, sentences differ within a play`, () => {
      for (let s = 0; s < 80; s++) {
        const rounds = generateRounds(`seed${s}`, level, ROUNDS_PER_PLAY, makeScrambleRound);
        expect(new Set(rounds.map((r) => r.sentence)).size).toBe(rounds.length);
        for (const r of rounds) {
          expect(BANKS[level]).toContain(r.sentence);
          expect(r.words.join(' ')).toBe(r.sentence);
          expect([...r.tiles].sort()).toEqual([...r.words].sort());
          expect(r.tiles.join(' ')).not.toBe(r.sentence);
        }
      }
    });
  }
  it('sentences get longer with the level', () => {
    const avg = (l: 1 | 2 | 3) => BANKS[l].reduce((a, s) => a + s.split(' ').length, 0) / BANKS[l].length;
    expect(avg(1)).toBeLessThan(avg(2));
    expect(avg(2)).toBeLessThan(avg(3));
  });
});
