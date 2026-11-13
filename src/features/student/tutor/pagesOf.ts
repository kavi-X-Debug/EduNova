/** "Pages 12-15" from a reference like "Part 1, pp. 12-15". Library references (lib:...) have no pages. */
export function pagesOf(ref: string): string | undefined {
  if (ref.startsWith('lib:')) return undefined;
  const m = ref.match(/(\d+(?:\s*[-–]\s*\d+)?)\s*$/);
  return m ? m[1].replace(/\s+/g, '') : undefined;
}
