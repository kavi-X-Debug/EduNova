import { useEffect, useRef, useState } from 'react';
import { Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AnimatedIllustration, Banner, Button, Card, Checkbox, EmptyState, ErrorState, LoadingState, PageHeader, Stat } from '@/components/ui';
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

/** The pressed button disappears once its mission is done, so hand focus to a stable heading (user-initiated, so not focus theft). */
function moveFocusTo(id: string) {
  window.setTimeout(() => document.getElementById(id)?.focus(), 60);
}

export default function QuestsPage() {
  const { t } = useTranslation();
  const userId = useSessionStore((s) => s.user?.id) ?? 'guest';
  const { data, loading, error, reload } = useAsync(() => studentService.listQuests(userId), [userId]);
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());
  const [saveFailed, setSaveFailed] = useState(false);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const pref = useCelebrationPref();
  const rootRef = useRef<HTMLDivElement>(null);

  // Route change: focus the page heading (no focus theft on later async updates).
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

  const handleComplete = async (quest: Quest, missionId: string) => {
    setSaveFailed(false);
    setPendingIds((s) => new Set(s).add(missionId));
    const finishesQuest = quest.status === 'open' && quest.missions.every((m) => m.done || m.id === missionId);
    try {
      await studentService.completeMission(userId, missionId);
      if (finishesQuest) {
        const title = t(quest.titleKey);
        const summary = t('student.quests.celebration.summary', { title, xp: quest.xp });
        setCelebration({ questId: quest.id, title, xp: quest.xp });
        announce(`${t('student.quests.complete')} ${summary}`);
        moveFocusTo('quest-celebration');
      } else {
        announce(t('student.quests.mission.savedAnnounce'));
        moveFocusTo(`quest-${quest.id}`);
      }
      reload();
    } catch {
      setSaveFailed(true);
      announce(t('student.quests.mission.error'), 'assertive');
    } finally {
      setPendingIds((s) => {
        const next = new Set(s);
        next.delete(missionId);
        return next;
      });
    }
  };

  const quests = data ?? [];
  const completed = quests.filter((q) => q.status === 'complete');
  const totalXp = completed.reduce((sum, q) => sum + q.xp, 0);

  return (
    <div ref={rootRef}>
      <PageHeader title={t('student.quests.title')} description={t('student.quests.subtitle')} />

      <Banner tone="info" className="mb-6">
        {t('student.quests.private')}
      </Banner>

      {loading && !hasData && <LoadingState lines={5} />}
      {error && <ErrorState description={t('student.quests.error')} onRetry={reload} />}

      {hasData && quests.length === 0 && <EmptyState icon={<Trophy className="h-8 w-8" />} title={t('student.quests.empty')} />}

      {hasData && quests.length > 0 && (
        <div className="flex flex-col gap-6" aria-busy={loading}>
          {celebration && (
            <Card as="section" aria-labelledby="quest-celebration" raised className="flex flex-col items-center gap-3 text-center">
              {pref.showAnimation && (
                <AnimatedIllustration
                  name="mastery-celebration"
                  alt={t('student.quests.celebration.alt')}
                  className="w-40 md:w-56"
                />
              )}
              <h2 id="quest-celebration" tabIndex={-1} className="text-xl font-bold text-ink outline-none focus-visible:shadow-focus">
                {t('student.quests.complete')}
              </h2>
              <p className="text-sm text-ink-soft">
                {t('student.quests.celebration.summary', { title: celebration.title, xp: celebration.xp })}
              </p>
              <Button variant="secondary" onClick={() => setCelebration(null)}>
                {t('a11y.close')}
              </Button>
            </Card>
          )}

          {saveFailed && <Banner tone="danger">{t('student.quests.mission.error')}</Banner>}

          <section aria-label={t('student.quests.map.title')} className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <Card className="flex items-center justify-center">
              <AnimatedIllustration
                name="quest-map"
                alt={t('student.quests.map.alt')}
                className="w-full max-w-md"
              />
            </Card>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
              <Stat
                label={t('student.quests.summary.label')}
                value={t('student.quests.summary.value', { done: completed.length, total: quests.length })}
              />
              <Stat label={t('student.quests.summary.xp')} value={t('student.quests.xp', { xp: totalXp })} />
            </div>
          </section>

          <section aria-labelledby="quest-list-heading" className="flex flex-col gap-4">
            <h2 id="quest-list-heading" className="text-xl font-semibold text-ink">
              {t('student.quests.list.title')}
            </h2>
            {quests.map((q) => (
              <QuestCard key={q.id} quest={q} pendingIds={pendingIds} onComplete={handleComplete} />
            ))}
          </section>

          <Card>
            <Checkbox
              checked={pref.enabled}
              onChange={(e) => pref.setEnabled(e.target.checked)}
              label={t('student.quests.celebrate.toggle')}
              hint={
                pref.reduced
                  ? t('student.quests.celebrate.reducedHint')
                  : t('student.quests.celebrate.hint')
              }
            />
          </Card>
        </div>
      )}
    </div>
  );
}
