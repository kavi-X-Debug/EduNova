import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Layers, Play, Route as RouteIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BigActionButton, Card, HelpBubble, MascotMessage, PageHeader } from '@/components/ui';
import { formatRelative, useAsync } from '@/lib';
import { announce } from '@/lib/a11y';
import { useLocale } from '@/i18n';
import { studentService } from '@/services';
import { useSessionStore } from '@/store';
import type { RevisionItem } from '@/types';
import { KidEmpty, KidError, KidLoading } from '../learnKit/KidState';
import { ReviewSession } from './ReviewSession';
import { dayOffset, splitQueue } from './scheduling';

/** Pictures for a count: up to 10 little cards, so "3 cards to go" is seen as well as read. */
function CardPile({ count }: { count: number }) {
  const shown = Math.min(count, 10);
  return (
    <div aria-hidden className="flex flex-wrap items-center gap-2">
      {Array.from({ length: shown }, (_, i) => (
        <span key={i} className="flex h-12 w-9 items-center justify-center rounded-md border-2 border-brand-600 bg-brand-50 text-brand-700 shadow-card motion-ok:animate-fx-pop-in" style={{ animationDelay: `${i * 40}ms` }}>
          <Layers className="h-5 w-5" />
        </span>
      ))}
      {count > shown && <span className="text-lg font-bold text-ink-soft">+{count - shown}</span>}
    </div>
  );
}

/** Remember it again: how many cards are waiting, one big Start. */
export default function RevisionPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const userId = useSessionStore((s) => s.user?.id) ?? 'guest';
  const { data, loading, error, reload } = useAsync(() => studentService.getRevisionQueue(userId), [userId]);
  const [now, setNow] = useState(() => Date.now());
  const [session, setSession] = useState<RevisionItem[] | null>(null);
  const hasData = data !== undefined;
  useEffect(() => {
    if (hasData) announce(t('a11y.loaded'));
  }, [hasData, t]);

  const { ready, upcoming } = useMemo(() => splitQueue(data ?? [], now), [data, now]);

  // Results are already saved by the service; refetch so the queue survives reload and re-sorts.
  const exitSession = () => {
    setSession(null);
    setNow(Date.now());
    reload();
  };

  let body;
  if (loading && !hasData) body = <KidLoading />;
  else if (error) body = <KidError onRetry={reload} body={t('student.revision.error')} />;
  else if (session) body = <ReviewSession items={session} onExit={exitSession} />;
  else if (hasData && data.length === 0) {
    body = (
      <KidEmpty
        mood="thinking"
        title={t('kidslearn.revision.nothingYet.title')}
        body={t('student.revision.empty')}
        action={
          <BigActionButton to="/student/path" icon={<RouteIcon />} className="self-start">
            {t('student.path.title')}
          </BigActionButton>
        }
      />
    );
  } else if (hasData && ready.length === 0) {
    body = (
      <Card raised className="flex flex-col gap-5 bg-gradient-to-b from-success-50 to-surface">
        <MascotMessage mood="cheer" size="lg" speakText={t('student.revision.done')}>
          <h2 className="text-2xl font-bold text-ink">{t('student.revision.done')}</h2>
          <span className="mt-1 block font-normal text-ink-soft">{t('kidslearn.revision.comeBack')}</span>
        </MascotMessage>
        <BigActionButton to="/student/path" icon={<RouteIcon />} className="self-start">
          {t('student.path.title')}
        </BigActionButton>
        {upcoming.length > 0 && <Upcoming items={upcoming} now={now} locale={locale} />}
      </Card>
    );
  } else if (hasData) {
    body = (
      <div className="flex flex-col gap-6">
        <Card as="section" raised aria-labelledby="rev-ready" className="flex flex-col gap-5 border-brand-100 bg-gradient-to-b from-brand-50 to-surface">
          <MascotMessage mood="happy" size="lg" speakText={t('kidslearn.revision.togo', { count: ready.length })}>
            <h2 id="rev-ready" className="text-2xl font-bold text-ink">
              {t('kidslearn.revision.togo', { count: ready.length })}
            </h2>
            <span className="mt-1 block font-normal text-ink-soft">{t('kidslearn.revision.intro')}</span>
          </MascotMessage>
          <CardPile count={ready.length} />
          <BigActionButton icon={<Play />} fullWidth onClick={() => setSession(ready)} className="md:w-auto md:self-start">
            {t('kidslearn.revision.start')}
          </BigActionButton>
        </Card>
        {upcoming.length > 0 && (
          <Card as="section">
            <Upcoming items={upcoming} now={now} locale={locale} />
          </Card>
        )}
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={t('student.revision.title')} description={t('student.revision.subtitle')} actions={<HelpBubble textKey="kidslearn.revision.help" align="end" />} />
      {body}
    </div>
  );
}

/** Small "Coming up" list, tucked away until the child opens it. */
function Upcoming({ items, now, locale }: { items: RevisionItem[]; now: number; locale: Parameters<typeof formatRelative>[1] }) {
  const { t } = useTranslation();
  return (
    <details className="group">
      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center rounded-md px-2 text-lg font-semibold text-brand-700 outline-none focus-visible:shadow-focus [&::-webkit-details-marker]:hidden">
        {t('student.revision.upcoming')}
        <ChevronDown aria-hidden className="ms-2 h-5 w-5 transition-transform duration-base group-open:rotate-180 motion-reduce:transition-none" />
      </summary>
      <ul className="mt-2 flex flex-col gap-2">
        {items.map((i) => (
          <li key={i.id} className="flex flex-wrap justify-between gap-2 rounded-lg border border-line bg-surface p-3 text-lg">
            <span className="font-semibold text-ink">{t(`concept.${i.conceptId}`)}</span>
            <span className="text-ink-soft">{dayOffset(i.dueAt, now) > 0 ? formatRelative(i.dueAt, locale, now) : t('student.revision.readyToday')}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}
