import { describe, expect, it } from 'vitest';
import { generateRounds } from '../engine/generate';
import { ARROW_KEYS, DIGITS, FINGER_OF, groupOf, HELPER_KEYS, JOB_OF, LETTERS, makeKeyRound, ROUNDS_PER_PLAY as KE_ROUNDS } from './keyboardExplorer.generator';
import { LEVEL_ACTIONS, makeMouseRound, ROUNDS_PER_PLAY as MM_ROUNDS } from './mouseMaze.generator';
import { makeFlowRound, ORDER_LENGTH, ROUNDS_PER_PLAY as FB_ROUNDS, SYMBOL_ITEMS, TASKS } from './flowchartBuilder.generator';
import { BEHAVIOURS, isStrongPassword, makeSafeRound, ROUNDS_PER_PLAY as SU_ROUNDS, SORT_SIZE } from './safeOrUnsafe.generator';
import { DEVICES, makePartsRound, MATCH_PAIRS, ROUNDS_PER_PLAY as PC_ROUNDS } from './partsOfComputer.generator';
import { FILES, makeFolderRound, ROUNDS_PER_PLAY as FS_ROUNDS, samePath, SORT_SPEC, SUBS, typeOfFile } from './folderSorter.generator';

const levels = [1, 2, 3] as const;
const unique = <T,>(a: T[]) => new Set(a).size === a.length;

describe('keyboard explorer generator', () => {
  it('is deterministic and fresh per seed', () => {
    expect(generateRounds('x', 2, KE_ROUNDS, makeKeyRound)).toEqual(generateRounds('x', 2, KE_ROUNDS, makeKeyRound));
    expect(generateRounds('x', 3, KE_ROUNDS, makeKeyRound)).not.toEqual(generateRounds('y', 3, KE_ROUNDS, makeKeyRound));
  });
  it('knows every key group', () => {
    expect(groupOf('A')).toBe('letters');
    expect(groupOf('7')).toBe('numbers');
    expect(groupOf('←')).toBe('arrows');
    expect(groupOf('Enter')).toBe('helper');
    expect([...LETTERS, ...DIGITS, ...ARROW_KEYS, ...HELPER_KEYS].length).toBeGreaterThan(40);
  });
  for (const level of levels) {
    it(`level ${level}: one right option, no duplicates, right kind of question`, () => {
      for (let s = 0; s < 150; s++) {
        for (const r of generateRounds(`k${s}`, level, 4, makeKeyRound)) {
          expect(r.question).toBe(['group', 'job', 'finger'][level - 1]);
          expect(r.options.filter((o) => o === r.answer)).toHaveLength(1);
          expect(unique(r.options)).toBe(true);
          expect(r.options.length).toBe(level === 1 ? 4 : 4);
          if (level === 1) expect(r.answer).toBe(groupOf(r.key));
          if (level === 2) expect(r.answer).toBe(JOB_OF[r.key]);
          if (level === 3) expect(r.answer).toBe(FINGER_OF[r.key]);
        }
      }
    });
  }
  it('home row fingers are the classic ones', () => {
    expect([FINGER_OF.A, FINGER_OF.S, FINGER_OF.D, FINGER_OF.F, FINGER_OF.J, FINGER_OF.K, FINGER_OF.L]).toEqual(['lPinky', 'lRing', 'lMiddle', 'lIndex', 'rIndex', 'rMiddle', 'rRing']);
  });
});

describe('mouse maze generator', () => {
  it('is deterministic', () => expect(generateRounds('m', 3, MM_ROUNDS, makeMouseRound)).toEqual(generateRounds('m', 3, MM_ROUNDS, makeMouseRound)));
  for (const level of levels) {
    it(`level ${level}: target is on the board, only this level's moves`, () => {
      const seen = new Set<string>();
      for (let s = 0; s < 100; s++) {
        for (const r of generateRounds(`m${s}`, level, MM_ROUNDS, makeMouseRound)) {
          expect(r.shapes).toHaveLength(4);
          expect(unique(r.shapes)).toBe(true);
          expect(r.shapes).toContain(r.target);
          expect(LEVEL_ACTIONS[level]).toContain(r.action);
          seen.add(r.action);
        }
      }
      expect([...seen].sort()).toEqual([...LEVEL_ACTIONS[level]].sort());
    });
  }
  it('level 3 practises click, double-click and drag in the first rounds', () => {
    expect(generateRounds('q', 3, 3, makeMouseRound).map((r) => r.action)).toEqual(['click', 'double', 'drag']);
  });
});

describe('flowchart builder generator', () => {
  it('is deterministic', () => expect(generateRounds('f', 2, FB_ROUNDS, makeFlowRound)).toEqual(generateRounds('f', 2, FB_ROUNDS, makeFlowRound)));
  for (const level of [1, 2] as const) {
    it(`level ${level}: a real shuffle of ${ORDER_LENGTH[level]} steps`, () => {
      for (let s = 0; s < 150; s++) {
        for (const r of generateRounds(`f${s}`, level, 4, makeFlowRound)) {
          if (r.mode !== 'order') throw new Error('expected order');
          expect(TASKS).toContain(r.task);
          expect(r.order).toHaveLength(ORDER_LENGTH[level]);
          expect(r.order).toEqual([...r.order].sort((a, b) => a - b));
          expect(unique(r.order)).toBe(true);
          expect([...r.shuffled].sort((a, b) => a - b)).toEqual(r.order);
          expect(r.shuffled).not.toEqual(r.order);
          expect(r.order.every((n) => n >= 1 && n <= 5)).toBe(true);
        }
      }
    });
  }
  it('level 3 asks for symbols: one right option', () => {
    for (let s = 0; s < 100; s++) {
      for (const r of generateRounds(`f${s}`, 3, 4, makeFlowRound)) {
        if (r.mode !== 'symbol') throw new Error('expected symbol');
        expect(r.answer).toBe(SYMBOL_ITEMS[r.item]);
        expect(r.options.filter((o) => o === r.answer)).toHaveLength(1);
        expect(unique(r.options)).toBe(true);
      }
    }
  });
});

