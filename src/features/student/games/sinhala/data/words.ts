// Sinhala word bank for Word Builder, Match the Word and Fix the Spelling.
// ALL Sinhala text here was written by the agent, NOT verified by a native speaker: see docs/I18N-REVIEW.md section 10.
// Proper Unicode Sinhala only. `syllables` are written out by hand (letter + vowel sign stay together, a hal-kirima
// consonant stays with the letter that follows it) so no combining sign is ever split from its base letter.

/** The pictures drawn by `../pictures.tsx` (one simple token-coloured SVG each). */
export type PictureId =
  | 'tree' | 'flower' | 'book' | 'sun' | 'moon' | 'star' | 'cat' | 'bird' | 'house' | 'ball' | 'mango'
  | 'umbrella' | 'cup' | 'fish' | 'river' | 'mountain' | 'grass' | 'ladder' | 'bell';

export interface PictureWord {
  id: PictureId;
  /** The word, in Unicode Sinhala. */
  word: string;
  /** Tiles for Word Builder; `syllables.join('') === word`. */
  syllables: string[];
}

export const PICTURE_WORDS: readonly PictureWord[] = [
  { id: 'tree', word: 'ගස', syllables: ['ග', 'ස'] },
  { id: 'flower', word: 'මල', syllables: ['ම', 'ල'] },
  { id: 'book', word: 'පොත', syllables: ['පො', 'ත'] },
  { id: 'sun', word: 'ඉර', syllables: ['ඉ', 'ර'] },
  { id: 'moon', word: 'හඳ', syllables: ['හ', 'ඳ'] },
  { id: 'mango', word: 'අඹ', syllables: ['අ', 'ඹ'] },
  { id: 'river', word: 'ගඟ', syllables: ['ග', 'ඟ'] },
  { id: 'mountain', word: 'කඳු', syllables: ['ක', 'ඳු'] },
  { id: 'star', word: 'තරුව', syllables: ['ත', 'රු', 'ව'] },
  { id: 'cat', word: 'බළලා', syllables: ['බ', 'ළ', 'ලා'] },
  { id: 'house', word: 'ගෙදර', syllables: ['ගෙ', 'ද', 'ර'] },
  { id: 'ball', word: 'බෝලය', syllables: ['බෝ', 'ල', 'ය'] },
  { id: 'umbrella', word: 'කුඩය', syllables: ['කු', 'ඩ', 'ය'] },
  { id: 'cup', word: 'කෝප්පය', syllables: ['කෝ', 'ප්ප', 'ය'] },
  { id: 'fish', word: 'මාළුවා', syllables: ['මා', 'ළු', 'වා'] },
  { id: 'bird', word: 'කුරුල්ලා', syllables: ['කු', 'රු', 'ල්ලා'] },
  { id: 'bell', word: 'ඝණ්ටාව', syllables: ['ඝ', 'ණ්ටා', 'ව'] },
  { id: 'grass', word: 'තණකොළ', syllables: ['ත', 'ණ', 'කො', 'ළ'] },
  { id: 'ladder', word: 'ඉණිමඟ', syllables: ['ඉ', 'ණි', 'ම', 'ඟ'] },
];

export const wordOf = (id: PictureId): PictureWord => {
  const w = PICTURE_WORDS.find((p) => p.id === id);
  if (!w) throw new Error(`unknown picture ${id}`);
  return w;
};

/** Word Builder pools per level (picture ids). Level 1: 2 pieces; 2: 3 pieces; 3: 3-4 pieces and spare pieces. */
export const BUILDER_POOLS: Record<1 | 2 | 3, readonly PictureId[]> = {
  1: ['tree', 'flower', 'book', 'sun', 'moon', 'mango', 'river', 'mountain'],
  2: ['star', 'cat', 'house', 'ball', 'umbrella'],
  3: ['cup', 'fish', 'bird', 'bell', 'grass', 'ladder'],
};
