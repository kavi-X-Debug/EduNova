import { useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, Circle, ClipboardCheck, Lock, PenLine, PlayCircle, RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  AnimatedIllustration,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  ProgressBar,
  ReadinessBand,
  Select,
  Tabs,
  cn,
  type BadgeTone,
} from '@/components/ui';
import { useT, type TKey } from '@/i18n';
import { localiseRef, unitLabel, useAsync } from '@/lib';
import { announce } from '@/lib/a11y';
import { i18n } from '@/i18n';
import type { Locale } from '@/types';
import { studentService } from '@/services';
import { useSessionStore } from '@/store';
import type { Concept, LearningPathStep, Mastery } from '@/types';

type Status = LearningPathStep['status'];
type Kind = LearningPathStep['kind'];

const KIND_ICON: Record<Kind, ReactNode> = {
  lesson: <BookOpen aria-hidden className="h-5 w-5" />,
  practice: <PenLine aria-hidden className="h-5 w-5" />,
  quiz: <ClipboardCheck aria-hidden className="h-5 w-5" />,
  revision: <RotateCcw aria-hidden className="h-5 w-5" />,
};

const STATUS_ICON: Record<Status, ReactNode> = {
  locked: <Lock aria-hidden className="h-4 w-4" />,
  next: <Circle aria-hidden className="h-4 w-4" />,
  in_progress: <PlayCircle aria-hidden className="h-4 w-4" />,
  done: <CheckCircle2 aria-hidden className="h-4 w-4" />,
};

const STATUS_TONE: Record<Status, BadgeTone> = {
  locked: 'neutral',
  next: 'brand',
  in_progress: 'warning',
  done: 'success',
};

const TERMS = ['1', '2', '3'];

interface PathData {
  steps: LearningPathStep[];
  concepts: Concept[];
  mastery: Mastery[];
}

const isCurrent = (s: LearningPathStep) => s.status === 'in_progress' || s.status === 'next';

