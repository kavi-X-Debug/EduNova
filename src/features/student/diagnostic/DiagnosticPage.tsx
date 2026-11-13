import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Check, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BigActionButton, Button, Card, GrowMeter, HelpBubble, Input, MascotMessage, PageHeader, SpeakButton, cn } from '@/components/ui';
import { announce } from '@/lib/a11y';
import { BAND_ORDER, bandFromLevel, useAsync } from '@/lib';
import { studentService } from '@/services';
import { useSessionStore } from '@/store';
import type { Concept, Mastery, Question, QuizAttempt, ReadinessBand as Band } from '@/types';
import type { TKey } from '@/i18n';
import { DotProgress, KidEmpty, KidError, KidLoading } from '../learnKit/KidState';
import { subjectStyle } from '../learnKit/subjects';

interface ConceptResult {
  conceptId: string;
  band: Band;
}

function buildResults(questions: Question[], attempt: QuizAttempt, mastery: Mastery[]): ConceptResult[] {
  const ids = Array.from(new Set(questions.map((q) => q.conceptId)));
  return ids.map((conceptId) => {
    const m = mastery.find((x) => x.conceptId === conceptId);
    if (m) return { conceptId, band: m.band };
    // Fallback: derive from this attempt's correctness for the concept.
    const own = attempt.answers.filter((a) => questions.find((q) => q.id === a.questionId)?.conceptId === conceptId);
    const level = own.length ? own.filter((a) => a.correct).length / own.length : 0;
    return { conceptId, band: bandFromLevel(level) };
  });
}

/** One overall band for a subject: the average of its topic bands, rounded. A band only, never a number. */
function subjectBand(items: ConceptResult[]): Band {
  const avg = items.reduce((sum, r) => sum + BAND_ORDER.indexOf(r.band), 0) / Math.max(1, items.length);
  return BAND_ORDER[Math.round(avg)] ?? 'building';
}

const ENCOURAGE: TKey[] = ['kidslearn.diag.cheer.1', 'kidslearn.diag.cheer.2', 'kidslearn.diag.cheer.3'];

interface DiagData {
  questions: Question[];
  concepts: Concept[];
}

