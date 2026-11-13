import { describe, expect, it } from 'vitest';
import { makeMastery } from '@/lib/mastery';
import { NUDGE_CEIL, NUDGE_FLOOR, nudgeFor, recordGame } from './games';

const input = { stars: 3 as const, correct: 8, total: 8, durationSec: 60, conceptIds: ['m6-number-line'], subject: 'maths' as const, level: 1 as const };

describe('game mastery nudge', () => {
  it('is small and bounded per play', () => {
    expect(nudgeFor(8, 8)).toBeCloseTo(0.04);
    expect(nudgeFor(0, 8)).toBeCloseTo(-0.02);
    expect(nudgeFor(0, 0)).toBeGreaterThanOrEqual(-0.02);
  });
  it('never moves a concept beyond the cumulative cap, and never creates mastery', () => {
    const user = 'u-cap';
    const mastery = [makeMastery('m6-number-line', 0.3, 'now')];
    for (let i = 0; i < 30; i++) recordGame(user, 'g', input, mastery);
    expect(mastery[0].level).toBeLessThanOrEqual(0.3 + NUDGE_CEIL + 1e-9);
    const down = [makeMastery('m6-number-line', 0.5, 'now')];
    for (let i = 0; i < 30; i++) recordGame('u-down', 'g', { ...input, correct: 0 }, down);
    expect(down[0].level).toBeGreaterThanOrEqual(0.5 - NUDGE_FLOOR - 1e-9);
    const none: ReturnType<typeof makeMastery>[] = [];
    recordGame('u-none', 'g', input, none);
    expect(none).toEqual([]);
  });
  it('counts plays and keeps the best stars', () => {
    const m = [makeMastery('m6-number-line', 0.3, 'now')];
    recordGame('u-stats', 'g2', { ...input, stars: 3 }, m);
    const s = recordGame('u-stats', 'g2', { ...input, stars: 1, correct: 2 }, m);
    expect(s.plays).toBe(2);
    expect(s.bestStars).toBe(3);
    expect(s.lastStars).toBe(1);
  });
});
