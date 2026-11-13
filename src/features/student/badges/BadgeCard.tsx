import { Circle, CircleCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BadgeImage, cn } from '@/components/ui';
import type { BadgeProgress } from '@/types';

/**
 * One badge on the shelf.
 * Earned: bright artwork, its name and one short "you got this because..." sentence.
 * Not yet earned: a soft silhouette with a friendly "How to get it" hint. No dates, no ranks, no shame.
 */
export function BadgeCard({ item }: { item: BadgeProgress }) {
  const { t } = useTranslation();
  const { badge, earned } = item;
  const title = t(badge.titleKey);
  const showPips = !earned && item.target > 1 && item.target <= 7;
  return (
    <li className={cn('flex items-center gap-4 rounded-xl border-2 p-4', earned ? 'border-accent-500 bg-warning-50 shadow-card' : 'border-line bg-surface-muted')}>
      <BadgeImage badgeId={badge.id} rarity={badge.rarity} locked={!earned} size="lg" className={earned ? 'motion-ok:animate-fx-pop-in' : undefined} />
      <div className="min-w-0 flex-1">
        <h3 className={cn('text-lg font-bold', earned ? 'text-ink' : 'text-ink-soft')}>
          {title}
          {!earned && <span className="sr-only"> ({t('rewards.locked.label')})</span>}
        </h3>
        {earned ? (
          <p className="mt-1 text-base text-ink">{t(`kidsplay.badge.${badge.id}.why`)}</p>
        ) : (
          <>
            <p className="mt-1 text-base text-ink-soft">
              <span className="block text-sm font-bold text-brand-700">{t('kidsplay.badges.how')}</span>
              {t(`kidsplay.badge.${badge.id}.how`)}
            </p>
            {showPips && (
              <div role="img" aria-label={t('kidsplay.badges.pips', { done: item.progress, total: item.target })} className="mt-2 flex flex-wrap gap-1">
                {Array.from({ length: item.target }, (_, i) =>
                  i < item.progress ? <CircleCheck key={i} aria-hidden className="h-6 w-6 text-success-700" /> : <Circle key={i} aria-hidden className="h-6 w-6 text-ink-faint" />,
                )}
              </div>
            )}
          </>
        )}
      </div>
    </li>
  );
}
