import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpenCheck, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AnimatedIllustration, Badge, Banner, Button, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/ui';
import { formatRelative, useAsync } from '@/lib';
import { announce } from '@/lib/a11y';
import { useLocale } from '@/i18n';
import { studentService } from '@/services';
import { useSessionStore } from '@/store';
import type { Locale, RevisionItem } from '@/types';
import { ReviewSession } from './ReviewSession';
import { dayOffset, splitQueue } from './scheduling';

interface ItemRowProps {
  item: RevisionItem;
  now: number;
  locale: Locale;
  nextDays?: number;
}

function ItemRow({ item, now, locale, nextDays }: ItemRowProps) {
  const { t } = useTranslation();
  const offset = dayOffset(item.dueAt, now);
  const concept = t(`concept.${item.conceptId}`, { defaultValue: item.conceptId });
  let status: string;
  if (nextDays !== undefined) status = t('student.revision.nextCount', { count: nextDays });
  else if (offset > 0) status = t('student.revision.due', { when: formatRelative(item.dueAt, locale, now) });
  else if (offset === 0) status = t('student.revision.readyToday');
  else status = t('student.revision.readySince', { when: formatRelative(item.dueAt, locale, now) });

  return (
    <li className="flex flex-col gap-1 rounded-md border border-line bg-surface p-3 md:flex-row md:items-center md:justify-between">
      <span className="font-medium text-ink">{concept}</span>
      <span className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
        <Clock aria-hidden className="h-4 w-4" />
        {status}
        <Badge>{t('student.revision.interval', { count: item.intervalDays })}</Badge>
      </span>
    </li>
  );
}

export default function RevisionPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const userId = useSessionStore((s) => s.user?.id) ?? 'guest';
  const { data, loading, error, reload } = useAsync(() => studentService.getRevisionQueue(userId), [userId]);
  const [now, setNow] = useState(() => Date.now());
  const [session, setSession] = useState<RevisionItem[] | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h1 = rootRef.current?.querySelector('h1');
    if (h1) {
      h1.setAttribute('tabindex', '-1');
      h1.focus({ preventScroll: true });
    }
  }, []);

  const hasData = data !== undefined;
  useEffect(() => {
    if (hasData) announce(t('a11y.loaded'));
  }, [hasData, t]);

  const { ready, upcoming } = useMemo(() => splitQueue(data ?? [], now), [data, now]);
  const pending = ready;

  // Results are already saved by the service; refetch so the queue survives reload and re-sorts.
  const exitSession = () => {
    setSession(null);
    setNow(Date.now());
    reload();
  };

  return (
    <div ref={rootRef}>
      <PageHeader title={t('student.revision.title')} description={t('student.revision.subtitle')} />

      {loading && !hasData && <LoadingState lines={5} />}
      {error && <ErrorState description={t('student.revision.error')} onRetry={reload} />}

      {hasData && (data?.length ?? 0) === 0 && <EmptyState icon={<BookOpenCheck className="h-8 w-8" />} title={t('student.revision.empty')} />}

      {hasData && (data?.length ?? 0) > 0 && session && <ReviewSession items={session} onExit={exitSession} />}

      {hasData && (data?.length ?? 0) > 0 && !session && (
        <div className="flex flex-col gap-6">
          <Card className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-ink">{t('student.revision.decay.title')}</h2>
              <p className="text-sm text-ink-soft">
                {t('student.revision.decay.text')}
              </p>
            </div>
            <AnimatedIllustration
              name="revision-decay"
              alt={t('student.revision.decay.alt')}
              className="w-full max-w-sm"
            />
          </Card>

          <section aria-labelledby="ready-heading" className="flex flex-col gap-3">
            <h2 id="ready-heading" className="text-xl font-semibold text-ink">
              {t('student.dashboard.revisionDue.title')}
            </h2>
            {pending.length > 0 ? (
              <>
                <p className="text-sm text-ink-soft">{t('student.dashboard.revisionDue.count', { count: pending.length })}</p>
                <ul className="flex flex-col gap-2">
                  {pending.map((i) => (
                    <ItemRow key={i.id} item={i} now={now} locale={locale} />
                  ))}
                </ul>
                <div className="sticky bottom-20 z-10 md:static">
                  <Button size="lg" fullWidth onClick={() => setSession(pending)} className="shadow-raised md:w-auto">
                    {t('student.revision.start')}
                  </Button>
                </div>
              </>
            ) : (
              <Banner tone="success">{t('student.revision.done')}</Banner>
            )}
          </section>

          {upcoming.length > 0 && (
            <section aria-labelledby="upcoming-heading" className="flex flex-col gap-3">
              <h2 id="upcoming-heading" className="text-xl font-semibold text-ink">
                {t('student.revision.upcoming')}
              </h2>
              <ul className="flex flex-col gap-2">
                {upcoming.map((i) => (
                  <ItemRow key={i.id} item={i} now={now} locale={locale} />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
