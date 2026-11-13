import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { cn } from '@/components/ui';
import { focusRing } from '@/components/ui/cn';
import { useGt as useT } from '@/features/student/games/useGt';
import type { GameDefinition, GameStat } from '@/types';
import { GameThumb } from './GameThumb';
import { subjectKey } from './labels';
import { StarsMeter } from './engine/StarsMeter';

/** One game card: picture, short title, one line on how to play, and one action (Play). The whole card is the link. */
export function GameCard({ game, stat }: { game: GameDefinition; stat?: GameStat }) {
  const t = useT();
  return (
    <Link
      to={`/student/games/${game.id}`}
      className={cn(
        'group flex h-full flex-col gap-3 rounded-xl border border-line bg-surface p-3 shadow-card transition duration-base ease-standard hover:border-line-strong hover:shadow-fx-glow motion-ok:hover:-translate-y-1 motion-ok:focus-visible:-translate-y-1',
        focusRing,
      )}
    >
      <GameThumb game={game} />
      <div className="flex flex-1 flex-col gap-1 px-1">
        <h3 className="text-xl font-bold text-ink">{t(game.titleKey)}</h3>
        <p className="text-base text-ink-soft">{t(game.howToKey)}</p>
        <p className="mt-1 text-base font-bold text-ink-soft">
          {t(subjectKey(game.subject))} · {t('games.lib.minutes', { count: game.estimatedMinutes })}
        </p>
      </div>
      <div className="flex min-h-12 items-center justify-between gap-2 px-1 pb-1">
        {stat ? <StarsMeter stars={stat.bestStars} size="sm" /> : <span />}
        <span className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-brand-600 px-5 text-lg font-bold text-surface">
          <Play aria-hidden className="h-5 w-5" />
          {t('games.lib.play')}
        </span>
      </div>
    </Link>
  );
}
