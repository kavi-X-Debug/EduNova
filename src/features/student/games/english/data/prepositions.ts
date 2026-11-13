// Pick the Preposition banks. The picture scenes are drawn in PrepositionScene (the ball is always the thing being placed).
export type SceneId = 'in' | 'on' | 'under' | 'between' | 'behind' | 'near' | 'in front of';
export const SCENES_1: SceneId[] = ['in', 'on', 'under'];
export const SCENES_2: SceneId[] = ['in', 'on', 'under', 'between', 'behind', 'near', 'in front of'];

/** What follows the preposition in "The ball is ___ ...". */
export const SCENE_AFTER: Record<SceneId, string> = {
  in: 'the box.',
  on: 'the table.',
  under: 'the table.',
  between: 'the two boxes.',
  behind: 'the box.',
  near: 'the box.',
  'in front of': 'the box.',
};

export type TimeRule = 'on' | 'at' | 'in';
export interface TimeItem {
  before: string;
  after: string;
  answer: TimeRule;
  /** The time word that decides it, quoted in the explanation ("Monday"). */
  example: string;
}
/** on = days and dates, at = clock times and night, in = months and parts of the day. */
export const TIME_ITEMS: TimeItem[] = [
  { before: 'We have a test', after: 'Monday.', answer: 'on', example: 'Monday' },
  { before: 'Grandma visits us', after: 'Sunday.', answer: 'on', example: 'Sunday' },
  { before: 'We play cricket', after: 'Saturday morning.', answer: 'on', example: 'Saturday' },
  { before: 'The school sports meet is', after: 'Friday.', answer: 'on', example: 'Friday' },
  { before: 'School starts', after: 'eight o’clock.', answer: 'at', example: 'eight o’clock' },
  { before: 'The stars shine', after: 'night.', answer: 'at', example: 'night' },
  { before: 'We eat dinner', after: 'seven o’clock.', answer: 'at', example: 'seven o’clock' },
  { before: 'The bell rings', after: 'noon.', answer: 'at', example: 'noon' },
  { before: 'My birthday is', after: 'July.', answer: 'in', example: 'July' },
  { before: 'I go to school', after: 'the morning.', answer: 'in', example: 'the morning' },
  { before: 'We do homework', after: 'the evening.', answer: 'in', example: 'the evening' },
  { before: 'It rains a lot', after: 'April.', answer: 'in', example: 'April' },
];
export const TIME_PREPOSITIONS: TimeRule[] = ['in', 'on', 'at'];
