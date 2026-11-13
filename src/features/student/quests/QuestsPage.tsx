import { useEffect, useMemo, useRef, useState } from 'react';
import { Lock, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BigActionButton, Card, HelpBubble, LoadingState, Mascot, MascotMessage, PageHeader, SpeechBubble } from '@/components/ui';
import { useAsync } from '@/lib';
import { announce } from '@/lib/a11y';
import { studentService } from '@/services';
import { useSessionStore } from '@/store';
import type { Quest } from '@/types';
import { QuestCard } from './QuestCard';
import { useCelebrationPref } from './useCelebrationPref';

interface Celebration {
  questId: string;
  title: string;
  xp: number;
}

/**
 * Adventures: big colourful cards, one clear step and one big button each.
 * The pressed button disappears once its step is done, so focus moves to a stable heading (user-initiated, so not focus theft).
 */
export default function QuestsPage() {
  const { t } = useTranslation();
  const userId = useSessionStore((s) => s.user?.id) ?? 'guest';
  const { data, loading, error, reload } = useAsync(() => studentService.listQuests(userId), [userId]);
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());
  const [saveFailed, setSaveFailed] = useState(false);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const pref = useCelebrationPref();
  const timers = useRef<number[]>([]);

  // Clear pending focus timers on unmount.
  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((id) => window.clearTimeout(id));
  }, []);

  const hasData = data !== undefined;
  useEffect(() => {
    if (hasData) announce(t('a11y.loaded'));
  }, [hasData, t]);

  const moveFocusTo = (id: string) => {
    timers.current.push(window.setTimeout(() => document.getElementById(id)?.focus(), 60));
  };

  const handleComplete = async (quest: Quest, missionId: string) => {
    setSaveFailed(false);
    setPendingIds((s) => new Set(s).add(missionId));
    const finishesQuest = quest.status === 'open' && quest.missions.every((m) => m.done || m.id === missionId);
    try {
      await studentService.completeMission(userId, missionId);
      if (finishesQuest) {
        const title = t(quest.titleKey);
        setCelebration({ questId: quest.id, title, xp: quest.xp });
        announce(`${t('kidsplay.adv.cheer.title', { title })} ${t('kidsplay.adv.cheer.stars', { count: quest.xp })}`);
        moveFocusTo('quest-celebration');
      } else {
        announce(t('kidsplay.adv.saved'));
        moveFocusTo(`quest-${quest.id}`);
      }
      reload();
    } catch {
      setSaveFailed(true);
      announce(t('kidsplay.saveError'), 'assertive');
    } finally {
      setPendingIds((s) => {
        const next = new Set(s);
        next.delete(missionId);
        return next;
      });
    }
  };

  // Adventures still open come first; finished ones sit at the bottom, calm and ticked.
  const quests = useMemo(() => [...(data ?? [])].sort((a, b) => Number(a.status === 'complete') - Number(b.status === 'complete')), [data]);
  const featuredId = quests.find((q) => q.status === 'open')?.id;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        className="mb-0"
        title={t('kids.play.adventures.title')}
        description={t('kids.play.adventures.desc')}
        actions={<HelpBubble textKey="kidsplay.adv.help" align="end" />}
      />

      {loading && !hasData && <LoadingState label={t('a11y.loading')} lines={5} />}
      {error && (
        <div role="alert" className="flex flex-col gap-3">
          <MascotMessage mood="oops" size="md">
            {t('kidsplay.adv.error')}
          </MascotMessage>
          <BigActionButton variant="secondary" onClick={reload} className="self-start">
            {t('kidsplay.ask.again')}
          </BigActionButton>
        </div>
      )}

      {hasData && quests.length === 0 && (
        <MascotMessage mood="sleepy" size="lg" speakText={t('kidsplay.adv.empty')}>
          {t('kidsplay.adv.empty')}
        </MascotMessage>
      )}

      {hasData && quests.length > 0 && (
        <div className="flex flex-col gap-6" aria-busy={loading}>
          {celebration ? (
            <Card as="section" aria-labelledby="quest-celebration" raised className="flex flex-col items-start gap-4 border-success-500 bg-success-50">
              <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:gap-4">
                <Mascot mood="cheer" size="lg" animate={pref.showAnimation} />
                <SpeechBubble speakText={t('kidsplay.adv.cheer.title', { title: celebration.title })} className="w-full md:w-auto md:flex-1">
                  <span id="quest-celebration" tabIndex={-1} className="block text-xl font-bold outline-none focus-visible:shadow-focus">
                    {t('kidsplay.adv.cheer.title', { title: celebration.title })}
                  </span>
                  <span className="mt-1 block font-normal text-ink-soft">{t('kidsplay.adv.cheer.stars', { count: celebration.xp })}</span>
                </SpeechBubble>
              </div>
              {pref.showAnimation && (
                <div aria-hidden className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <Star key={i} className="h-10 w-10 fill-accent-500 text-accent-600 motion-ok:animate-fx-pop-in" style={{ animationDelay: `${i * 120}ms` }} />
                  ))}
                </div>
              )}
              <BigActionButton onClick={() => setCelebration(null)}>{t('kidsplay.adv.cheer.ok')}</BigActionButton>
            </Card>
          ) : (
            <MascotMessage mood="happy" size="md" speakText={t('kidsplay.adv.hello')}>
              {t('kidsplay.adv.hello')}
            </MascotMessage>
          )}

          {saveFailed && (
            <MascotMessage mood="oops" size="sm">
              <span role="alert">{t('kidsplay.saveError')}</span>
            </MascotMessage>
          )}

          <section aria-labelledby="quest-list-heading" className="stagger flex flex-col gap-4">
            <h2 id="quest-list-heading" className="text-xl font-bold text-ink">
              {t('kidsplay.adv.list')}
            </h2>
            {quests.map((q) => (
              <QuestCard key={q.id} quest={q} index={(data ?? []).findIndex((x) => x.id === q.id)} featured={q.id === featuredId} pendingIds={pendingIds} onComplete={handleComplete} />
            ))}
          </section>

          <p className="flex items-center gap-2 text-base text-ink-soft">
            <Lock aria-hidden className="h-5 w-5 shrink-0" />
            {t('kidsplay.private')}
          </p>
        </div>
      )}
    </div>
  );
}
