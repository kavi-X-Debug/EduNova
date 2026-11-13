import { useEffect, useRef, useState } from 'react';
import { Check, HelpCircle, Layers, RotateCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BigActionButton, Banner, Button, Card, MascotMessage, SpeakButton } from '@/components/ui';
import { useLocale } from '@/i18n';
import { formatDate } from '@/lib';
import { announce } from '@/lib/a11y';
import { studentService } from '@/services';
import { useSessionStore } from '@/store';
import type { RevisionItem } from '@/types';
import { DoneScreen, DotProgress } from '../learnKit/KidState';
import { RECALL_QUALITY, type Recall } from './scheduling';

export interface ReviewSessionProps {
  items: RevisionItem[];
  /** Called when the learner leaves the session; the page refetches the queue. */
  onExit: () => void;
}

/** "I remember" and "Not sure yet" map onto the existing recall qualities. */
const CHOICES: { recall: Recall; key: 'kidslearn.revision.remember' | 'kidslearn.revision.notSure' }[] = [
  { recall: 'good', key: 'kidslearn.revision.remember' },
  { recall: 'again', key: 'kidslearn.revision.notSure' },
];

/** One card at a time: look, flip, say "I remember" or "Not sure yet". Never negative. */
export function ReviewSession({ items, onExit }: ReviewSessionProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const userId = useSessionStore((s) => s.user?.id) ?? 'guest';
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [saving, setSaving] = useState<Recall | null>(null);
  const [failedRecall, setFailedRecall] = useState<Recall | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const finished = index >= items.length;
  const item = items[index];

  // Move focus to the new card heading when the card changes (user-initiated, so allowed).
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [index, revealed]);

  useEffect(() => {
    if (failedRecall) errorRef.current?.focus();
  }, [failedRecall]);

  const rate = async (recall: Recall) => {
    setSaving(recall);
    setFailedRecall(null);
    try {
      const updated = await studentService.recordReview(userId, item.id, RECALL_QUALITY[recall]);
      announce(t('student.revision.due', { when: formatDate(updated.dueAt, locale) }));
      setRevealed(false);
      setIndex((i) => i + 1);
    } catch {
      setFailedRecall(recall);
      announce(t('kidslearn.error.body'), 'assertive');
    } finally {
      setSaving(null);
    }
  };

  if (finished) {
    return (
      <DoneScreen title={t('student.revision.done')} body={t('kidslearn.revision.doneBody', { count: items.length })} headingRef={headingRef}>
        <BigActionButton to="/student/path" icon={<Check />}>
          {t('student.path.title')}
        </BigActionButton>
        <Button variant="secondary" size="xl" onClick={onExit}>
          {t('kidslearn.revision.backToCards')}
        </Button>
      </DoneScreen>
    );
  }

  const concept = t(`concept.${item.conceptId}`);
  const left = items.length - index;
  const prompt = t('kidslearn.revision.prompt', { concept });

  return (
    <Card as="section" raised aria-labelledby="review-heading" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DotProgress current={index + 1} total={items.length} label={t('kidslearn.revision.togo', { count: left })} />
        <Button variant="ghost" size="lg" onClick={onExit}>
          {t('kidslearn.revision.stop')}
        </Button>
      </div>

      {/* The card: front asks, back (after flipping) lets the child check and answer. */}
      <div key={`${item.id}-${revealed ? 'back' : 'front'}`} className="flex flex-col gap-5 rounded-xl border-2 border-brand-100 bg-gradient-to-b from-brand-50 to-surface p-5 motion-ok:animate-fx-pop-in md:p-8">
        <div className="flex items-start gap-3">
          <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            {revealed ? <Layers className="h-7 w-7" /> : <HelpCircle className="h-7 w-7" />}
          </span>
          <h2 id="review-heading" ref={headingRef} tabIndex={-1} className="min-w-0 flex-1 text-2xl font-bold text-ink outline-none md:text-3xl">
            {concept}
          </h2>
          <SpeakButton text={prompt} size="md" />
        </div>
        <p className="text-xl text-ink">{revealed ? t('kidslearn.revision.back') : prompt}</p>
        {revealed && (
          <MascotMessage mood="thinking" size="sm" className="md:items-start">
            <span className="text-base font-semibold text-ink-soft">{t('kidslearn.revision.check')}</span>
          </MascotMessage>
        )}
      </div>

      {!revealed ? (
        <Button size="xl" onClick={() => setRevealed(true)} leftIcon={<RotateCw aria-hidden className="h-6 w-6" />} className="w-full md:w-auto md:self-start">
          {t('kidslearn.revision.flip')}
        </Button>
      ) : (
        <div className="flex flex-col gap-4">
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
                {t('kidslearn.error.body')}
              </Banner>
            </div>
          )}
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-xl font-bold text-ink">{t('kidslearn.revision.question')}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {CHOICES.map(({ recall, key }) => (
                <Button
                  key={recall}
                  size="xl"
                  variant={recall === 'good' ? 'primary' : 'secondary'}
                  disabled={saving !== null}
                  loading={saving === recall}
                  loadingLabel={t('a11y.loading')}
                  onClick={() => void rate(recall)}
                  leftIcon={recall === 'good' ? <Check aria-hidden className="h-6 w-6" /> : undefined}
                >
                  {t(key)}
                </Button>
              ))}
            </div>
          </fieldset>
        </div>
      )}
    </Card>
  );
}
