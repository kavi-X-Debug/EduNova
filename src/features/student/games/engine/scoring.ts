export const MAX_STARS = 3;

/**
 * Stars for a finished play. 1 to 3, never 0 and never a rank: finishing always earns a star.
 * 3 stars: at least 85% right; 2 stars: at least 60%; otherwise 1.
 * Only the child sees these; they are not marks.
 */
export function computeStars(correct: number, total: number): 1 | 2 | 3 {
  if (total <= 0) return 1;
  const ratio = Math.min(1, Math.max(0, correct / total));
  if (ratio >= 0.85) return 3;
  if (ratio >= 0.6) return 2;
  return 1;
}
