import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, Card, ProgressBar } from '@/components/ui';
import { announce } from '@/lib/a11y';
import type { RevisionItem } from '@/types';
import { nextIntervalDays, RECALLS, type Recall } from './scheduling';

export interface ReviewResult {
  item: RevisionItem;
  recall: Recall;
  nextDays: number;
}

export interface ReviewSessionProps {
  items: RevisionItem[];
  onExit: (results: ReviewResult[]) => void;
}

/** One concept at a time: think, check, rate. Keyboard: Tab to a button, Enter or Space to choose. */
export function ReviewSession({ items, onExit }: ReviewSessionProps) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<ReviewResult[]>([]);
  const [lastNext, setLastNext] = useState<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const finished = index >= items.length;
  const item = items[index];

  // Move focus to the new card heading when the step changes (user-initiated, so allowed).
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [index]);

  useEffect(() => {
    if (finished) announce(t('student.revision.done'));
  }, [finished, t]);

  const rate = (recall: Recall) => {
    const nextDays = nextIntervalDays(item.intervalDays, recall);
    setResults((r) => [...r, { item, recall, nextDays }]);
    setLastNext(nextDays);
    announce(t('student.revision.nextCount', { defaultValue: 'Next review in {{count}} days', count: nextDays }));
    setRevealed(false);
    setIndex((i) => i + 1);
  };

  if (finished) {
    return (
      <Card as="section" aria-labelledby="review-done" className="flex flex-col items-center gap-3 text-center">
        <CheckCircle2 aria-hidden className="h-10 w-10 text-success-700" />
        <h2 id="review-done" ref={headingRef} tabIndex={-1} className="text-xl font-bold text-ink outline-none">
          {t('student.revision.done')}
        </h2>
        {lastNext !== null && (
          <p className="text-sm text-ink-soft">{t('student.revision.nextCount', { defaultValue: 'Next review in {{count}} days', count: lastNext })}</p>
        )}
        <Button size="lg" onClick={() => onExit(results)} className="w-full sm:w-auto">
          {t('student.revision.backToList', { defaultValue: 'Back to revision' })}
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
          {t('student.revision.session.progress', { defaultValue: 'Topic {{current}} of {{total}}', current: index + 1, total: items.length })}
        </p>
        <ProgressBar value={percent} label={t('student.revision.session.progressLabel', { defaultValue: 'Review progress' })} />
      </div>

      <h2 id="review-heading" ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-ink outline-none">
        {concept}
      </h2>
      <p className="text-base text-ink-soft">
        {t('student.revision.session.prompt', {
          defaultValue: 'Take a moment. What do you remember about {{concept}}? Try to explain it in your own words.',
          concept,
        })}
      </p>

      {!revealed ? (
        <Button size="lg" onClick={() => setRevealed(true)} className="w-full">
          {t('student.revision.recall.show')}
        </Button>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="rounded-md border border-line bg-surface-muted p-3 text-sm text-ink-soft">
            {t('student.revision.session.check', { defaultValue: 'Check your notes, or ask the tutor to confirm the key ideas.' })}{' '}
            <Link to="/student/tutor" className="inline-flex min-h-[44px] items-center gap-1 font-semibold text-brand-700 underline outline-none focus-visible:shadow-focus">
              {t('nav.student.tutor')}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </p>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-base font-semibold text-ink">{t('student.revision.recall.question')}</legend>
            <div className="grid grid-cols-2 gap-3">
              {RECALLS.map((r) => (
                <Button key={r} variant={r === 'good' ? 'primary' : 'secondary'} onClick={() => rate(r)}>
                  {t(`student.revision.recall.${r}`)}
                </Button>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      <Button variant="ghost" onClick={() => onExit(results)} className="self-start">
        {t('student.revision.session.end', { defaultValue: 'Finish for now' })}
      </Button>
    </Card>
  );
}
