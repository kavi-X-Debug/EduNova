// Spelling data for Fix the Spelling (concept si6-spelling-aspirates-nasals). Native review needed (docs/I18N-REVIEW.md section 10).
import type { PictureId } from './words';

export type SpellingRule = 'la' | 'na' | 'prenasal' | 'aspirate';

export interface SpellingError {
  /** A wrong spelling of the word. */
  text: string;
  /** true = surely not a word at all (safe for "find the mistake"); false = may be another real word or a variant, so only shown next to the picture. */
  nonword: boolean;
}

export interface SpellingItem {
  /** The picture that shows the meaning (the correct word is `wordOf(id).word`). */
  id: PictureId;
  rule: SpellingRule;
  /** The key letter to look at, shown in the explanation. */
  letter: string;
  errors: SpellingError[];
}

export const SPELLING_ITEMS: readonly SpellingItem[] = [
  { id: 'cat', rule: 'la', letter: 'ළ', errors: [{ text: 'බලලා', nonword: false }, { text: 'බළළා', nonword: true }, { text: 'බලළා', nonword: true }] },
  { id: 'moon', rule: 'prenasal', letter: 'ඳ', errors: [{ text: 'හද', nonword: false }, { text: 'හන්ද', nonword: false }] },
  { id: 'mango', rule: 'prenasal', letter: 'ඹ', errors: [{ text: 'අබ', nonword: false }, { text: 'අම්බ', nonword: false }] },
  { id: 'river', rule: 'prenasal', letter: 'ඟ', errors: [{ text: 'ගග', nonword: false }, { text: 'ගන්ග', nonword: true }] },
  { id: 'mountain', rule: 'prenasal', letter: 'ඳ', errors: [{ text: 'කදු', nonword: false }, { text: 'කන්දු', nonword: true }] },
  { id: 'grass', rule: 'na', letter: 'ණ', errors: [{ text: 'තනකොළ', nonword: true }, { text: 'තණකොල', nonword: true }, { text: 'තනකොල', nonword: true }] },
  { id: 'ladder', rule: 'na', letter: 'ණ', errors: [{ text: 'ඉනිමඟ', nonword: true }, { text: 'ඉණිමග', nonword: true }, { text: 'ඉනිමග', nonword: true }] },
  { id: 'bell', rule: 'aspirate', letter: 'ඝ', errors: [{ text: 'ගණ්ටාව', nonword: true }, { text: 'ඝන්ටාව', nonword: true }, { text: 'ගන්ටාව', nonword: true }] },
];