describe('safe or unsafe generator', () => {
  it('is deterministic', () => expect(generateRounds('s', 3, SU_ROUNDS, makeSafeRound)).toEqual(generateRounds('s', 3, SU_ROUNDS, makeSafeRound)));
  it('level 1 gives one behaviour with its right answer', () => {
    for (const r of generateRounds('s', 1, 40, makeSafeRound)) {
      if (r.mode !== 'one') throw new Error('expected one');
      expect(r.safe).toBe(BEHAVIOURS[r.item]);
    }
  });
  for (const level of [2, 3] as const) {
    it(`level ${level}: sorting rounds hold half safe, half unsafe, no repeats`, () => {
      for (let s = 0; s < 100; s++) {
        for (const r of generateRounds(`s${s}`, level, SU_ROUNDS, makeSafeRound)) {
          if (r.mode !== 'sort') continue;
          expect(r.items).toHaveLength(SORT_SIZE[level]);
          expect(unique(r.items)).toBe(true);
          expect(r.items.filter((i) => BEHAVIOURS[i])).toHaveLength(SORT_SIZE[level] / 2);
        }
      }
    });
  }
  it('level 3 mixes in password rounds with exactly one strong password', () => {
    let passwordRounds = 0;
    for (let s = 0; s < 100; s++) {
      for (const r of generateRounds(`p${s}`, 3, SU_ROUNDS, makeSafeRound)) {
        if (r.mode !== 'password') continue;
        passwordRounds++;
        expect(r.options).toHaveLength(3);
        expect(unique(r.options)).toBe(true);
        expect(r.options.filter(isStrongPassword)).toEqual([r.answer]);
      }
    }
    expect(passwordRounds).toBeGreaterThan(100);
  });
});

describe('parts of a computer generator', () => {
  it('is deterministic', () => expect(generateRounds('p', 2, PC_ROUNDS, makePartsRound)).toEqual(generateRounds('p', 2, PC_ROUNDS, makePartsRound)));
  for (const level of [1, 2] as const) {
    it(`level ${level}: ${MATCH_PAIRS[level]} pairs, jobs shuffled, one job per device`, () => {
      for (let s = 0; s < 150; s++) {
        for (const r of generateRounds(`p${s}`, level, 4, makePartsRound)) {
          if (r.mode !== 'match') throw new Error('expected match');
          expect(r.devices).toHaveLength(MATCH_PAIRS[level]);
          expect(unique(r.devices)).toBe(true);
          expect([...r.jobs].sort()).toEqual([...r.devices].sort());
          expect(r.jobs).not.toEqual(r.devices);
        }
      }
    });
  }
  it('level 3 sorts 6 parts, two for each bin', () => {
    for (let s = 0; s < 100; s++) {
      for (const r of generateRounds(`p${s}`, 3, 4, makePartsRound)) {
        if (r.mode !== 'sort') throw new Error('expected sort');
        expect(r.devices).toHaveLength(6);
        expect(unique(r.devices)).toBe(true);
        for (const g of ['input', 'output', 'inside']) expect(r.devices.filter((d) => DEVICES[d] === g)).toHaveLength(2);
      }
    }
  });
});

describe('folder sorter generator', () => {
  it('is deterministic', () => expect(generateRounds('d', 3, FS_ROUNDS, makeFolderRound)).toEqual(generateRounds('d', 3, FS_ROUNDS, makeFolderRound)));
  it('file endings really match their folder', () => {
    for (const [t, names] of Object.entries(FILES)) for (const n of names) expect(typeOfFile(n)).toBe(t);
    const all = Object.values(FILES).flat();
    expect(unique(all)).toBe(true);
  });
  for (const level of [1, 2] as const) {
    it(`level ${level}: files belong to the shown folders`, () => {
      const spec = SORT_SPEC[level];
      for (let s = 0; s < 150; s++) {
        for (const r of generateRounds(`d${s}`, level, 4, makeFolderRound)) {
          if (r.mode !== 'sort') throw new Error('expected sort');
          expect(r.folders).toHaveLength(spec.folders);
          expect(r.files).toHaveLength(spec.folders * spec.perFolder);
          expect(unique(r.files)).toBe(true);
          for (const f of r.files) expect(r.folders).toContain(typeOfFile(f));
          for (const t of r.folders) expect(r.files.filter((f) => typeOfFile(f) === t)).toHaveLength(spec.perFolder);
        }
      }
    });
  }
  it('level 3: the path to the file is right and unique among the options', () => {
    for (let s = 0; s < 150; s++) {
      for (const r of generateRounds(`d${s}`, 3, 4, makeFolderRound)) {
        if (r.mode !== 'path') throw new Error('expected path');
        expect(r.tree).toHaveLength(3);
        const node = r.tree.find((n) => n.type === r.answer.type)!;
        expect(SUBS[node.type]).toContain(r.answer.sub);
        expect(node.subs.find((x) => x.sub === r.answer.sub)!.file).toBe(r.file);
        expect(typeOfFile(r.file)).toBe(r.answer.type);
        expect(r.options.filter((o) => samePath(o, r.answer))).toHaveLength(1);
        expect(r.options).toHaveLength(4);
        for (const o of r.options) expect(r.options.filter((p) => samePath(p, o))).toHaveLength(1);
        expect(unique(r.tree.flatMap((n) => n.subs.map((x) => x.file)))).toBe(true);
      }
    }
  });
});
