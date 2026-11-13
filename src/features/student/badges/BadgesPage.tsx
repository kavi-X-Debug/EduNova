import { useEffect } from 'react';
import { Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BigActionButton, Card, HelpBubble, LoadingState, MascotMessage, PageHeader } from '@/components/ui';
import { useAsync } from '@/lib';
import { announce } from '@/lib/a11y';
import { rewardsService } from '@/services';
import { useSessionStore } from '@/store';
import { BadgeCard } from './BadgeCard';
import { LevelMeter } from './LevelMeter';

/** My badges: earned ones first and bright, the rest as soft silhouettes with a "How to get it" hint. Private, never ranked. */
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
  const hello = earned.length > 0 ? t('kidsplay.badges.hello', { count: earned.length }) : t('kidsplay.badges.hello.none');
  const failed = badges.error || summary.error;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader className="mb-0" title={t('kids.badges.title')} description={t('kids.badges.desc')} actions={<HelpBubble textKey="kidsplay.badges.help" align="end" />} />

      {failed && (
        <div role="alert" className="flex flex-col gap-3">
          <MascotMessage mood="oops" size="md">
            {t('kidsplay.badges.error')}
          </MascotMessage>
          <BigActionButton
            variant="secondary"
            onClick={() => {
              badges.reload();
              summary.reload();
            }}
            className="self-start"
          >
            {t('kidsplay.ask.again')}
          </BigActionButton>
        </div>
      )}

      {badges.loading && !loaded && !failed && <LoadingState label={t('a11y.loading')} lines={5} />}

      {loaded && !badges.error && (badges.data?.length ?? 0) === 0 && (
        <MascotMessage mood="sleepy" size="lg" speakText={t('kidsplay.badges.empty')}>
          {t('kidsplay.badges.empty')}
        </MascotMessage>
      )}

      {loaded && !badges.error && (badges.data?.length ?? 0) > 0 && (
        <>
          <MascotMessage mood={earned.length > 0 ? 'cheer' : 'happy'} size="md" speakText={hello}>
            {hello}
          </MascotMessage>

          {summary.data && (
            <Card as="section" raised aria-label={t('kidsplay.level.title', { level: summary.data.level })}>
              <LevelMeter summary={summary.data} />
            </Card>
          )}

          {earned.length > 0 && (
            <section aria-labelledby="badges-earned">
              <h2 id="badges-earned" className="mb-3 text-xl font-bold text-ink">
                {t('kidsplay.badges.earned.title')}
              </h2>
              <ul className="stagger grid gap-4 md:grid-cols-2">
                {earned.map((b) => (
                  <BadgeCard key={b.badge.id} item={b} />
                ))}
              </ul>
            </section>
          )}

          {locked.length > 0 && (
            <section aria-labelledby="badges-locked">
              <h2 id="badges-locked" className="text-xl font-bold text-ink">
                {t('kidsplay.badges.locked.title')}
              </h2>
              <p className="mb-3 mt-1 text-lg text-ink-soft">{t('kidsplay.badges.locked.note')}</p>
              <ul className="grid gap-4 md:grid-cols-2">
                {locked.map((b) => (
                  <BadgeCard key={b.badge.id} item={b} />
                ))}
              </ul>
            </section>
          )}

          <p className="flex items-center gap-2 text-base text-ink-soft">
            <Lock aria-hidden className="h-5 w-5 shrink-0" />
            {t('kidsplay.private')}
          </p>
        </>
      )}
    </div>
  );
}