/** Warm-up quiz: one question per screen, big answers, never negative. */
export default function DiagnosticPage() {
  const { t } = useTranslation();
  const user = useSessionStore((s) => s.user);
  const userId = user?.id ?? '';
  const ref = useRef<HTMLDivElement>(null);
  const qs = useAsync<DiagData>(async () => {
    const [questions, concepts] = await Promise.all([studentService.getDiagnosticQuestions(userId), studentService.listConcepts()]);
    return { questions, concepts };
  }, [userId]);

  const savedRef = useRef<QuizAttempt | null>(null);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [results, setResults] = useState<ConceptResult[] | null>(null);

  const questions = qs.data?.questions ?? [];
  const total = questions.length;
  const q = questions[index];

  // The focused buttons unmount on these transitions: move focus on purpose (the child's own action).
  useEffect(() => {
    if (started && !results) ref.current?.querySelector<HTMLElement>('[data-q-focus]')?.focus({ preventScroll: true });
  }, [started, index, results]);
  useEffect(() => {
    if (results) ref.current?.querySelector<HTMLElement>('[data-result-focus]')?.focus();
  }, [results]);

  const begin = () => {
    setStarted(true);
    announce(t('student.diagnostic.question', { current: 1, total }));
  };

  const setAnswer = (value: string) => q && setAnswers((a) => ({ ...a, [q.id]: value }));

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(false);
    try {
      const attempt: QuizAttempt = {
        id: `diag-${Date.now()}`,
        userId,
        quizId: 'diagnostic',
        startedAt: new Date().toISOString(),
        answers: questions.map((x) => ({ questionId: x.id, response: answers[x.id] ?? '' })),
      };
      if (!savedRef.current) savedRef.current = await studentService.submitQuiz(attempt);
      const saved = savedRef.current;
      const mastery = await studentService.getMastery(userId);
      setResults(buildResults(questions, saved, mastery));
      announce(t('kidslearn.diag.result.title'));
    } catch {
      setSubmitError(true);
      announce(t('student.diagnostic.submitError'), 'assertive');
    } finally {
      setSubmitting(false);
    }
  };

  const goNext = (e?: FormEvent) => {
    e?.preventDefault();
    if (submitting) return;
    if (index < total - 1) {
      const n = index + 1;
      setIndex(n);
      announce(t('student.diagnostic.question', { current: n + 1, total }));
    } else {
      void submit();
    }
  };

  const skip = () => {
    if (q) setAnswers((a) => ({ ...a, [q.id]: '' }));
    goNext();
  };

  const goBack = () => {
    const n = Math.max(0, index - 1);
    setIndex(n);
    announce(t('student.diagnostic.question', { current: n + 1, total }));
  };

  let body;
  if (qs.loading && !qs.data) {
    body = <KidLoading />;
  } else if (qs.error) {
    body = <KidError onRetry={qs.reload} body={t('student.diagnostic.error')} />;
  } else if (total === 0) {
    body = <KidEmpty title={t('kidslearn.diag.empty')} />;
  } else if (results) {
    const subjectOf = (id: string) => qs.data?.concepts.find((c) => c.id === id)?.subject ?? '';
    const subjects = [...new Set(results.map((r) => subjectOf(r.conceptId)))];
    body = (
      <div className="flex flex-col gap-6">
        <MascotMessage mood="cheer" size="lg" speakText={`${t('kidslearn.diag.result.title')} ${t('kidslearn.diag.result.hint')}`}>
          <h2 data-result-focus tabIndex={-1} className="text-2xl font-bold text-ink outline-none">
            {t('kidslearn.diag.result.title')}
          </h2>
          <span className="mt-1 block font-normal text-ink-soft">{t('kidslearn.diag.result.hint')}</span>
        </MascotMessage>

        <ul className="stagger grid gap-4 md:grid-cols-2">
          {subjects.map((s) => {
            const items = results.filter((r) => subjectOf(r.conceptId) === s);
            const { icon: Icon, tile } = subjectStyle(s);
            return (
              <li key={s || 'other'}>
                <Card as="section" aria-labelledby={`diag-s-${s}`} className="flex h-full flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span aria-hidden className={cn('flex h-12 w-12 items-center justify-center rounded-xl', tile)}>
                      <Icon className="h-7 w-7" />
                    </span>
                    <h3 id={`diag-s-${s}`} className="text-xl font-bold text-ink">
                      {s ? t(`subject.${s}` as TKey) : t('kidslearn.diag.result.other')}
                    </h3>
                  </div>
                  <GrowMeter band={subjectBand(items)} size="lg" showHint />
                  <ul className="flex flex-col divide-y divide-line border-t border-line">
                    {items.map((r) => (
                      <li key={r.conceptId} className="flex flex-col gap-2 py-3">
                        <span className="text-lg font-semibold text-ink">{t(`concept.${r.conceptId}`)}</span>
                        <GrowMeter band={r.band} size="sm" />
                        {(r.band === 'building' || r.band === 'developing') && <span className="text-base text-ink-soft">{t('kidslearn.diag.result.niceTry')}</span>}
                      </li>
                    ))}
                  </ul>
                </Card>
              </li>
            );
          })}
        </ul>

        <BigActionButton to="/student/path" icon={<ArrowRight />} fullWidth className="md:w-auto md:self-start">
          {t('kidslearn.diag.result.next')}
        </BigActionButton>
      </div>
    );
  } else if (!started) {
    body = (
      <Card raised className="flex flex-col gap-5">
        <MascotMessage mood="happy" size="lg" speakText={t('student.diagnostic.intro')}>
          {t('student.diagnostic.intro')}
        </MascotMessage>
        <p className="text-lg text-ink-soft">{t('kidslearn.diag.count', { count: total })}</p>
        <BigActionButton icon={<Play />} onClick={begin} fullWidth className="md:w-auto md:self-start">
          {t('student.diagnostic.start')}
        </BigActionButton>
      </Card>
    );
  } else if (q) {
    const label = t('student.diagnostic.question', { current: index + 1, total });
    const value = answers[q.id] ?? '';
    const isLast = index === total - 1;
    const prompt = t(q.promptKey);
    body = (
      <Card as="section" raised aria-busy={submitting} aria-label={label} className="flex flex-col gap-6">
        <DotProgress current={index + 1} total={total} label={label} />
        <MascotMessage mood="happy" size="sm" className="md:items-start">
          <span className="text-base font-semibold text-ink-soft">{t(ENCOURAGE[index % ENCOURAGE.length])}</span>
        </MascotMessage>
        <form onSubmit={goNext} className="flex flex-col gap-5" noValidate>
          {q.type === 'mcq' && q.options ? (
            <fieldset key={q.id} className="flex flex-col gap-4">
              <legend className="mb-3 flex w-full items-start gap-3">
                <span data-q-focus tabIndex={-1} className="min-w-0 flex-1 text-2xl font-bold text-ink outline-none">
                  {prompt}
                </span>
                <SpeakButton text={prompt} size="md" />
              </legend>
              <div className="grid gap-3">
                {q.options.map((o) => {
                  const on = value === o;
                  return (
                    <label
                      key={o}
                      className={cn(
                        'flex min-h-[64px] cursor-pointer items-center gap-3 rounded-xl border-2 px-5 py-3 text-xl font-semibold text-ink transition duration-fast ease-standard focus-within:shadow-focus motion-ok:active:scale-[0.99] motion-reduce:transition-none',
                        on ? 'border-brand-600 bg-brand-50' : 'border-line bg-surface hover:border-line-strong hover:bg-surface-muted',
                      )}
                    >
                      <input type="radio" name={`q-${q.id}`} value={o} checked={on} onChange={() => setAnswer(o)} className="sr-only" />
                      <span aria-hidden className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2', on ? 'border-brand-600 bg-brand-600 text-surface' : 'border-line-strong bg-surface')}>
                        {on && <Check className="h-5 w-5" />}
                      </span>
                      <span className="min-w-0 flex-1">{t(o)}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ) : (
            <div key={q.id} className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <p data-q-focus tabIndex={-1} className="min-w-0 flex-1 text-2xl font-bold text-ink outline-none">
                  {prompt}
                </p>
                <SpeakButton text={prompt} size="md" />
              </div>
              <Input
                label={t('student.diagnostic.answer.label')}
                inputMode={q.type === 'numeric' ? 'decimal' : 'text'}
                autoComplete="off"
                value={value}
                onChange={(e) => setAnswer(e.target.value)}
                className="min-h-[56px] text-xl"
              />
            </div>
          )}
          {submitError && (
            <p role="alert" className="text-lg font-bold text-danger-700">
              {t('student.diagnostic.submitError')}
            </p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="submit" size="xl" loading={submitting} loadingLabel={t('ui.common.loading')} disabled={value.trim() === ''} rightIcon={<ArrowRight aria-hidden className="h-6 w-6" />}>
              {isLast ? t('student.diagnostic.finish') : t('student.diagnostic.next')}
            </Button>
            <div className="flex flex-wrap gap-2">
              {index > 0 && (
                <Button variant="secondary" size="lg" onClick={goBack} disabled={submitting} leftIcon={<ArrowLeft aria-hidden className="h-5 w-5" />}>
                  {t('common.action.back')}
                </Button>
              )}
              <Button variant="ghost" size="lg" onClick={skip} disabled={submitting}>
                {t('student.diagnostic.skip')}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <div ref={ref}>
      <PageHeader title={results ? t('kidslearn.diag.result.heading') : t('student.diagnostic.title')} actions={<HelpBubble textKey="kidslearn.diag.help" align="end" />} />
      {body}
    </div>
  );
}
