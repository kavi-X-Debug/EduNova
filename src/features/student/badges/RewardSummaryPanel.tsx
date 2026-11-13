import { Flame, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ProgressBar } from '@/components/ui';
import type { RewardSummary } from '@/types';

/**
 * Level, XP and streak. Wording is deliberately gentle: a break never shows a "lost" streak, only a welcome back.
 * Nothing here compares the student with anyone else.
 */
export function RewardSummaryPanel({ summary }: { summary: RewardSummary }) {
  const { t } = useTranslation();
  const toNext = summary.xpForNextLevel - summary.xpIntoLevel;
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="flex flex-wrap items-center gap-2 text-lg font-semibold text-ink">
          <Sparkles aria-hidden className="h-5 w-5 text-brand-600" />
          <span>{t('rewards.level', { level: summary.level })}</span>
          <span className="text-sm font-normal text-ink-soft">{t('rewards.xp.total', { xp: summary.xp })}</span>
        </p>
        <ProgressBar className="mt-2" value={(summary.xpIntoLevel / summary.xpForNextLevel) * 100} label={t('rewards.xp.barLabel', { level: summary.level + 1 })} />
        <p className="mt-1 text-xs text-ink-soft">{t('rewards.xp.toNext', { xp: toNext, level: summary.level + 1 })}</p>
      </div>
      <div>
        {summary.currentStreak > 0 ? (
          <p className="flex items-center gap-2 text-base font-semibold text-ink">
            <Flame aria-hidden className="h-5 w-5 text-warning-700" />
            {t('rewards.streak.days', { count: summary.currentStreak })}
          </p>
        ) : (
          <p className="flex items-start gap-2 text-base font-semibold text-ink">
            <Flame aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-ink-faint" />
            {summary.welcomeBack ? t('rewards.streak.welcomeBack') : t('rewards.streak.start')}
          </p>
        )}
        <p className="mt-1 text-xs text-ink-soft">
          {summary.bestStreak > 0 && t('rewards.streak.best', { count: summary.bestStreak })}
          {summary.freezes > 0 && ` ${t('rewards.streak.freeze', { count: summary.freezes })}`}
        </p>
      </div>
    </div>
  );
}
