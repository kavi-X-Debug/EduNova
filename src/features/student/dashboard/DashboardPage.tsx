import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageCircle, RefreshCw } from 'lucide-react';
import {
  AnimatedIllustration,
  Badge,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  MasteryRing,
  PageHeader,
  ProgressBar,
  ReadinessBand,
  cn,
} from '@/components/ui';
import { averageLevel, bandFromLevel, useAsync, type AsyncState } from '@/lib';
import { studentService } from '@/services';
import { useSessionStore } from '@/store';
import { usePageFocus } from '../onboarding/usePageFocus';

const linkBtn = (primary: boolean) =>
  cn(
    'inline-flex min-h-[44px] items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold outline-none focus-visible:shadow-focus',
    primary ? 'border-transparent bg-brand-600 text-surface hover:bg-brand-700' : 'border-line-strong bg-surface text-ink hover:bg-surface-sunken',
  );

interface BlockProps<T> {
  title: string;
  state: AsyncState<T>;
  isEmpty: (d: T) => boolean;
  emptyText: string;
  emptyAction?: ReactNode;
  errorText: string;
  className?: string;
  children: (d: T) => ReactNode;
}

/** One dashboard card with its own loading, empty and error states. */
function Block<T>({ title, state, isEmpty, emptyText, emptyAction, errorText, className, children }: BlockProps<T>) {
  const { t } = useTranslation();
  let content: ReactNode;
  if (state.loading && state.data === undefined) content = <LoadingState label={t('a11y.loading')} lines={3} />;
  else if (state.error) content = <ErrorState description={errorText} onRetry={state.reload} retryLabel={t('common.action.retry')} className="p-4" />;
  else if (state.data === undefined || isEmpty(state.data)) {
    content = <EmptyState title={emptyText} action={emptyAction} className="p-4" />;
  } else content = children(state.data);
  return (
    <Card as="section" className={className} aria-label={title} title={title}>
      {content}
    </Card>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const user = useSessionStore((s) => s.user);
  const userId = user?.id ?? '';
  const ref = usePageFocus<HTMLDivElement>();

  const [now] = useState(() => Date.now());
  const path = useAsync(() => studentService.getLearningPath(userId), [userId]);
  const mastery = useAsync(async () => {
    const [m, c] = await Promise.all([studentService.getMastery(userId), studentService.listConcepts()]);
    return { m, c };
  }, [userId]);
  const revision = useAsync(() => studentService.getRevisionQueue(userId), [userId]);
  const quests = useAsync(() => studentService.listQuests(userId), [userId]);
  const exams = useAsync(() => studentService.listExamReports(userId), [userId]);

  const bySubject = useMemo(() => {
    if (!mastery.data) return [];
    const { m, c } = mastery.data;
    const subjects = new Map<string, number[]>();
    for (const item of m) {
      const subject = c.find((x) => x.id === item.conceptId)?.subject;
      if (subject) subjects.set(subject, [...(subjects.get(subject) ?? []), item.level]);
    }
    return Array.from(subjects, ([subject, levels]) => {
      const level = averageLevel(levels.map((level) => ({ level })));
      return { subject, level, count: levels.length, band: bandFromLevel(level) };
    });
  }, [mastery.data]);

  const firstName = (user?.name ?? '').split(' ')[0];
  const next = path.data?.find((s) => s.status === 'in_progress') ?? path.data?.find((s) => s.status === 'next');
  const done = path.data?.filter((s) => s.status === 'done').length ?? 0;
  const dueCount = revision.data?.filter((r) => new Date(r.dueAt).getTime() <= now).length ?? 0;
  const activeQuest = quests.data?.find((q) => q.status === 'open');
  const latestExam = exams.data && [...exams.data].sort((a, b) => b.date.localeCompare(a.date))[0];

  return (
    <div ref={ref}>
      <PageHeader title={t('student.dashboard.greeting', { name: firstName })} description={t('student.dashboard.subtitle')} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Block
          title={t('student.dashboard.nextStep.title')}
          state={path}
          isEmpty={(d) => d.length === 0 || !next}
          emptyText={t('student.dashboard.empty')}
          emptyAction={<Link to="/student/diagnostic" className={linkBtn(true)}>{t('student.diagnostic.start')}</Link>}
          errorText={t('student.dashboard.error')}
          className="md:col-span-2 xl:col-span-2"
        >
          {(steps) =>
            next && (
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <AnimatedIllustration name="learning-path" alt="" className="w-full max-w-xs shrink-0 md:w-48" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="brand">{t(`student.path.step.${next.kind}`)}</Badge>
                    <span className="text-sm text-ink-soft">{t('student.path.estimate', { minutes: next.estimatedMinutes })}</span>
                  </div>
                  <p className="mt-2 text-xl font-semibold text-ink">{t(`concept.${next.conceptId}`)}</p>
                  <p className="mt-3 text-sm text-ink-soft">{t('student.dashboard.progress.summary', { done, total: steps.length })}</p>
                  <ProgressBar className="mt-2" value={(done / steps.length) * 100} label={t('student.dashboard.progress.title')} />
                  <Link to="/student/path" className={cn(linkBtn(true), 'mt-4')}>
                    {t('student.dashboard.nextStep.start')}
                  </Link>
                </div>
              </div>
            )
          }
        </Block>

        <Block
          title={t('student.dashboard.revisionDue.title')}
          state={revision}
          isEmpty={() => false}
          emptyText={t('student.revision.empty')}
          errorText={t('student.revision.error')}
        >
          {() => (
            <div className="flex flex-col items-start gap-3">
              <p className="flex items-center gap-2 text-lg font-semibold text-ink">
                <RefreshCw aria-hidden className="h-5 w-5 text-brand-600" />
                {dueCount > 0 ? t('student.dashboard.revisionDue.count', { count: dueCount }) : t('student.revision.empty')}
              </p>
              <Link to="/student/revision" className={linkBtn(dueCount > 0)}>
                {t('student.revision.start')}
              </Link>
            </div>
          )}
        </Block>

        <Block
          title={t('student.dashboard.mastery.title')}
          state={mastery}
          isEmpty={() => bySubject.length === 0}
          emptyText={t('student.dashboard.mastery.empty')}
          emptyAction={<Link to="/student/diagnostic" className={linkBtn(true)}>{t('student.diagnostic.start')}</Link>}
          errorText={t('student.dashboard.error')}
          className="md:col-span-2 xl:col-span-2"
        >
          {() => (
            <ul className="grid gap-4 sm:grid-cols-2">
              {bySubject.map((s) => (
                <li key={s.subject} className="flex items-center gap-4 rounded-lg border border-line p-3">
                  <MasteryRing value={s.level} label={t(`subject.${s.subject}`)} />
                  <div>
                    <p className="font-semibold text-ink">{t(`subject.${s.subject}`)}</p>
                    <p className="text-xs text-ink-soft">{t('student.dashboard.mastery.topics', { count: s.count })}</p>
                    <ReadinessBand band={s.band} compact className="mt-1" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Block>

        <Block
          title={t('student.dashboard.quest.title')}
          state={quests}
          isEmpty={() => !activeQuest}
          emptyText={t('student.dashboard.quest.empty')}
          errorText={t('student.quests.error')}
        >
          {() =>
            activeQuest && (
              <div>
                <p className="font-semibold text-ink">{t(activeQuest.titleKey)}</p>
                <p className="mt-1 text-sm text-ink-soft">
                  {t('student.dashboard.quest.progress', {
                    done: activeQuest.missions.filter((m) => m.done).length,
                    total: activeQuest.missions.length,
                  })}
                </p>
                <ProgressBar
                  className="mt-2"
                  tone="success"
                  value={(activeQuest.missions.filter((m) => m.done).length / Math.max(1, activeQuest.missions.length)) * 100}
                  label={t(activeQuest.titleKey)}
                />
                <p className="mt-3 text-xs text-ink-soft">{t('student.quests.private')}</p>
                <Link to="/student/quests" className={cn(linkBtn(false), 'mt-3')}>
                  {t('student.dashboard.quest.view')}
                </Link>
              </div>
            )
          }
        </Block>

        <Block
          title={t('student.dashboard.exam.title')}
          state={exams}
          isEmpty={(d) => d.length === 0}
          emptyText={t('student.exams.empty')}
          errorText={t('student.exams.error')}
        >
          {() =>
            latestExam && (
              <div>
                <ReadinessBand band={latestExam.band} />
                <p className="mt-2 text-sm text-ink-soft">{t(`student.exams.band.${latestExam.band}.desc`)}</p>
                <p className="mt-2 text-xs text-ink-soft">{t('student.exams.readiness.note')}</p>
                <Link to={`/student/exams/${latestExam.examId}`} className={cn(linkBtn(false), 'mt-3')}>
                  {t('student.dashboard.exam.view')}
                </Link>
              </div>
            )
          }
        </Block>

        <Card as="section" aria-label={t('student.dashboard.tutor.title')} title={t('student.dashboard.tutor.title')}>
          <div className="flex flex-col items-start gap-3">
            <p className="flex items-start gap-2 text-sm text-ink-soft">
              <MessageCircle aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              {t('student.dashboard.tutor.body')}
            </p>
            <Link to="/student/tutor" className={linkBtn(true)}>
              {t('student.dashboard.tutor.cta')}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
