import { useTranslation } from 'react-i18next';

/** Translate function for games: accepts any key string (game keys are built per game id, e.g. `games.maths.<id>.title`). The registry test checks they exist. */
export const useGt = () => useTranslation().t;
