import { useTranslation } from 'react-i18next';
import { Badge, BadgeImage, ProgressBar, cn } from '@/components/ui';
import { useLocale } from '@/i18n';
import { formatDate } from '@/lib';
import type { BadgeProgress } from '@/types';

/** One badge tile: artwork, name, what it is for, and either the earned date or progress toward it. */
export function BadgeCard({ item }: { item: BadgeProgress }) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { badge, earned } = item;
  const title = t(badge.titleKey);
  return (
    <li className={cn('flex gap-4 rounded-lg border p-4', earned ? 'border-line bg-surface shadow-card' : 'border-line bg-surface-muted')}>
      <BadgeImage badgeId={badge.id} rarity={badge.rarity} locked={!earned} size="md" />
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-ink">
          {title}
          {!earned && <span className="sr-only"> ({t('rewards.locked.label')})</span>}
        </h3>
        <p className="mt-1 text-sm text-ink-soft">
          <span className="font-semibold">{t('rewards.howTo')}: </span>
          {t(badge.descriptionKey)}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge tone={earned ? 'success' : 'neutral'}>{t(`rewards.rarity.${badge.rarity}`)}</Badge>
          <Badge>{t(`rewards.category.${badge.category}`)}</Badge>
        </div>
        {earned && item.earnedAt ? (
          <p className="mt-2 text-xs text-ink-soft">{t('rewards.earned.on', { date: formatDate(item.earnedAt, locale) })}</p>
        ) : (
          item.target > 1 && (
            <div className="mt-2">
              <p className="text-xs text-ink-soft">{t('rewards.progress', { done: item.progress, total: item.target })}</p>
              <ProgressBar className="mt-1" value={(item.progress / item.target) * 100} label={title} />
            </div>
          )
        )}
      </div>
    </li>
  );
}
