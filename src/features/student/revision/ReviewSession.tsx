import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Banner, Button, Card, ProgressBar } from '@/components/ui';
import { useLocale } from '@/i18n';
import { formatDate } from '@/lib';
import { announce } from '@/lib/a11y';
import { studentService } from '@/services';
import { useSessionStore } from '@/store';
import type { RevisionItem } from '@/types';
import { RECALLS, RECALL_QUALITY, type Recall } from './scheduling';

export interface ReviewSessionProps {
  items: RevisionItem[];
  /** Called when the learner leaves the session; the page refetches the queue. */
  onExit: () => void;
}

/** One concept at a time: think, check, rate. Keyboard: Tab to a button, Enter or Space to choose. */
export function ReviewSession({ items, onExit }: ReviewSessionProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const userId = useSessionStore((s) => s.user?.id) ?? 'guest';
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [saved, setSaved] = useState<RevisionItem[]>([]);
  const [saving, setSaving] = useState<Recall | null>(null);
  const [failedRecall, setFailedRecall] = useState<Recall | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const finished = index >= items.length;
  const item = items[index];

  // Move focus to the new card heading when the step changes (user-initiated, so allowed).
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [index]);

  useEffect(() => {
    if (failedRecall) errorRef.current?.focus();
  }, [failedRecall]);

  useEffect(() => {
    if (finished) announce(t('student.revision.done'));
  }, [finished, t]);

  const rate = async (recall: Recall) => {
    setSaving(recall);
    setFailedRecall(null);
    try {
      const updated = await studentService.recordReview(userId, item.id, RECALL_QUALITY[recall]);
      setSaved((r) => [...r, updated]);
      announce(
        `${t('student.revision.nextCount', { count: updated.intervalDays })}. ${t('student.revision.due', { when: formatDate(updated.dueAt, locale) })}`,
      );
      setRevealed(false);
      setIndex((i) => i + 1);
    } catch {
      setFailedRecall(recall);
      announce(t('student.quests.mission.error'), 'assertive');
    } finally {
      setSaving(null);
    }
  };

  if (finished) {
    return (
      <Card as="section" aria-labelledby="review-done" className="flex flex-col items-center gap-3 text-center">
        <CheckCircle2 aria-hidden className="h-10 w-10 text-success-700" />
        <h2 id="review-done" ref={headingRef} tabIndex={-1} className="text-xl font-bold text-ink outline-none">
          {t('student.revision.done')}
        </h2>
        <ul className="w-full text-left text-sm text-ink-soft">
          {saved.map((s) => (
            <li key={s.id} className="flex flex-wrap justify-between gap-2 border-b border-line py-2">
              <span className="font-medium text-ink">{t(`concept.${s.conceptId}`, { defaultValue: s.conceptId })}</span>
              <span>{t('student.revision.due', { when: formatDate(s.dueAt, locale) })}</span>
            </li>
          ))}
        </ul>
        <Button size="lg" onClick={onExit} className="w-full sm:w-auto">
          {t('student.revision.backToList')}
        </Button>
      </Card>
    );
  }

  const concept = t(`concept.${item.conceptId}`, { defaultValue: item.conceptId });
  const percent = (index / items.length) * 100;

  return (
    <Card as="section" aria-labelledby="review-heading" className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-ink-soft">
          {t('student.revision.session.progress', { current: index + 1, total: items.length })}
        </p>
        <ProgressBar value={percent} label={t('student.revision.session.progressLabel')} />
      </div>

      <h2 id="review-heading" ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-ink outline-none">
        {concept}
      </h2>
      <p className="text-base text-ink-soft">
        {t('student.revision.session.prompt', { concept })}
      </p>

      {!revealed ? (
        <Button size="lg" onClick={() => setRevealed(true)} className="w-full">
          {t('student.revision.recall.show')}
        </Button>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="rounded-md border border-line bg-surface-muted p-3 text-sm text-ink-soft">
            {t('student.revision.session.check')}{' '}
            <Link to="/student/tutor" className="inline-flex min-h-[44px] items-center gap-1 font-semibold text-brand-700 underline outline-none focus-visible:shadow-focus">
              {t('nav.student.tutor')}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </p>
          {failedRecall && (
            <div ref={errorRef} tabIndex={-1} className="outline-none">
              <Banner
                tone="danger"
                actions={
                  <Button variant="secondary" onClick={() => void rate(failedRecall)}>
                    {t('ui.error.retry')}
                  </Button>
                }
              >
                {t('student.quests.mission.error')}
              </Banner>
            </div>
          )}
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-base font-semibold text-ink">{t('student.revision.recall.question')}</legend>
            <div className="grid grid-cols-2 gap-3">
              {RECALLS.map((r) => (
                <Button key={r} variant={r === 'good' ? 'primary' : 'secondary'} disabled={saving !== null} loading={saving === r} loadingLabel={t('a11y.loading')} onClick={() => void rate(r)}>
                  {t(`student.revision.recall.${r}`)}
                </Button>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      <Button variant="ghost" onClick={onExit} className="self-start">
        {t('student.revision.session.end')}
      </Button>
    </Card>
  );
}
