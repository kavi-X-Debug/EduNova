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
  cn,
  type BadgeTone,
} from '@/components/ui';
import { useT, type TKey } from '@/i18n';
import { useAsync } from '@/lib';
import { announce } from '@/lib/a11y';
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

interface PathData {
  steps: LearningPathStep[];
  concepts: Concept[];
  mastery: Mastery[];
}

export default function PathPage() {
  const t = useT();
  const user = useSessionStore((s) => s.user);
  const userId = user?.id ?? '';
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completeError, setCompleteError] = useState(false);

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
  const doneCount = steps.filter((s) => s.status === 'done').length;
  const current = steps.find((s) => s.status === 'in_progress') ?? steps.find((s) => s.status === 'next');
  const selected = steps.find((s) => s.id === (selectedId ?? current?.id)) ?? steps[0];
  const selectedConcept = conceptById.get(selected.conceptId);
  const selectedMastery = masteryById.get(selected.conceptId);
  const prereqs = (selectedConcept?.prerequisiteIds ?? []).map((id) => conceptById.get(id)).filter((c): c is Concept => Boolean(c));

  const kindLabel = (k: Kind) => t(`student.path.step.${k}`);

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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section aria-labelledby="path-steps-heading">
          <h2 id="path-steps-heading" className="mb-3 text-lg font-semibold text-ink">
            {t('student.path.steps.title')}
          </h2>
          <ol className="flex flex-col gap-3">
            {steps.map((step, index) => {
              const isSelected = step.id === selected.id;
              const isCurrent = step.id === current?.id;
              return (
                <li key={step.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setSelectedId(step.id)}
                    aria-pressed={isSelected}
                    aria-current={isCurrent ? 'step' : undefined}
                    aria-controls="path-detail"
                    className={cn(
                      'flex min-h-11 w-full items-start gap-3 rounded-lg border bg-surface p-4 text-left shadow-card outline-none transition-colors focus-visible:shadow-focus motion-reduce:transition-none',
                      isSelected ? 'border-brand-500 bg-brand-50' : 'border-line hover:bg-surface-muted',
                      step.status === 'locked' && !isSelected && 'bg-surface-muted',
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold',
                        step.status === 'done' ? 'border-success-500 bg-success-50 text-success-700' : 'border-line-strong bg-surface text-ink-soft',
                      )}
                    >
                      {index + 1}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-ink-soft">{KIND_ICON[step.kind]}</span>
                        <span className="font-semibold text-ink">{kindLabel(step.kind)}</span>
                        <Badge tone={STATUS_TONE[step.status]} icon={STATUS_ICON[step.status]}>
                          {t(`student.path.status.${step.status}`)}
                        </Badge>
                      </span>
                      <span className="text-base text-ink">{conceptTitle(step.conceptId)}</span>
                      <span className="text-sm text-ink-soft">
                        {t('student.path.estimate', { minutes: step.estimatedMinutes })}
                        {step.status === 'locked' && <span className="block">{t('student.path.locked.hint')}</span>}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>

        <section id="path-detail" aria-labelledby="path-detail-heading" className="lg:sticky lg:top-6 lg:self-start">
          <Card as="div">
            <h2 id="path-detail-heading" className="text-lg font-semibold text-ink">
              {conceptTitle(selected.conceptId)}
            </h2>
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
    </div>
  );
}
