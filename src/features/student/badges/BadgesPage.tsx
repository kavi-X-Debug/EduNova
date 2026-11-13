import { useEffect } from 'react';
import { Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Banner, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/ui';
import { useAsync } from '@/lib';
import { announce } from '@/lib/a11y';
import { rewardsService } from '@/services';
import { useSessionStore } from '@/store';
import { BadgeCard } from './BadgeCard';
import { RewardSummaryPanel } from './RewardSummaryPanel';

export default function BadgesPage() {
  const { t } = useTranslation();
  const userId = useSessionStore((s) => s.user?.id) ?? '';
  const badges = useAsync(() => rewardsService.listBadges(userId), [userId]);
  const summary = useAsync(() => rewardsService.getSummary(userId), [userId]);

  const loaded = badges.data !== undefined;
  useEffect(() => {
    if (loaded) announce(t('a11y.loaded'));
  }, [loaded, t]);

  const earned = (badges.data ?? []).filter((b) => b.earned);
  const locked = (badges.data ?? []).filter((b) => !b.earned);

  return (
    <div>
      <PageHeader title={t('rewards.title')} description={t('rewards.subtitle')} />
      <Banner tone="info" className="mb-6">
        {t('rewards.private')}
      </Banner>

      <div className="flex flex-col gap-6" aria-busy={badges.loading && !loaded}>
        <Card as="section" title={t('rewards.summary.title')}>
          {summary.loading && summary.data === undefined && <LoadingState label={t('a11y.loading')} lines={2} />}
          {summary.error && <ErrorState description={t('rewards.error')} onRetry={summary.reload} retryLabel={t('common.action.retry')} className="p-4" />}
          {summary.data && <RewardSummaryPanel summary={summary.data} />}
        </Card>

        {badges.loading && !loaded && <LoadingState label={t('a11y.loading')} lines={5} />}
        {badges.error && <ErrorState description={t('rewards.error')} onRetry={badges.reload} retryLabel={t('common.action.retry')} />}

        {loaded && !badges.error && (badges.data?.length ?? 0) === 0 && <EmptyState icon={<Award className="h-8 w-8" />} title={t('rewards.empty')} />}

        {loaded && !badges.error && (badges.data?.length ?? 0) > 0 && (
          <>
            <section aria-labelledby="badges-earned">
              <h2 id="badges-earned" className="mb-3 text-lg font-semibold text-ink">
                {t('rewards.earned.title', { count: earned.length })}
              </h2>
              {earned.length === 0 ? (
                <EmptyState icon={<Award className="h-8 w-8" />} title={t('rewards.earned.empty')} />
              ) : (
                <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {earned.map((b) => (
                    <BadgeCard key={b.badge.id} item={b} />
                  ))}
                </ul>
              )}
            </section>
            {locked.length > 0 && (
              <section aria-labelledby="badges-locked">
                <h2 id="badges-locked" className="mb-1 text-lg font-semibold text-ink">
                  {t('rewards.locked.title')}
                </h2>
                <p className="mb-3 text-sm text-ink-soft">{t('rewards.locked.note')}</p>
                <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {locked.map((b) => (
                    <BadgeCard key={b.badge.id} item={b} />
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