export default function PathPage() {
  const t = useT();
  const user = useSessionStore((s) => s.user);
  const userId = user?.id ?? '';
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completeError, setCompleteError] = useState(false);
  const [subjectChoice, setSubjectChoice] = useState<string | null>(null);
  /** Term filter per subject ('' = all terms). Unset means "the term of the current step". */
  const [termBySubject, setTermBySubject] = useState<Record<string, string>>({});

  const { data, loading, error, reload } = useAsync<PathData>(async () => {
    const [steps, concepts, mastery] = await Promise.all([
      studentService.getLearningPath(userId),
      studentService.listConcepts(),
      studentService.getMastery(userId),
    ]);
    return { steps, concepts, mastery };
  }, [userId]);

  /** Marks a step done through the service (which also records XP/badges); announces the result. */
  const completeStep = async (stepId: string) => {
    setCompletingId(stepId);
    setCompleteError(false);
    try {
      await studentService.completePathStep(userId, stepId);
      announce(t('student.path.complete.done'));
      reload();
    } catch {
      setCompleteError(true);
      announce(t('student.path.complete.error'), 'assertive');
    } finally {
      setCompletingId(null);
    }
  };

  const conceptById = useMemo(() => new Map((data?.concepts ?? []).map((c) => [c.id, c])), [data]);
  const masteryById = useMemo(() => new Map((data?.mastery ?? []).map((m) => [m.conceptId, m])), [data]);

  const conceptTitle = (id: string): string => {
    const c = conceptById.get(id);
    return c ? t(c.titleKey as TKey) : id;
  };

  const header = <PageHeader title={t('student.path.title')} description={t('student.path.subtitle')} />;

  if (loading && !data) {
    return (
      <div aria-busy="true">
        {header}
        <LoadingState lines={5} />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div>
        {header}
        <ErrorState description={t('student.path.error')} onRetry={reload} />
      </div>
    );
  }
  if (data.steps.length === 0) {
    return (
      <div>
        {header}
        <EmptyState title={t('student.path.empty')} />
      </div>
    );
  }

  const { steps } = data;
  const subjectOf = (s: LearningPathStep) => conceptById.get(s.conceptId)?.subject ?? '';
  const doneCount = steps.filter((s) => s.status === 'done').length;
  const current = steps.find((s) => s.status === 'in_progress') ?? steps.find((s) => s.status === 'next');

  // Subjects in the order the service lists them, keeping only those with steps.
  const subjects = [...new Set([...data.concepts.map((c) => c.subject), ...steps.map(subjectOf)])].filter((s) =>
    steps.some((x) => subjectOf(x) === s),
  );
  const subject = subjectChoice && subjects.includes(subjectChoice) ? subjectChoice : (current ? subjectOf(current) : subjects[0]);
  const subjectSteps = steps.filter((s) => subjectOf(s) === subject);
  const subjectCurrent = subjectSteps.find(isCurrent);
  const hasTerms = subjectSteps.some((s) => conceptById.get(s.conceptId)?.term);
  const defaultTerm = subjectCurrent ? String(conceptById.get(subjectCurrent.conceptId)?.term ?? '') : '';
  const term = hasTerms ? (termBySubject[subject] ?? defaultTerm) : '';
  const visible = subjectSteps.filter((s) => !term || String(conceptById.get(s.conceptId)?.term ?? '') === term);

  const selected =
    visible.find((s) => s.id === selectedId) ?? visible.find((s) => s.id === subjectCurrent?.id) ?? visible[0] ?? subjectSteps[0];
  const selectedConcept = conceptById.get(selected.conceptId);
  const selectedMastery = masteryById.get(selected.conceptId);
  const prereqs = (selectedConcept?.prerequisiteIds ?? []).map((id) => conceptById.get(id)).filter((c): c is Concept => Boolean(c));

  const kindLabel = (k: Kind) => t(`student.path.step.${k}`);

  /** Small secondary line: term, textbook unit and page reference (source labels are not translated). */
  const conceptMeta = (c: Concept | undefined) =>
    c ? [c.term ? t('student.path.term.n', { term: c.term }) : null, c.unit ? unitLabel(c.unit, t as never) : null, c.textbookRef ? t('student.path.textbookRef', { ref: localiseRef(c.textbookRef, i18n.language as Locale) }) : null].filter(Boolean) : [];

  // Group visible steps by concept (they arrive in teaching order).
  const groups: { concept: string; steps: LearningPathStep[] }[] = [];
  for (const s of visible) {
    const last = groups[groups.length - 1];
    if (last && last.concept === s.conceptId) last.steps.push(s);
    else groups.push({ concept: s.conceptId, steps: [s] });
  }

  const subjectDone = subjectSteps.filter((s) => s.status === 'done').length;

  const panel = (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <section aria-labelledby="path-steps-heading">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="path-steps-heading" className="text-lg font-semibold text-ink">
              {t('student.path.steps.title')}
            </h2>
            <p className="text-sm text-ink-soft">{t('student.path.progress.summary', { done: subjectDone, total: subjectSteps.length })}</p>
          </div>
          {hasTerms && (
            <Select
              label={t('student.path.term.label')}
              value={term}
              onChange={(e) => {
                setTermBySubject((m) => ({ ...m, [subject]: e.target.value }));
                setSelectedId(null);
              }}
              options={[{ value: '', label: t('student.path.term.all') }, ...TERMS.map((n) => ({ value: n, label: t('student.path.term.n', { term: n }) }))]}
              wrapperClassName="w-44"
            />
          )}
        </div>

        {groups.length === 0 ? (
          <EmptyState title={t('student.path.term.empty')} />
        ) : (
          <ol className="stagger flex flex-col gap-4">
            {groups.map((g) => {
              const c = conceptById.get(g.concept);
              const headingId = `path-concept-${g.concept}`;
              const meta = conceptMeta(c);
              return (
                <li key={g.concept} className="rounded-lg border border-line bg-surface p-3 shadow-card">
                  <h3 id={headingId} className="text-base font-semibold text-ink">
                    {conceptTitle(g.concept)}
                  </h3>
                  {meta.length > 0 && <p className="mb-2 text-xs text-ink-soft">{meta.join(' · ')}</p>}
                  <ol className="flex flex-col gap-2">
                    {g.steps.map((step) => {
                      const isSelected = step.id === selected.id;
                      const index = subjectSteps.indexOf(step);
                      return (
                        <li key={step.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedId(step.id)}
                            aria-pressed={isSelected}
                            aria-current={step.id === current?.id ? 'step' : undefined}
                            aria-controls="path-detail"
                            aria-describedby={headingId}
                            className={cn(
                              'flex min-h-11 w-full items-center gap-3 rounded-md border p-3 text-left outline-none transition-colors focus-visible:shadow-focus motion-reduce:transition-none',
                              isSelected ? 'border-brand-500 bg-brand-50' : 'border-line bg-surface hover:bg-surface-muted',
                              step.status === 'locked' && !isSelected && 'bg-surface-muted',
                            )}
                          >
                            <span
                              aria-hidden
                              className={cn(
                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold',
                                step.status === 'done' ? 'border-success-500 bg-success-50 text-success-700' : 'border-line-strong bg-surface text-ink-soft',
                              )}
                            >
                              {index + 1}
                            </span>
                            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                              <span className="text-ink-soft">{KIND_ICON[step.kind]}</span>
                              <span className="font-semibold text-ink">{kindLabel(step.kind)}</span>
                              <Badge tone={STATUS_TONE[step.status]} icon={STATUS_ICON[step.status]}>
                                {t(`student.path.status.${step.status}`)}
                              </Badge>
                              <span className="text-sm text-ink-soft">{t('student.path.estimate', { minutes: step.estimatedMinutes })}</span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section id="path-detail" aria-labelledby="path-detail-heading" className="lg:sticky lg:top-6 lg:self-start">
        <Card as="div">
          <h2 id="path-detail-heading" className="text-lg font-semibold text-ink">
            {conceptTitle(selected.conceptId)}
          </h2>
          {conceptMeta(selectedConcept).length > 0 && (
            <p className="mt-1 text-xs text-ink-soft">{conceptMeta(selectedConcept).join(' · ')}</p>
          )}
          <p className="mt-1 text-sm text-ink-soft">
            <span className="me-3 inline-block">{kindLabel(selected.kind)}</span>
            <span className="me-3 inline-block">{t(`student.path.status.${selected.status}`)}</span>
            <span className="inline-block">{t('student.path.estimate', { minutes: selected.estimatedMinutes })}</span>
          </p>

          {selected.status === 'locked' && (
            <p className="mt-3 rounded-md bg-surface-muted p-3 text-sm text-ink-soft">{t('student.path.locked.hint')}</p>
          )}

          {(selected.status === 'in_progress' || selected.status === 'next') && (
            <div className="mt-4">
              <Button loading={completingId === selected.id} loadingLabel={t('a11y.loading')} onClick={() => void completeStep(selected.id)}>
                {t('student.path.complete.action')}
              </Button>
              {completeError && <p role="alert" className="mt-2 text-sm font-semibold text-danger-700">{t('student.path.complete.error')}</p>}
            </div>
          )}

          {selectedMastery && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-semibold text-ink">{t('student.path.detail.readiness')}</h3>
              <ReadinessBand band={selectedMastery.band} />
            </div>
          )}

          <div className="mt-4">
            <h3 className="mb-2 text-sm font-semibold text-ink">{t('student.path.detail.prereq')}</h3>
            {prereqs.length === 0 ? (
              <p className="text-sm text-ink-soft">{t('student.path.detail.noPrereq')}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {prereqs.map((p) => {
                  const m = masteryById.get(p.id);
                  return (
                    <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line p-2 text-sm">
                      <span className="text-ink">{t(p.titleKey as TKey)}</span>
                      {m && <ReadinessBand band={m.band} compact />}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Card>
      </section>
    </div>
  );

  return (
    <div>
      {header}

      <div className="mb-6 grid gap-4 md:grid-cols-[1fr_minmax(0,18rem)] md:items-center">
        <Card title={t('student.path.progress.title')}>
          <p className="mb-3 text-sm text-ink-soft">
            {t('student.path.progress.summary', { done: doneCount, total: steps.length })}
          </p>
          <ProgressBar
            value={(doneCount / steps.length) * 100}
            label={t('student.path.progress.title')}
          />
          {current && (
            <p className="mt-4 text-sm text-ink">
              {t('student.path.nextStep.summary' as TKey, { kind: kindLabel(current.kind), topic: conceptTitle(current.conceptId) })}
            </p>
          )}
        </Card>
        <AnimatedIllustration
          name="learning-path"
          alt={t('student.path.illustration.alt')}
          className="mx-auto w-full max-w-xs"
        />
      </div>

      <Tabs
        label={t('student.path.subjects.label')}
        value={subject}
        onChange={(id) => {
          setSubjectChoice(id);
          setSelectedId(null);
        }}
        items={subjects.map((s) => ({ id: s, label: t(`subject.${s}` as TKey), content: s === subject ? panel : null }))}
      />
    </div>
  );
}
