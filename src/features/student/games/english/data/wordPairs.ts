// English word banks for Word Match. English content stays English in every UI language (original lists, not textbook text).
export type PairKind = 'opposite' | 'plural' | 'young';
export interface WordPair {
  a: string;
  b: string;
  /** 1 = everyday words, 2 = a little harder (used from level 2), 3 = tricky (level 3 only). */
  tier: 1 | 2 | 3;
}

export const OPPOSITES: WordPair[] = [
  { a: 'hot', b: 'cold', tier: 1 },
  { a: 'big', b: 'small', tier: 1 },
  { a: 'up', b: 'down', tier: 1 },
  { a: 'happy', b: 'sad', tier: 1 },
  { a: 'open', b: 'shut', tier: 1 },
  { a: 'fast', b: 'slow', tier: 1 },
  { a: 'day', b: 'night', tier: 1 },
  { a: 'old', b: 'new', tier: 1 },
  { a: 'tall', b: 'short', tier: 1 },
  { a: 'hard', b: 'soft', tier: 1 },
  { a: 'wet', b: 'dry', tier: 1 },
  { a: 'full', b: 'empty', tier: 1 },
  { a: 'clean', b: 'dirty', tier: 2 },
  { a: 'heavy', b: 'light', tier: 2 },
  { a: 'thick', b: 'thin', tier: 2 },
  { a: 'early', b: 'late', tier: 2 },
  { a: 'cheap', b: 'expensive', tier: 2 },
  { a: 'noisy', b: 'quiet', tier: 2 },
  { a: 'brave', b: 'afraid', tier: 3 },
  { a: 'ancient', b: 'modern', tier: 3 },
  { a: 'rough', b: 'smooth', tier: 3 },
  { a: 'generous', b: 'selfish', tier: 3 },
  { a: 'wide', b: 'narrow', tier: 3 },
  { a: 'forget', b: 'remember', tier: 3 },
];

export const PLURALS: WordPair[] = [
  { a: 'book', b: 'books', tier: 1 },
  { a: 'cup', b: 'cups', tier: 1 },
  { a: 'pen', b: 'pens', tier: 1 },
  { a: 'bus', b: 'buses', tier: 1 },
  { a: 'box', b: 'boxes', tier: 1 },
  { a: 'dish', b: 'dishes', tier: 1 },
  { a: 'watch', b: 'watches', tier: 2 },
  { a: 'baby', b: 'babies', tier: 2 },
  { a: 'leaf', b: 'leaves', tier: 2 },
  { a: 'knife', b: 'knives', tier: 2 },
  { a: 'city', b: 'cities', tier: 2 },
  { a: 'child', b: 'children', tier: 3 },
  { a: 'man', b: 'men', tier: 3 },
  { a: 'woman', b: 'women', tier: 3 },
  { a: 'foot', b: 'feet', tier: 3 },
  { a: 'tooth', b: 'teeth', tier: 3 },
  { a: 'mouse', b: 'mice', tier: 3 },
  { a: 'ox', b: 'oxen', tier: 3 },
  { a: 'goose', b: 'geese', tier: 3 },
];

/** a = the grown-up animal, b = its baby. */
export const YOUNG_ANIMALS: WordPair[] = [
  { a: 'dog', b: 'puppy', tier: 1 },
  { a: 'cat', b: 'kitten', tier: 1 },
  { a: 'hen', b: 'chick', tier: 1 },
  { a: 'cow', b: 'calf', tier: 1 },
  { a: 'duck', b: 'duckling', tier: 1 },
  { a: 'sheep', b: 'lamb', tier: 1 },
  { a: 'horse', b: 'foal', tier: 2 },
  { a: 'pig', b: 'piglet', tier: 2 },
  { a: 'frog', b: 'tadpole', tier: 2 },
  { a: 'bear', b: 'cub', tier: 2 },
  { a: 'goat', b: 'kid', tier: 2 },
  { a: 'deer', b: 'fawn', tier: 3 },
  { a: 'swan', b: 'cygnet', tier: 3 },
  { a: 'kangaroo', b: 'joey', tier: 3 },
  { a: 'elephant', b: 'calf', tier: 3 },
];
