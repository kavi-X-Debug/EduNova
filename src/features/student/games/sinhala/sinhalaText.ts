/** Helpers for Unicode Sinhala text. Pure; used by generators and tests. */

/** Sinhala signs that must never start a tile or be separated from their base letter: anusvara, visarga, al-lakuna (hal), vowel signs (pili). */
const COMBINING = /[ඁ-ඃ්ා-ෟෲෳ]/;

export const isCombiningSign = (ch: string): boolean => COMBINING.test(ch);

/** True when the text begins with a combining sign (which would mean it was cut in the middle of a letter). */
export const startsWithCombining = (s: string): boolean => s.length > 0 && isCombiningSign(s[0]);

/** Grapheme clusters of `s` (Intl.Segmenter where available; otherwise a base letter plus the signs after it). */
export function graphemes(s: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const seg = new Intl.Segmenter('si', { granularity: 'grapheme' });
    return Array.from(seg.segment(s), (x) => x.segment);
  }
  const out: string[] = [];
  for (const ch of s) {
    if (out.length > 0 && (isCombiningSign(ch) || ch === '‍')) out[out.length - 1] += ch;
    else out.push(ch);
  }
  return out;
}

/** Offsets inside `s` where a grapheme cluster ends (a tile boundary must be one of these). */
export function graphemeBoundaries(s: string): Set<number> {
  const set = new Set<number>([0]);
  let at = 0;
  for (const g of graphemes(s)) {
    at += g.length;
    set.add(at);
  }
  return set;
}
