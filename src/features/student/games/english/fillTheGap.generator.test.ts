import { describe, expect, it } from 'vitest';
import { generateRounds } from '../engine/generate';
import { A_AN_ADJECTIVES, A_AN_NOUNS } from './data/gaps';
import { makeGapRound, ROUNDS_PER_PLAY, sentenceOf } from './fillTheGap.generator';

describe('fill the gap generator', () => {
  it('is deterministic for a seed and fresh for another', () => {
    expect(generateRounds('x', 3, ROUNDS_PER_PLAY, makeGapRound)).toEqual(generateRounds('x', 3, ROUNDS_PER_PLAY, makeGapRound));
    expect(generateRounds('x', 3, ROUNDS_PER_PLAY, makeGapRound)).not.toEqual(generateRounds('y', 3, ROUNDS_PER_PLAY, makeGapRound));
  });
  for (const level of [1, 2, 3] as const) {
    it(`level ${level}: one right option, no duplicates, a rule for every round`, () => {
      for (let s = 0; s < 200; s++) {
        for (const r of generateRounds(`seed${s}`, level, ROUNDS_PER_PLAY, makeGapRound)) {
          expect(r.options.filter((o) => o === r.answer)).toHaveLength(1);
          expect(new Set(r.options).size).toBe(r.options.length);
          expect(r.options.length).toBeGreaterThanOrEqual(2);
          expect(r.rule).toBeTruthy();
          expect(r.vars.word).toBeTruthy();
          expect(r.vars.subject).toBeTruthy();
          expect(sentenceOf(r)).toMatch(/[.?]$/);
        }
      }
    });
  }
  it('level 1 follows am / is / are', () => {
    for (let s = 0; s < 100; s++) {
      for (const r of generateRounds(`b${s}`, 1, 8, makeGapRound)) {
        expect(['am', 'is', 'are']).toContain(r.answer.toLowerCase());
        expect(r.rule).toBe('be');
        if (r.before === 'I') expect(r.answer).toBe('am');
        if (r.before === '') expect(r.answer[0]).toBe(r.answer[0].toUpperCase());
      }
    }
  });
  it('a / an follows the sound of the next word', () => {
    const vowelWords = new Set([...A_AN_NOUNS, ...A_AN_ADJECTIVES].filter((w) => w.art === 'an').map((w) => w.w));
    for (let s = 0; s < 300; s++) {
      for (const level of [2, 3] as const) {
        for (const r of generateRounds(`a${s}`, level, 8, makeGapRound)) {
          if (r.rule !== 'a' && r.rule !== 'an') continue;
          expect(r.answer).toBe(vowelWords.has(r.vars.subject) ? 'an' : 'a');
          expect(/^[aeiou]/.test(r.vars.subject)).toBe(r.answer === 'an');
        }
      }
    }
  });
  it('this / that / these / those match the cue and the number', () => {
    let seen = 0;
    for (let s = 0; s < 300; s++) {
      for (const r of generateRounds(`d${s}`, 2, 8, makeGapRound)) {
        if (!['this', 'that', 'these', 'those'].includes(r.rule)) continue;
        seen++;
        const near = r.after.includes(' here ');
        const many = r.after.includes(' are ');
        expect(r.answer.toLowerCase()).toBe(near ? (many ? 'these' : 'this') : many ? 'those' : 'that');
      }
    }
    expect(seen).toBeGreaterThan(50);
  });
  it('level 3: -s verbs go with he / she / it type subjects and was / were agree', () => {
    for (let s = 0; s < 300; s++) {
      for (const r of generateRounds(`p${s}`, 3, 8, makeGapRound)) {
        if (r.rule === 's') expect(['He', 'She', 'My mother', 'The dog', 'Kamal', 'Our teacher']).toContain(r.vars.subject);
        if (r.rule === 'base') expect(['I', 'You', 'We', 'They', 'The children', 'My friends']).toContain(r.vars.subject);
        if (r.rule === 'was') expect(['I', 'He', 'She', 'The cat', 'My uncle']).toContain(r.vars.subject);
        if (r.rule === 'were') expect(['You', 'We', 'They', 'The boys', 'My cousins']).toContain(r.vars.subject);
      }
    }
  });
});
