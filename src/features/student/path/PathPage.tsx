import { useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, Circle, ClipboardCheck, Lock, PenLine, PlayCircle, RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  AnimatedIllustration,
  Badge,
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
import { useT } from '@/i18n';
import { useAsync } from '@/lib';
import { studentService } from '@/services';
import { useSessionStore } from '@/store';
import type { Concept, LearningPathStep, Mastery } from '@/types';
import { useLt } from './useLt';

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
  const lt = useLt();
  const user = useSessionStore((s) => s.user);
  const userId = user?.id ?? '';
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, loading, error, reload } = useAsync<PathData>(async () => {
    const [steps, concepts, mastery] = await Promise.all([
      studentService.getLearningPath(userId),
      studentService.listConcepts(),
      studentService.getMastery(userId),
    ]);
    return { steps, concepts, mastery };
  }, [userId]);

  const conceptById = useMemo(() => new Map((data?.concepts ?? []).map((c) => [c.id, c])), [data]);
  const masteryById = useMemo(() => new Map((data?.mastery ?? []).map((m) => [m.conceptId, m])), [data]);

  const conceptTitle = (id: string): string => {
    const c = conceptById.get(id);
    return c ? lt(c.titleKey, c.titleKey) : id;
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
        <Card title={lt('student.path.progress.title', 'Your progress')}>
          <p className="mb-3 text-sm text-ink-soft">
            {lt('student.path.progress.summary', '{{done}} of {{total}} steps done', { done: doneCount, total: steps.length })}
          </p>
          <ProgressBar
            value={(doneCount / steps.length) * 100}
            label={lt('student.path.progress.title', 'Your progress')}
          />
          {current && (
            <p className="mt-4 text-sm text-ink">
              <span className="font-semibold">{t('student.dashboard.nextStep.title')}: </span>
              {kindLabel(current.kind)} · {conceptTitle(current.conceptId)}
            </p>
          )}
        </Card>
        <AnimatedIllustration
          name="learning-path"
          alt={lt('student.path.illustration.alt', 'A winding path with steps lighting up one by one')}
          className="mx-auto w-full max-w-xs"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section aria-labelledby="path-steps-heading">
          <h2 id="path-steps-heading" className="mb-3 text-lg font-semibold text-ink">
            {lt('student.path.steps.title', 'Your steps')}
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
                        {step.status === 'locked' && ` · ${t('student.path.locked.hint')}`}
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
              {kindLabel(selected.kind)} · {t(`student.path.status.${selected.status}`)} ·{' '}
              {t('student.path.estimate', { minutes: selected.estimatedMinutes })}
            </p>

            {selected.status === 'locked' && (
              <p className="mt-3 rounded-md bg-surface-muted p-3 text-sm text-ink-soft">{t('student.path.locked.hint')}</p>
            )}

            {selectedMastery && (
              <div className="mt-4">
                <h3 className="mb-2 text-sm font-semibold text-ink">{lt('student.path.detail.readiness', 'Where you are now')}</h3>
                <ReadinessBand band={selectedMastery.band} />
              </div>
            )}

            <div className="mt-4">
              <h3 className="mb-2 text-sm font-semibold text-ink">{lt('student.path.detail.prereq', 'This builds on')}</h3>
              {prereqs.length === 0 ? (
                <p className="text-sm text-ink-soft">{lt('student.path.detail.noPrereq', 'No earlier topics are needed first.')}</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {prereqs.map((p) => {
                    const m = masteryById.get(p.id);
                    return (
                      <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line p-2 text-sm">
                        <span className="text-ink">{lt(p.titleKey, p.titleKey)}</span>
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
