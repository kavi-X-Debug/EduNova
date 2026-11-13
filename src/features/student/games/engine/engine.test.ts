import { describe, expect, it } from 'vitest';
import { applyKey } from './applyKey';
import { buildChoices, generateRounds, numericDistractors } from './generate';
import { createRng } from './rng';
import { computeStars } from './scoring';

describe('seeded rng', () => {
  it('gives the same numbers for the same seed', () => {
    const a = createRng('seed-1');
    const b = createRng('seed-1');
    expect(Array.from({ length: 10 }, () => a.next())).toEqual(Array.from({ length: 10 }, () => b.next()));
  });
  it('differs for different seeds', () => {
    expect(createRng('a').next()).not.toBe(createRng('b').next());
  });
  it('int stays inside the inclusive range and hits both ends', () => {
    const r = createRng('range');
    const seen = new Set<number>();
    for (let i = 0; i < 500; i++) {
      const v = r.int(3, 6);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(6);
      seen.add(v);
    }
    expect([...seen].sort()).toEqual([3, 4, 5, 6]);
  });
  it('shuffle keeps all items and does not change the input; sample has no repeats', () => {
    const r = createRng('shuffle');
    const input = [1, 2, 3, 4, 5, 6];
    const out = r.shuffle(input);
    expect(input).toEqual([1, 2, 3, 4, 5, 6]);
    expect([...out].sort()).toEqual(input);
    const s = r.sample(input, 4);
    expect(new Set(s).size).toBe(4);
  });
});

describe('generate helpers', () => {
  it('generateRounds is deterministic and each round is independent of the others', () => {
    const make = (rng: ReturnType<typeof createRng>) => rng.int(0, 1000);
    const a = generateRounds('s', 1, 5, make);
    expect(generateRounds('s', 1, 5, make)).toEqual(a);
    expect(generateRounds('s', 1, 3, make)).toEqual(a.slice(0, 3));
  });
  it('buildChoices always has exactly one right option and no duplicates', () => {
    for (let i = 0; i < 100; i++) {
      const r = createRng(`c${i}`);
      const { options, correctIndex } = buildChoices(r, 7, [7, 6, 6, 8, 9, 5], 4);
      expect(options).toHaveLength(4);
      expect(options[correctIndex]).toBe(7);
      expect(options.filter((o) => o === 7)).toHaveLength(1);
      expect(new Set(options).size).toBe(options.length);
    }
  });
  it('numericDistractors respects the range and never equals the answer', () => {
    const d = numericDistractors(createRng('n'), 1, 5, { spread: 3, min: 0, max: 10 });
    expect(d.every((v) => v >= 0 && v <= 10 && v !== 1)).toBe(true);
  });
});

describe('stars (scoring)', () => {
  it('is always 1 to 3 and never 0', () => {
    expect(computeStars(0, 8)).toBe(1);
    expect(computeStars(0, 0)).toBe(1);
  });
  it('uses the 60% and 85% thresholds', () => {
    expect(computeStars(4, 8)).toBe(1);
    expect(computeStars(5, 8)).toBe(2); // 62.5%
    expect(computeStars(6, 8)).toBe(2);
    expect(computeStars(7, 8)).toBe(3); // 87.5%
    expect(computeStars(8, 8)).toBe(3);
  });
  it('never goes down when more answers are right', () => {
    let prev = 0;
    for (let c = 0; c <= 10; c++) {
      const s = computeStars(c, 10);
      expect(s).toBeGreaterThanOrEqual(prev);
      prev = s;
    }
  });
});

describe('number pad keys', () => {
  it('types digits, minus first, one point, and deletes', () => {
    const o = { allowNegative: true, allowDecimal: true, maxLength: 4 };
    expect(applyKey('', '-', o)).toBe('-');
    expect(applyKey('5', '-', o)).toBe('5');
    expect(applyKey('-', '7', o)).toBe('-7');
    expect(applyKey('0', '5', o)).toBe('5');
    expect(applyKey('1.2', '.', o)).toBe('1.2');
    expect(applyKey('12', 'Backspace', o)).toBe('1');
    expect(applyKey('1234', '5', o)).toBe('1234');
    expect(applyKey('', '-', {})).toBe('');
  });
});
