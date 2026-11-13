import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, ClipboardCheck, Info, Lock, PenLine, Play, RotateCcw, Sparkles } from 'lucide-react';
import {
  BigActionButton,
  Button,
  ButtonLink,
  Card,
  GrowMeter,
  HelpBubble,
  MascotMessage,
  PageHeader,
  ProgressBar,
  SpeakButton,
  cn,
} from '@/components/ui';
import { useTranslation } from 'react-i18next';
import type { TKey } from '@/i18n';
import { localiseRef, unitLabel, useAsync } from '@/lib';
import { announce } from '@/lib/a11y';
import { i18n } from '@/i18n';
import { studentService } from '@/services';
import { useSessionStore } from '@/store';
import type { Concept, LearningPathStep, Locale, Mastery } from '@/types';
import { DoneScreen, KidEmpty, KidError, KidLoading } from '../learnKit/KidState';
import { SubjectIcon } from '../learnKit/SubjectIcon';

type Kind = LearningPathStep['kind'];

const KIND_ICON: Record<Kind, ReactNode> = {
  lesson: <BookOpen aria-hidden className="h-7 w-7" />,
  practice: <PenLine aria-hidden className="h-7 w-7" />,
  quiz: <ClipboardCheck aria-hidden className="h-7 w-7" />,
  revision: <RotateCcw aria-hidden className="h-7 w-7" />,
};

interface PathData {
  steps: LearningPathStep[];
  concepts: Concept[];
  mastery: Mastery[];
}

const isCurrent = (s: LearningPathStep) => s.status === 'in_progress' || s.status === 'next';

