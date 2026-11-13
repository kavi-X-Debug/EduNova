import { describe, expect, it } from 'vitest';
import en from '@/i18n/locales/en.json';
import si from '@/i18n/locales/si.json';
import ta from '@/i18n/locales/ta.json';
import { CONCEPTS } from '@/mocks/concepts';
import { GAMES } from './registry';

const locales: Record<string, Record<string, string>> = { en, si, ta };
const conceptById = new Map(CONCEPTS.map((c) => [c.id, c]));

// Integrity checks every subject agent gets for free: they fail when a game is registered wrongly.
describe('game registry', () => {
  it('has unique kebab-case ids', () => {
    const ids = GAMES.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });
  for (const g of GAMES) {
    describe(g.id, () => {
      it('uses real Grade 6 concept ids that belong to its subject', () => {
        expect(g.grade).toBe(6);
        expect(g.conceptIds.length).toBeGreaterThan(0);
        for (const c of g.conceptIds) {
          expect(conceptById.has(c), `unknown concept ${c}`).toBe(true);
          if (g.subject !== 'mixed') expect(conceptById.get(c)?.subject).toBe(g.subject);
        }
      });
      it('offers all 3 levels and a loader', () => {
        expect(g.levels).toEqual([1, 2, 3]);
        expect(typeof g.load).toBe('function');
        expect(g.estimatedMinutes).toBeGreaterThan(0);
      });
      it('has title and how-to text in en, si and ta (under games.<subject>.)', () => {
        for (const key of [g.titleKey, g.howToKey]) {
          expect(key.startsWith(`games.${g.subject}.`)).toBe(true);
          for (const l of Object.keys(locales)) expect(locales[l][key], `${l} ${key}`).toBeTruthy();
        }
      });
      it('points at its scene picture in public/games (the file exists)', async () => {
        const fs = await import('node:fs');
        const path = await import('node:path');
        expect(g.thumbnail.image).toBe(`/games/${g.id}.webp`);
        expect(fs.existsSync(path.resolve(process.cwd(), 'public', 'games', `${g.id}.webp`))).toBe(true);
      });
    });
  }
});
