import type { GameSubject } from '@/types';

/** i18n key for a game subject's name: the usual `subject.<id>` keys, plus `games.lib.subject.mixed`. */
export const subjectKey = (subject: GameSubject): string => (subject === 'mixed' ? 'games.lib.subject.mixed' : `subject.${subject}`);
