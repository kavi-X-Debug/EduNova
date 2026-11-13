/** A star milestone is reached every this many stars collected across all games (best stars per game, added up). */
export const STAR_MILESTONE = 10;

/** The star total to celebrate when a play moves the total from `before` to `after`, or undefined if no milestone was crossed. */
export function crossedMilestone(before: number, after: number, step = STAR_MILESTONE): number | undefined {
  if (step <= 0 || after <= before) return undefined;
  const reached = Math.floor(after / step);
  return reached > Math.floor(before / step) ? reached * step : undefined;
}
