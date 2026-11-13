// Pure helpers shared by the science generators (no React, no services). See docs/GAMES-AUTHORING.md.
import type { Rng } from '../engine/rng';

/** A "sort into bins" round: every item id belongs to exactly one bin (`truth`). */
export interface SortRound<B extends string = string> {
  bins: B[];
  items: string[];
  truth: Record<string, B>;
}

/** Builds a sort round from already-sampled groups; the tray order is shuffled. Item ids must be unique across bins. */
export function assembleSort<B extends string>(rng: Rng, groups: ReadonlyArray<readonly [B, readonly string[]]>): SortRound<B> {
  const truth: Record<string, B> = {};
  const items: string[] = [];
  for (const [bin, ids] of groups) {
    for (const id of ids) {
      truth[id] = bin;
      items.push(id);
    }
  }
  return { bins: groups.map(([b]) => b), items: rng.shuffle(items), truth };
}

/** The item ids placed in the wrong bin (placements: itemId -> binId). Missing = wrong. */
export function wrongItems<B extends string>(round: SortRound<B>, placements: Record<string, string | null | undefined>): string[] {
  return round.items.filter((id) => placements[id] !== round.truth[id]);
}

/** A "put in order" round: `order` is the right sequence, `shuffled` is how the tray starts (never already in order). */
export interface SequenceRound {
  order: string[];
  shuffled: string[];
}

export function assembleSequence(rng: Rng, order: string[]): SequenceRound {
  let shuffled = rng.shuffle(order);
  for (let tries = 0; tries < 20 && shuffled.every((id, i) => id === order[i]); tries++) shuffled = rng.shuffle(order);
  if (shuffled.every((id, i) => id === order[i])) shuffled = [...order.slice(1), order[0]];
  return { order, shuffled };
}
