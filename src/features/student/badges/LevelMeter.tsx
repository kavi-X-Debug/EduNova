import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/components/ui';
import type { RewardSummary } from '@/types';

const SLOTS = 10;

/**
 * Level as a picture: a big star with the level number, and ten little stars that fill up on the way to the next level.
 * Private to the student: it never compares anyone. XP is shown as "stars".
 */
export function LevelMeter({ summary }: { summary: RewardSummary }) {
  const { t } = useTranslation();
  const toNext = Math.max(0, summary.xpForNextLevel - summary.xpIntoLevel);
  const ratio = summary.xpForNextLevel > 0 ? summary.xpIntoLevel / summary.xpForNextLevel : 0;
  const filled = Math.min(SLOTS, Math.floor(ratio * SLOTS));
  const next = summary.level + 1;
  const toNextText = t('kidsplay.level.toNext', { count: toNext, next });
  return (
    <div className="flex items-center gap-4">
      <span aria-hidden className="relative flex h-24 w-24 shrink-0 items-center justify-center">
        <Star className="absolute inset-0 h-24 w-24 fill-accent-500 text-accent-600" />
        <span className="relative text-3xl font-bold text-ink">{summary.level}</span>
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl font-bold text-ink">{t('kidsplay.level.title', { level: summary.level })}</h2>
        <div
          role="progressbar"
          aria-label={t('kidsplay.level.bar', { next })}
          aria-valuemin={0}
          aria-valuemax={SLOTS}
          aria-valuenow={filled}
          aria-valuetext={toNextText}
          className="mt-2 flex flex-wrap gap-1"
        >
          {Array.from({ length: SLOTS }, (_, i) => (
            <Star key={i} aria-hidden className={cn('h-6 w-6 md:h-7 md:w-7', i < filled ? 'fill-accent-500 text-accent-600' : 'text-ink-faint')} />
          ))}
        </div>
        <p className="mt-2 text-lg text-ink-soft">{toNextText}</p>
      </div>
    </div>
  );
}
