import { describe, expect, it } from 'vitest';
import en from '@/i18n/locales/en.json';
import si from '@/i18n/locales/si.json';
import ta from '@/i18n/locales/ta.json';
import { FACTS } from '../mixed/mixedChallenge.generator';
import { FINGERS, GROUPS as KEY_GROUPS, JOB_OF } from './keyboardExplorer.generator';
import { SHAPES } from './mouseMaze.generator';
import { SYMBOLS, SYMBOL_ITEMS, TASKS } from './flowchartBuilder.generator';
import { IDS } from './safeOrUnsafe.generator';
import { DEVICE_IDS, GROUPS as PART_GROUPS } from './partsOfComputer.generator';
import { SUBS, TYPES } from './folderSorter.generator';

const locales: Record<string, Record<string, string>> = { en, si, ta };
const enMap: Record<string, string> = en;

// Components build keys from generator ids (t(`${P}.job.${id}`)), which the usage script cannot see: check them all here.
const P = 'games.ict';
const keys: string[] = [
  ...KEY_GROUPS.map((g) => `${P}.keyboardExplorer.group.${g}`),
  ...Object.values(JOB_OF).map((j) => `${P}.keyboardExplorer.job.${j}`),
  ...FINGERS.map((f) => `${P}.keyboardExplorer.finger.${f}`),
  ...['group', 'job', 'finger'].flatMap((q) => [`${P}.keyboardExplorer.q.${q}`, `${P}.keyboardExplorer.explain.${q}`]),
  ...['click', 'double', 'drag'].map((a) => `${P}.mouseMaze.act.${a}`),
  ...SHAPES.map((s) => `${P}.mouseMaze.shape.${s}`),
  ...TASKS.flatMap((t) => ['title', 's1', 's2', 's3', 's4', 's5'].map((k) => `${P}.flowchartBuilder.task.${t}.${k}`)),
  ...Object.keys(SYMBOL_ITEMS).map((i) => `${P}.flowchartBuilder.item.${i}`),
  ...SYMBOLS.map((s) => `${P}.flowchartBuilder.sym.${s}`),
  ...IDS.flatMap((i) => [`${P}.safeOrUnsafe.item.${i}`, `${P}.safeOrUnsafe.why.${i}`]),
  ...DEVICE_IDS.flatMap((d) => [`${P}.partsOfComputer.dev.${d}`, `${P}.partsOfComputer.job.${d}`]),
  ...PART_GROUPS.map((g) => `${P}.partsOfComputer.group.${g}`),
  ...TYPES.map((t) => `${P}.folderSorter.folder.${t}`),
  ...Object.values(SUBS).flat().map((s) => `${P}.folderSorter.sub.${s}`),
  ...FACTS.flatMap((f) => [`games.mixed.mixedChallenge.fact.${f.id}`, `games.mixed.mixedChallenge.why.${f.id}`]),
];

describe('ICT and mixed game strings', () => {
  it('every generated id has text in en, si and ta', () => {
    for (const l of Object.keys(locales)) for (const k of keys) expect(locales[l][k], `${l} ${k}`).toBeTruthy();
  });
  it('si and ta keep the same {{placeholders}} as en', () => {
    const ph = (s: string) => (s.match(/\{\{\w+\}\}/g) ?? []).sort().join();
    for (const k of Object.keys(en).filter((x) => x.startsWith('games.ict.') || x.startsWith('games.mixed.'))) {
      expect(ph(locales.si[k]), `si ${k}`).toBe(ph(enMap[k]));
      expect(ph(locales.ta[k]), `ta ${k}`).toBe(ph(enMap[k]));
    }
  });
});