/** My learning trail: subjects as big buttons, a stepping-stone trail, one big Start. */
export default function PathPage() {
  const { t } = useTranslation();
  const user = useSessionStore((s) => s.user);
  const userId = user?.id ?? '';
  const [activeId, setActiveId] = useState<string | null>(null);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState(false);
  const [subjectChoice, setSubjectChoice] = useState<string | null>(null);
  const focusRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const { data, loading, error, reload } = useAsync<PathData>(async () => {
    const [steps, concepts, mastery] = await Promise.all([
      studentService.getLearningPath(userId),
      studentService.listConcepts(),
      studentService.getMastery(userId),
    ]);
    return { steps, concepts, mastery };
  }, [userId]);

  // Move focus to the new screen's heading when the child changes screen (their own action).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    focusRef.current?.focus({ preventScroll: false });
  }, [activeId, doneId]);

  const conceptById = useMemo(() => new Map((data?.concepts ?? []).map((c) => [c.id, c])), [data]);
  const masteryById = useMemo(() => new Map((data?.mastery ?? []).map((m) => [m.conceptId, m])), [data]);
  const conceptTitle = (id: string): string => {
    const c = conceptById.get(id);
    return c ? t(c.titleKey as TKey) : id;
  };
  const stepTitle = (s: LearningPathStep) => t(`kids.home.plan.step.${s.kind}` as TKey, { topic: conceptTitle(s.conceptId) });

  const header = (
    <PageHeader title={t('student.path.title')} description={t('student.path.subtitle')} actions={<HelpBubble textKey="kidslearn.path.help" align="end" />} />
  );

  if (loading && !data) {
    return (
      <div>
        {header}
        <KidLoading />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div>
        {header}
        <KidError onRetry={reload} body={t('student.path.error')} />
      </div>
    );
  }
  if (data.steps.length === 0) {
    return (
      <div>
        {header}
        <KidEmpty
          mood="thinking"
          title={t('kidslearn.path.empty.title')}
          body={t('student.path.empty')}
          action={
            <BigActionButton to="/student/diagnostic" icon={<Play />} className="self-start">
              {t('kids.learn.warmup.title')}
            </BigActionButton>
          }
        />
      </div>
    );
  }

  const { steps } = data;
  const subjectOf = (s: LearningPathStep) => conceptById.get(s.conceptId)?.subject ?? '';
  const current = steps.find((s) => s.status === 'in_progress') ?? steps.find((s) => s.status === 'next');

  const completeStep = async (step: LearningPathStep) => {
    setCompleting(true);
    setCompleteError(false);
    try {
      await studentService.completePathStep(userId, step.id);
      announce(t('student.path.complete.done'));
      reload();
      setDoneId(step.id);
      setActiveId(null);
    } catch {
      setCompleteError(true);
      announce(t('student.path.complete.error'), 'assertive');
    } finally {
      setCompleting(false);
    }
  };

  const openStep = (s: LearningPathStep) => {
    setCompleteError(false);
    setDoneId(null);
    setActiveId(s.id);
    setSubjectChoice(subjectOf(s));
  };
  const backToTrail = () => {
    setActiveId(null);
    setDoneId(null);
    setCompleteError(false);
  };

  /* ---------- A step: what to do, then "I finished this step" ---------- */
  const active = steps.find((s) => s.id === activeId);
  if (active) {
    const body = t(`kidslearn.path.step.${active.kind}.body` as TKey);
    return (
      <div>
        {header}
        <Button variant="ghost" size="lg" onClick={backToTrail} leftIcon={<ArrowLeft aria-hidden className="h-5 w-5" />} className="mb-4">
          {t('kidslearn.path.back')}
        </Button>
        <Card as="section" raised aria-labelledby="path-step-title" className="flex flex-col gap-6">
          <MascotMessage mood="happy" size="lg">
            <h2 id="path-step-title" ref={focusRef} tabIndex={-1} className="text-2xl font-bold text-ink outline-none">
              {stepTitle(active)}
            </h2>
            <span className="mt-1 block font-normal text-ink-soft">{t('kids.home.plan.time', { count: active.estimatedMinutes })}</span>
          </MascotMessage>
          <div className="flex items-start gap-4 rounded-lg bg-surface-muted p-4">
            <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              {KIND_ICON[active.kind]}
            </span>
            <p className="min-w-0 flex-1 text-lg text-ink">{body}</p>
            <SpeakButton text={body} size="sm" />
          </div>
          {completeError && (
            <p role="alert" className="text-lg font-bold text-danger-700">
              {t('student.path.complete.error')}
            </p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button size="xl" loading={completing} loadingLabel={t('a11y.loading')} onClick={() => void completeStep(active)} leftIcon={<Check aria-hidden className="h-6 w-6" />}>
              {t('student.path.complete.action')}
            </Button>
            <ButtonLink to="/student/tutor" variant="secondary" size="lg">
              {t('kidslearn.path.askNova')}
            </ButtonLink>
          </div>
        </Card>
      </div>
    );
  }

  /* ---------- Done screen ---------- */
  const finished = steps.find((s) => s.id === doneId);
  if (finished) {
    const idx = steps.indexOf(finished);
    const next = steps.slice(idx + 1).find((s) => s.status !== 'done') ?? steps.find((s) => isCurrent(s) && s.id !== finished.id);
    return (
      <div>
        {header}
        <DoneScreen title={t('kidslearn.greatJob')} body={t('kidslearn.path.done.body', { title: stepTitle(finished) })} headingRef={focusRef}>
          {next ? (
            <>
              <BigActionButton icon={<ArrowRight />} onClick={() => openStep(next)}>
                {t('kidslearn.path.nextStep')}
              </BigActionButton>
              <Button variant="secondary" size="xl" onClick={backToTrail}>
                {t('kidslearn.path.back')}
              </Button>
            </>
          ) : (
            <BigActionButton icon={<ArrowLeft />} onClick={backToTrail}>
              {t('kidslearn.path.back')}
            </BigActionButton>
          )}
        </DoneScreen>
      </div>
    );
  }

  /* ---------- The trail ---------- */
  // Subjects in the order the service lists them, keeping only those with steps.
  const subjects = [...new Set([...data.concepts.map((c) => c.subject), ...steps.map(subjectOf)])].filter((s) => steps.some((x) => subjectOf(x) === s));
  const subject = subjectChoice && subjects.includes(subjectChoice) ? subjectChoice : current ? subjectOf(current) : subjects[0];
  const subjectSteps = steps.filter((s) => subjectOf(s) === subject);
  const subjectDone = subjectSteps.filter((s) => s.status === 'done').length;

  // Group by topic (steps arrive in teaching order).
  const groups: { concept: string; steps: LearningPathStep[] }[] = [];
  for (const s of subjectSteps) {
    const last = groups[groups.length - 1];
    if (last && last.concept === s.conceptId) last.steps.push(s);
    else groups.push({ concept: s.conceptId, steps: [s] });
  }

  const loc = i18n.language as Locale;
  const moreInfo = (c: Concept | undefined): string[] => {
    if (!c) return [];
    const prereqs = c.prerequisiteIds.map((id) => conceptById.get(id)).filter((p): p is Concept => Boolean(p));
    return [
      c.term ? t('student.path.term.n', { term: c.term }) : '',
      c.unit ? unitLabel(c.unit, t as never) : '',
      c.textbookRef ? t('student.path.textbookRef', { ref: localiseRef(c.textbookRef, loc) }) : '',
      prereqs.length ? `${t('student.path.detail.prereq')}: ${prereqs.map((p) => t(p.titleKey as TKey)).join(', ')}` : '',
    ].filter(Boolean);
  };

  const allDone = (g: { steps: LearningPathStep[] }) => g.steps.every((s) => s.status === 'done');
  const allLocked = (g: { steps: LearningPathStep[] }) => g.steps.every((s) => s.status === 'locked');
  const doneGroups = groups.filter(allDone);
  const lockedGroups = groups.filter((g) => !allDone(g) && allLocked(g));
  const openGroups = groups.filter((g) => !allDone(g) && !allLocked(g));
  const doneRow = (g: { concept: string }) => (
    <li key={g.concept} className="flex items-center gap-3 rounded-xl border border-success-500 bg-success-50 p-3">
      <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-700 text-surface">
        <Check className="h-6 w-6" />
      </span>
      <span className="min-w-0 flex-1 text-lg font-bold text-ink">{conceptTitle(g.concept)}</span>
      <span className="text-base font-semibold text-success-700">{t('student.path.status.done')}</span>
    </li>
  );
  const lockedRow = (g: { concept: string }) => (
    <li key={g.concept} className="flex items-center gap-3 rounded-xl border border-line bg-surface-muted p-3">
      <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-ink-soft">
        <Lock className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-bold text-ink-soft">{conceptTitle(g.concept)}</span>
        <span className="block text-base text-ink-soft">{t('student.path.locked.hint')}</span>
      </span>
    </li>
  );

  return (
    <div className="flex flex-col gap-6">
      {header}

      <Card as="section" raised aria-labelledby="path-next-title" className="border-brand-100 bg-gradient-to-b from-brand-50 to-surface">
        {current ? (
          <div className="flex flex-col gap-5">
            <MascotMessage mood="happy" size="lg" speakText={stepTitle(current)}>
              <h2 id="path-next-title" className="text-xl font-bold text-ink">
                {t('kidslearn.path.next')}
              </h2>
              <span className="mt-1 block text-2xl font-bold text-brand-700">{stepTitle(current)}</span>
              <span className="mt-1 block font-normal text-ink-soft">{t('kids.home.plan.time', { count: current.estimatedMinutes })}</span>
            </MascotMessage>
            <BigActionButton icon={<Play />} fullWidth onClick={() => openStep(current)} className="md:w-auto md:self-start">
              {current.status === 'in_progress' ? t('kids.home.continue') : t('kids.home.start')}
            </BigActionButton>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <MascotMessage mood="cheer" size="lg" speakText={t('kidslearn.path.allDone')}>
              <h2 id="path-next-title" className="text-xl font-bold text-ink">
                {t('kidslearn.path.allDone')}
              </h2>
            </MascotMessage>
            <BigActionButton to="/student/play" icon={<Sparkles />} fullWidth className="md:w-auto md:self-start">
              {t('kids.home.done.play')}
            </BigActionButton>
          </div>
        )}
      </Card>

      <section aria-labelledby="path-subjects-title" className="flex flex-col gap-3">
        <h2 id="path-subjects-title" className="text-xl font-bold text-ink">
          {t('kidslearn.path.pickSubject')}
        </h2>
        <ul className="stagger flex flex-wrap gap-3">
          {subjects.map((s) => {
            const on = s === subject;
            return (
              <li key={s}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSubjectChoice(s)}
                  className={cn(
                    'group flex min-h-[64px] items-center gap-3 rounded-xl border-2 px-4 py-2 text-left text-xl font-bold text-ink outline-none transition duration-base ease-standard focus-visible:shadow-focus motion-ok:active:scale-[0.98] motion-reduce:transition-none',
                    on ? 'border-brand-600 bg-brand-50 shadow-raised' : 'border-line bg-surface hover:border-line-strong hover:bg-surface-muted',
                  )}
                >
                  <SubjectIcon subject={s} size="sm" />
                  {t(`subject.${s}` as TKey)}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="path-trail-title" className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 id="path-trail-title" className="text-xl font-bold text-ink">
            {t(`subject.${subject}` as TKey)}
          </h2>
          <p className="text-lg text-ink-soft">{t('student.path.progress.summary', { done: subjectDone, total: subjectSteps.length })}</p>
          <ProgressBar value={(subjectDone / Math.max(1, subjectSteps.length)) * 100} label={t('student.path.progress.title')} tone="success" className="max-w-md" />
        </div>

        <ol className="stagger flex flex-col gap-4">
          {doneGroups.length > 0 && (
            <li>
              <details>
                <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-md px-2 text-lg font-bold text-success-700 outline-none focus-visible:shadow-focus [&::-webkit-details-marker]:hidden">
                  <Check aria-hidden className="h-5 w-5" />
                  {t('kidslearn.path.finished', { count: doneGroups.length })}
                </summary>
                <ul className="mt-2 flex flex-col gap-2">{doneGroups.map((g) => doneRow(g))}</ul>
              </details>
            </li>
          )}
          {openGroups.map((g) => {
            const title = conceptTitle(g.concept);
            const c = conceptById.get(g.concept);
            const info = moreInfo(c);
            const m = masteryById.get(g.concept);
            return (
              <li key={g.concept}>
                <Card as="section" aria-labelledby={`path-g-${g.concept}`} className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 id={`path-g-${g.concept}`} className="min-w-0 flex-1 text-2xl font-bold text-ink">
                      {title}
                    </h3>
                    {m && <GrowMeter band={m.band} size="sm" />}
                  </div>
                  {info.length > 0 && (
                    <details className="group">
                      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-md px-2 text-base font-semibold text-brand-700 outline-none focus-visible:shadow-focus [&::-webkit-details-marker]:hidden">
                        <Info aria-hidden className="h-5 w-5" />
                        {t('kidslearn.path.more')}
                      </summary>
                      <ul className="mt-2 flex flex-col gap-1 ps-2 text-base text-ink-soft">
                        {info.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                  <ol className="relative flex flex-col gap-3 before:absolute before:bottom-10 before:left-[38px] before:top-10 before:w-0 before:border-l-4 before:border-dashed before:border-line-strong">
                    {g.steps.map((step, i) => (
                      <Stone key={step.id} n={i + 1} step={step} onOpen={() => openStep(step)} />
                    ))}
                  </ol>
                </Card>
              </li>
            );
          })}
          {lockedGroups.slice(0, 2).map((g) => lockedRow(g))}
          {lockedGroups.length > 2 && (
            <li>
              <details>
                <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-md px-2 text-lg font-bold text-brand-700 outline-none focus-visible:shadow-focus [&::-webkit-details-marker]:hidden">
                  <Lock aria-hidden className="h-5 w-5" />
                  {t('kidslearn.path.later', { count: lockedGroups.length - 2 })}
                </summary>
                <ul className="mt-2 flex flex-col gap-2">{lockedGroups.slice(2).map((g) => lockedRow(g))}</ul>
              </details>
            </li>
          )}
        </ol>
      </section>
    </div>
  );
}

/** One stepping stone: done = tick, current = big "You are here" (a button), locked = soft grey with a hint. */
function Stone({ n, step, onOpen }: { n: number; step: LearningPathStep; onOpen: () => void }) {
  const { t } = useTranslation();
  const here = isCurrent(step);
  const done = step.status === 'done';
  const kind = t(`kidslearn.path.kind.${step.kind}` as TKey);
  const meta = t('kids.home.plan.time', { count: step.estimatedMinutes });

  const stone = (
    <span aria-hidden className="relative z-10 flex h-20 w-20 shrink-0 items-center justify-center">
      <span
        className={cn(
          'flex items-center justify-center rounded-full border-4 text-2xl font-bold',
          done && 'h-16 w-16 border-success-700 bg-success-700 text-surface',
          here && 'h-20 w-20 border-brand-100 bg-brand-600 text-surface shadow-raised ring-2 ring-brand-600 motion-ok:animate-fx-pop-in',
          !done && !here && 'h-16 w-16 border-line-strong bg-surface-sunken text-ink-faint',
        )}
      >
        {done ? <Check className="h-8 w-8" /> : here ? n : <Lock className="h-6 w-6" />}
      </span>
    </span>
  );

  if (here) {
    return (
      <li>
        <button
          type="button"
          onClick={onOpen}
          className="flex min-h-[88px] w-full items-center gap-3 rounded-xl border-2 border-brand-600 bg-brand-50 pe-4 text-left outline-none transition duration-base ease-standard hover:bg-brand-100 focus-visible:shadow-focus motion-ok:active:scale-[0.99] motion-reduce:transition-none"
        >
          {stone}
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="inline-flex w-fit items-center rounded-full bg-accent-500 px-3 py-0.5 text-base font-bold text-ink">{t('kidslearn.path.here')}</span>
            <span className="flex items-center gap-2 text-xl font-bold text-ink">
              <span aria-hidden className="text-brand-700">{KIND_ICON[step.kind]}</span>
              {kind}
            </span>
            <span className="text-base text-ink-soft">{meta}</span>
          </span>
          <ArrowRight aria-hidden className="h-6 w-6 shrink-0 text-brand-700" />
        </button>
      </li>
    );
  }
  return (
    <li className={cn('flex min-h-[72px] items-center gap-3 rounded-xl pe-4', !done && 'opacity-80')}>
      {stone}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={cn('flex items-center gap-2 text-xl font-bold', done ? 'text-ink' : 'text-ink-soft')}>
          <span aria-hidden>{KIND_ICON[step.kind]}</span>
          {kind}
        </span>
        <span className="text-base text-ink-soft">{done ? t('student.path.status.done') : t('student.path.locked.hint')}</span>
      </span>
    </li>
  );
}
