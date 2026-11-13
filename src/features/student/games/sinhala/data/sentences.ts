// Sentences for Sentence Order (concept si6-sentence-building). ORIGINAL, written by the agent, NOT native-verified (docs/I18N-REVIEW.md section 10).
// `words` is the natural order (who first, the doing word last). `swapMiddle`: the two middle words of a 4-word sentence may also swap.

export interface SentenceItem {
  id: string;
  words: string[];
  swapMiddle?: boolean;
}

export const SENTENCES: Record<1 | 2 | 3, readonly SentenceItem[]> = {
  1: [
    { id: 's1a', words: ['ළමයා', 'පොත', 'කියවයි'] },
    { id: 's1b', words: ['අම්මා', 'බත්', 'උයයි'] },
    { id: 's1c', words: ['පූසා', 'කිරි', 'බොයි'] },
    { id: 's1d', words: ['මාළුවා', 'වතුරේ', 'පීනයි'] },
    { id: 's1e', words: ['ගුරුතුමිය', 'පාඩම', 'උගන්වයි'] },
    { id: 's1f', words: ['කුරුල්ලා', 'ගසේ', 'සිටියි'] },
    { id: 's1g', words: ['නංගි', 'ගීතයක්', 'ගයයි'] },
    { id: 's1h', words: ['සීයා', 'පත්තරය', 'කියවයි'] },
  ],
  2: [
    { id: 's2a', words: ['අම්මා', 'උදේ', 'බත්', 'උයයි'], swapMiddle: true },
    { id: 's2b', words: ['ළමයි', 'පාසලට', 'පයින්', 'යති'], swapMiddle: true },
    { id: 's2c', words: ['තාත්තා', 'වත්තේ', 'ගස්', 'සිටුවයි'] },
    { id: 's2d', words: ['සීයා', 'හවසට', 'පත්තරය', 'කියවයි'], swapMiddle: true },
    { id: 's2e', words: ['නංගි', 'උදේ', 'කිරි', 'බොයි'], swapMiddle: true },
    { id: 's2f', words: ['ගොවියා', 'කෙතේ', 'වී', 'වපුරයි'] },
    { id: 's2g', words: ['ගුරුතුමිය', 'පන්තියේ', 'පාඩම', 'උගන්වයි'], swapMiddle: true },
    { id: 's2h', words: ['සුදු', 'හාවා', 'කැරට්', 'කයි'] },
  ],
  3: [
    { id: 's3a', words: ['අම්මා', 'උදේ', 'රසවත්', 'බත්', 'උයයි'] },
    { id: 's3b', words: ['ලස්සන', 'කුරුල්ලා', 'ගසේ', 'ගීත', 'ගයයි'] },
    { id: 's3c', words: ['අපේ', 'ගුරුතුමිය', 'අපට', 'කතාවක්', 'කියයි'] },
    { id: 's3d', words: ['කුඩා', 'නංගි', 'උදේ', 'කිරි', 'බොයි'] },
    { id: 's3e', words: ['පාසල්', 'ළමයි', 'උදේ', 'ගීතයක්', 'ගයති'] },
    { id: 's3f', words: ['සීයා', 'හවසට', 'වත්තේ', 'ගස්', 'සිටුවයි'] },
  ],
};
