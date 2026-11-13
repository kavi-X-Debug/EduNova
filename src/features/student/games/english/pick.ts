// Pure helpers for English word games (no React). Imports only the engine's pure modules.
import type { RoundContext } from '../engine/generate';
import { createRng, type Rng } from '../engine/rng';

/** A play-level shuffle of a bank: the same for every round of one play (seed + level), different between plays. */
export function playOrder<T>(ctx: RoundContext, bank: readonly T[], fallback: Rng): T[] {
  if (ctx.seed === undefined) return fallback.shuffle(bank);
  return createRng(`${ctx.seed}|${ctx.level}|${bank.length}`).shuffle(bank);
}

/** The item for this round: rounds of one play never repeat an item until the bank is used up. */
export function pickForRound<T>(rng: Rng, ctx: RoundContext, bank: readonly T[]): T {
  if (ctx.seed === undefined) return rng.pick(bank);
  const order = playOrder(ctx, bank, rng);
  return order[ctx.index % order.length];
}

/** Shuffles `items`, making sure the result differs from the original order when that is possible. */
export function shuffleDifferent<T>(rng: Rng, items: readonly T[], same: (a: T, b: T) => boolean = (a, b) => a === b): T[] {
  let out = rng.shuffle(items);
  for (let tries = 0; tries < 20 && out.every((x, i) => same(x, items[i])); tries++) out = rng.shuffle(items);
  if (out.length > 1 && out.every((x, i) => same(x, items[i]))) out = [...items.slice(1), items[0]];
  return out;
}
