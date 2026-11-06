import { CONCEPT_EN, SUBJECT_EN } from './concepts';
import { NEXT_STEP_EN, QUEST_EN, QUESTION_EN, WELLBEING_EN } from './content';

/**
 * English text for every i18n key the mock data emits (concept titles, diagnostic prompts and
 * options, quests, missions, exam next steps, wellbeing prompts). Agent C loads this into en.json;
 * si/ta need their own translations.
 */
export const mockEn: Record<string, string> = {
  ...CONCEPT_EN,
  ...SUBJECT_EN,
  ...QUESTION_EN,
  ...QUEST_EN,
  ...NEXT_STEP_EN,
  ...WELLBEING_EN,
};
