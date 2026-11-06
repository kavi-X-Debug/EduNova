import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card, EmptyState, ErrorState, Input, LoadingState, PageHeader, ProgressBar, ReadinessBand, RadioGroup } from '@/components/ui';
import { announce } from '@/lib/a11y';
import { bandFromLevel, useAsync } from '@/lib';
import { studentService } from '@/services';
import { useSessionStore } from '@/store';
import type { Mastery, Question, QuizAttempt, ReadinessBand as Band } from '@/types';
import { usePageFocus } from '../onboarding/usePageFocus';

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

export default function DiagnosticPage() {
  const { t } = useTranslation();
  const user = useSessionStore((s) => s.user);
  const userId = user?.id ?? '';
  const ref = usePageFocus<HTMLDivElement>();
  const qs = useAsync(() => studentService.getDiagnosticQuestions(userId), [userId]);

  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [results, setResults] = useState<ConceptResult[] | null>(null);

  const questions = qs.data ?? [];
  const total = questions.length;
  const q = questions[index];

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
      const saved = await studentService.submitQuiz(attempt);
      const mastery = await studentService.getMastery(userId);
      setResults(buildResults(questions, saved, mastery));
      announce(t('student.diagnostic.result.title'));
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
  if (qs.loading) {
    body = <LoadingState label={t('a11y.loading')} lines={5} />;
  } else if (qs.error) {
    body = <ErrorState description={t('student.diagnostic.error')} onRetry={qs.reload} retryLabel={t('common.action.retry')} />;
  } else if (total === 0) {
    body = <EmptyState title={t('common.status.empty')} />;
  } else if (results) {
    const strong = results.filter((r) => r.band === 'secure' || r.band === 'strong');
    const focus = results.filter((r) => r.band === 'building' || r.band === 'developing');
    const group = (title: string, items: ConceptResult[]) =>
      items.length > 0 && (
        <section aria-labelledby={`grp-${title}`} className="mt-6">
          <h2 id={`grp-${title}`} className="mb-3 text-lg font-semibold text-ink">{title}</h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {items.map((r) => (
              <li key={r.conceptId} className="rounded-lg border border-line bg-surface p-4">
                <p className="font-semibold text-ink">{t(`concept.${r.conceptId}`)}</p>
                <ReadinessBand band={r.band} className="mt-2" />
                <p className="mt-2 text-sm text-ink-soft">{t(`student.exams.band.${r.band}.desc`)}</p>
              </li>
            ))}
          </ul>
        </section>
      );
    body = (
      <>
        <p className="text-base text-ink-soft">{t('student.diagnostic.result.hint')}</p>
        <p className="mt-2 text-sm text-ink-soft">{t('student.exams.readiness.note')}</p>
        {group(t('student.diagnostic.result.strengths'), strong)}
        {group(t('student.diagnostic.result.focus'), focus)}
        <div className="mt-6">
          <Link
            to="/student/path"
            className="inline-flex min-h-[44px] items-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-surface outline-none hover:bg-brand-700 focus-visible:shadow-focus"
          >
            {t('student.diagnostic.result.toPath')}
          </Link>
        </div>
      </>
    );
  } else if (!started) {
    body = (
      <Card>
        <p className="text-base text-ink">{t('student.diagnostic.intro')}</p>
        <Button className="mt-4" size="lg" onClick={begin}>
          {t('student.diagnostic.start')}
        </Button>
      </Card>
    );
  } else if (q) {
    const label = t('student.diagnostic.question', { current: index + 1, total });
    const value = answers[q.id] ?? '';
    const isLast = index === total - 1;
    body = (
      <Card aria-busy={submitting}>
        <p className="text-sm font-semibold text-ink-soft">{label}</p>
        <ProgressBar className="mt-2" value={((index + 1) / total) * 100} label={label} />
        <form onSubmit={goNext} className="mt-6 flex flex-col gap-4" noValidate>
          {q.type === 'mcq' && q.options ? (
            <RadioGroup
              key={q.id}
              name={`q-${q.id}`}
              legend={<span className="text-lg">{t(q.promptKey)}</span>}
              value={value}
              onChange={setAnswer}
              options={q.options.map((o) => ({ value: o, label: t(o) }))}
            />
          ) : (
            <Input
              key={q.id}
              label={<span className="text-lg">{t(q.promptKey)}</span>}
              hint={t('student.diagnostic.answer.label')}
              inputMode={q.type === 'numeric' ? 'decimal' : 'text'}
              autoComplete="off"
              value={value}
              onChange={(e) => setAnswer(e.target.value)}
            />
          )}
          {submitError && (
            <p role="alert" className="text-sm font-semibold text-danger-700">{t('student.diagnostic.submitError')}</p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {index > 0 && (
                <Button variant="secondary" onClick={goBack} disabled={submitting}>
                  {t('common.action.back')}
                </Button>
              )}
              <Button variant="ghost" onClick={skip} disabled={submitting}>
                {t('student.diagnostic.skip')}
              </Button>
            </div>
            <Button type="submit" loading={submitting} loadingLabel={t('ui.common.loading')} disabled={value.trim() === ''}>
              {isLast ? t('student.diagnostic.finish') : t('student.diagnostic.next')}
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <div ref={ref}>
      <PageHeader title={results ? t('student.diagnostic.result.title') : t('student.diagnostic.title')} />
      {body}
    </div>
  );
}
