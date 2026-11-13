// PURE generator: see docs/GAMES-AUTHORING.md.
import type { RoundContext } from '../engine/generate';
import type { Rng } from '../engine/rng';

export type FlowSymbol = 'terminator' | 'process' | 'decision' | 'io';
export const SYMBOLS: FlowSymbol[] = ['terminator', 'process', 'decision', 'io'];
/** Everyday tasks, each with 5 steps written in the locale files as games.ict.flowchartBuilder.task.<id>.s1..s5. */
export const TASKS = ['tea', 'school', 'plant', 'hands', 'sum'] as const;
export type TaskId = (typeof TASKS)[number];
/** Step cards in the "symbol" level: id -> the symbol it needs. */
export const SYMBOL_ITEMS: Record<string, FlowSymbol> = {
  start: 'terminator', stop: 'terminator',
  add: 'process', shoes: 'process', pour: 'process',
  rain: 'decision', big: 'decision', hot: 'decision',
  read: 'io', show: 'io', print: 'io',
};

export type FlowRound =
  | { mode: 'order'; task: TaskId; /** correct order: step numbers 1..5 (3 of them in level 1) */ order: number[]; /** the cards as first shown */ shuffled: number[] }
  | { mode: 'symbol'; item: string; answer: FlowSymbol; options: FlowSymbol[] };

export const ORDER_LENGTH: Record<1 | 2, number> = { 1: 3, 2: 5 };

export function makeFlowRound(rng: Rng, { level }: RoundContext): FlowRound {
  if (level === 3) {
    const item = rng.pick(Object.keys(SYMBOL_ITEMS));
    return { mode: 'symbol', item, answer: SYMBOL_ITEMS[item], options: SYMBOLS.slice() };
  }
  const task = rng.pick(TASKS);
  const order = rng.sample([1, 2, 3, 4, 5], ORDER_LENGTH[level]).sort((a, b) => a - b);
  let shuffled = rng.shuffle(order);
  for (let tries = 0; tries < 20 && shuffled.every((n, i) => n === order[i]); tries++) shuffled = rng.shuffle(order);
  if (shuffled.every((n, i) => n === order[i])) shuffled = [...order.slice(1), order[0]];
  return { mode: 'order', task, order, shuffled };
}

export const ROUNDS_PER_PLAY = 6;
