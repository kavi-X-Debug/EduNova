// Fill the Gap banks (be-verbs, a / an / some, this / that / these / those, simple present, was / were).
/** `s` starts a sentence, `q` is the form after "Am / Is / Are" in a question. */
export interface BeSubject {
  s: string;
  q: string;
  be: 'am' | 'is' | 'are';
}
export const BE_SUBJECTS: BeSubject[] = [
  { s: 'I', q: 'I', be: 'am' },
  { s: 'You', q: 'you', be: 'are' },
  { s: 'He', q: 'he', be: 'is' },
  { s: 'She', q: 'she', be: 'is' },
  { s: 'It', q: 'it', be: 'is' },
  { s: 'We', q: 'we', be: 'are' },
  { s: 'They', q: 'they', be: 'are' },
  { s: 'My brother', q: 'my brother', be: 'is' },
  { s: 'The girls', q: 'the girls', be: 'are' },
  { s: 'Nimal and Kamal', q: 'Nimal and Kamal', be: 'are' },
  { s: 'The dog', q: 'the dog', be: 'is' },
  { s: 'Our teacher', q: 'our teacher', be: 'is' },
];
export const BE_PREDICATES: string[] = ['happy', 'at school', 'in the garden', 'ready', 'hungry', 'tall', 'in Class 6', 'very kind', 'at home', 'busy'];

/** Singular countable nouns: `an` when the word starts with a vowel sound. */
export const A_AN_NOUNS: { w: string; art: 'a' | 'an' }[] = [
  { w: 'apple', art: 'an' }, { w: 'egg', art: 'an' }, { w: 'orange', art: 'an' }, { w: 'umbrella', art: 'an' },
  { w: 'elephant', art: 'an' }, { w: 'ant', art: 'an' }, { w: 'owl', art: 'an' }, { w: 'book', art: 'a' },
  { w: 'dog', art: 'a' }, { w: 'banana', art: 'a' }, { w: 'house', art: 'a' }, { w: 'pencil', art: 'a' },
  { w: 'kite', art: 'a' }, { w: 'mango', art: 'a' },
];
/** Adjectives that come between the article and the noun (level 3). */
export const A_AN_ADJECTIVES: { w: string; art: 'a' | 'an' }[] = [
  { w: 'old', art: 'an' }, { w: 'empty', art: 'an' }, { w: 'angry', art: 'an' }, { w: 'untidy', art: 'an' },
  { w: 'big', art: 'a' }, { w: 'red', art: 'a' }, { w: 'happy', art: 'a' }, { w: 'new', art: 'a' }, { w: 'yellow', art: 'a' },
];
export const A_AN_FRAMES: [string, string][] = [
  ['I have', '.'], ['She has', '.'], ['We can see', '.'], ['Kamal found', '.'], ['There is', 'on the table.'], ['Nimali bought', 'for her mother.'],
];
/** Plural or uncountable nouns take `some`. */
export const SOME_NOUNS: string[] = ['rice', 'water', 'milk', 'books', 'eggs', 'apples', 'mangoes', 'bread', 'flowers', 'sugar'];
export const SOME_FRAMES: [string, string][] = [['I have', '.'], ['We bought', 'at the shop.'], ['She wants', '.'], ['Dad needs', 'for the kitchen.']];

/** this / that (one thing) and these / those (many). */
export const DEMO_NOUNS: { one: string; many: string }[] = [
  { one: 'pencil', many: 'pencils' }, { one: 'bag', many: 'bags' }, { one: 'tree', many: 'trees' },
  { one: 'book', many: 'books' }, { one: 'bird', many: 'birds' }, { one: 'flower', many: 'flowers' },
];
export const DEMO_ADJECTIVES: string[] = ['red', 'new', 'big', 'old', 'nice'];

/** Simple present: the verb forms and a phrase that goes after them. */
export const PRESENT_VERBS: { base: string; s: string; ing: string; rest: string }[] = [
  { base: 'go', s: 'goes', ing: 'going', rest: 'to school every day.' },
  { base: 'play', s: 'plays', ing: 'playing', rest: 'cricket after school.' },
  { base: 'eat', s: 'eats', ing: 'eating', rest: 'rice for lunch.' },
  { base: 'walk', s: 'walks', ing: 'walking', rest: 'to the shop on Sundays.' },
  { base: 'watch', s: 'watches', ing: 'watching', rest: 'TV in the evening.' },
  { base: 'study', s: 'studies', ing: 'studying', rest: 'English at night.' },
  { base: 'wash', s: 'washes', ing: 'washing', rest: 'the dishes every day.' },
  { base: 'read', s: 'reads', ing: 'reading', rest: 'a book before bed.' },
  { base: 'drink', s: 'drinks', ing: 'drinking', rest: 'milk every morning.' },
];
/** `third` = he / she / it / one person or thing (verb takes -s). */
export const PRESENT_SUBJECTS: { s: string; third: boolean }[] = [
  { s: 'He', third: true }, { s: 'She', third: true }, { s: 'My mother', third: true }, { s: 'The dog', third: true },
  { s: 'Kamal', third: true }, { s: 'Our teacher', third: true }, { s: 'I', third: false }, { s: 'You', third: false },
  { s: 'We', third: false }, { s: 'They', third: false }, { s: 'The children', third: false }, { s: 'My friends', third: false },
];

/** was / were, with a yesterday phrase. */
export const WAS_SUBJECTS: { s: string; was: boolean }[] = [
  { s: 'I', was: true }, { s: 'He', was: true }, { s: 'She', was: true }, { s: 'The cat', was: true }, { s: 'My uncle', was: true },
  { s: 'You', was: false }, { s: 'We', was: false }, { s: 'They', was: false }, { s: 'The boys', was: false }, { s: 'My cousins', was: false },
];
export const WAS_PHRASES: string[] = ['at the zoo yesterday.', 'at home last night.', 'very happy yesterday.', 'in the garden an hour ago.', 'at school last Monday.', 'tired after the game.'];
