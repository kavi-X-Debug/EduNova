// Past or Present? bank. `cue` is the word(s) in the sentence that show the tense (used in the kind explanation).
export interface TenseSentence {
  text: string;
  tense: 'past' | 'present';
  cue: string;
}
/** Level 1: clear time words. */
export const TENSES_1: TenseSentence[] = [
  { text: 'I played football yesterday.', tense: 'past', cue: 'yesterday' },
  { text: 'She is reading now.', tense: 'present', cue: 'now' },
  { text: 'We watched TV last night.', tense: 'past', cue: 'last night' },
  { text: 'Dad cooks rice every day.', tense: 'present', cue: 'every day' },
  { text: 'The bus came an hour ago.', tense: 'past', cue: 'ago' },
  { text: 'They are walking to school today.', tense: 'present', cue: 'are walking' },
  { text: 'Kamal visited his uncle last week.', tense: 'past', cue: 'last week' },
  { text: 'I brush my teeth every morning.', tense: 'present', cue: 'every morning' },
  { text: 'The dog barked at the cat yesterday.', tense: 'past', cue: 'yesterday' },
  { text: 'My sister is singing now.', tense: 'present', cue: 'now' },
];
/** Level 2: the verb form tells the tense (regular verbs, was/were + -ing). */
export const TENSES_2: TenseSentence[] = [
  { text: 'The children played in the garden.', tense: 'past', cue: 'played' },
  { text: 'The children play in the garden.', tense: 'present', cue: 'play' },
  { text: 'Mother cleaned the kitchen.', tense: 'past', cue: 'cleaned' },
  { text: 'Mother is cleaning the kitchen.', tense: 'present', cue: 'is cleaning' },
  { text: 'We walked to the temple.', tense: 'past', cue: 'walked' },
  { text: 'We walk to the temple.', tense: 'present', cue: 'walk' },
  { text: 'The farmer planted the seeds.', tense: 'past', cue: 'planted' },
  { text: 'The farmer plants the seeds.', tense: 'present', cue: 'plants' },
  { text: 'Nimali was painting a picture.', tense: 'past', cue: 'was painting' },
  { text: 'Nimali is painting a picture.', tense: 'present', cue: 'is painting' },
  { text: 'The boys were jumping on the bed.', tense: 'past', cue: 'were jumping' },
  { text: 'The boys are jumping on the bed.', tense: 'present', cue: 'are jumping' },
];
/** Level 3: irregular verbs. */
export const TENSES_3: TenseSentence[] = [
  { text: 'She went to the shop.', tense: 'past', cue: 'went' },
  { text: 'She goes to the shop.', tense: 'present', cue: 'goes' },
  { text: 'He ate two mangoes.', tense: 'past', cue: 'ate' },
  { text: 'He eats two mangoes.', tense: 'present', cue: 'eats' },
  { text: 'We saw a peacock.', tense: 'past', cue: 'saw' },
  { text: 'We see a peacock.', tense: 'present', cue: 'see' },
  { text: 'They ran to the bus.', tense: 'past', cue: 'ran' },
  { text: 'They run to the bus.', tense: 'present', cue: 'run' },
  { text: 'The teacher wrote on the board.', tense: 'past', cue: 'wrote' },
  { text: 'The teacher writes on the board.', tense: 'present', cue: 'writes' },
  { text: 'I took my umbrella.', tense: 'past', cue: 'took' },
  { text: 'I take my umbrella.', tense: 'present', cue: 'take' },
  { text: 'My friend came early.', tense: 'past', cue: 'came' },
  { text: 'My friend comes early.', tense: 'present', cue: 'comes' },
];
