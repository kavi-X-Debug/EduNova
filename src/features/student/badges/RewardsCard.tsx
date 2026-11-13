import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BadgeImage, Card, ErrorState, LoadingState, cn } from '@/components/ui';
import { useAsync } from '@/lib';
import { rewardsService } from '@/services';
import { useSessionStore } from '@/store';
import { RewardSummaryPanel } from './RewardSummaryPanel';

/** Student-only card: level, XP, streak and recent (or all) earned badges. Used on the dashboard and the profile. */
export function RewardsCard({ limit = 3, title, className }: { limit?: number; title?: string; className?: string }) {
  const { t } = useTranslation();
  const userId = useSessionStore((s) => s.user?.id) ?? '';
  const summary = useAsync(() => rewardsService.getSummary(userId), [userId]);
  const recent = useAsync(() => rewardsService.listRecentBadges(userId, limit), [userId, limit]);
  const heading = title ?? t('rewards.card.title');

  let body;
  if ((summary.loading && !summary.data) || (recent.loading && !recent.data)) body = <LoadingState label={t('a11y.loading')} lines={3} />;
  else if (summary.error || recent.error || !summary.data) {
    body = <ErrorState description={t('rewards.error')} onRetry={() => { summary.reload(); recent.reload(); }} retryLabel={t('common.action.retry')} className="p-4" />;
  } else {
    const badges = recent.data ?? [];
    body = (
      <div className="flex flex-col gap-5">
        <RewardSummaryPanel summary={summary.data} />
        <div>
          <h4 className="mb-2 text-sm font-semibold text-ink">{t('rewards.recent.title')}</h4>
          {badges.length === 0 ? (
            <p className="text-sm text-ink-soft">{t('rewards.earned.empty')}</p>
          ) : (
            <ul className="flex flex-wrap gap-4">
              {badges.map(({ badge }) => (
                <li key={badge.id} className="flex w-24 flex-col items-center gap-1 text-center">
                  <BadgeImage badgeId={badge.id} rarity={badge.rarity} size="md" />
                  <span className="text-xs font-semibold text-ink">{t(badge.titleKey)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Link
          to="/student/badges"
          className={cn('inline-flex min-h-[44px] items-center self-start rounded-md border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-ink outline-none hover:bg-surface-sunken focus-visible:shadow-focus')}
        >
          {t('rewards.viewAll')}
        </Link>
      </div>
    );
  }
  return (
    <Card as="section" aria-label={heading} title={heading} className={className}>
      {body}
    </Card>
  );
}
