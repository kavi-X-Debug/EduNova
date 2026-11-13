import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Award, CircleCheck, Circle, Play, RefreshCw, Rocket } from 'lucide-react';
import {
  BadgeImage,
  BigActionButton,
  ButtonLink,
  Button,
  Card,
  HelpBubble,
  LoadingState,
  Mascot,
  MascotMessage,
  cn,
  preloadMascots,
} from '@/components/ui';
import { SubjectIcon } from '../learnKit/SubjectIcon';
import { useTranslation } from 'react-i18next';
import { useAsync } from '@/lib';
import { rewardsService, studentService } from '@/services';
import { useSessionStore } from '@/store';
import type { LearningPathStep } from '@/types';
import { countReadyNow } from './revisionDue';
import { resolveTodaysPlan } from './todaysPlan';

/** Home for a Grade 6 child: one big "Today's plan" card, one Start button, two small peeks. */
export default function DashboardPage() {
  const { t } = useTranslation();
  const user = useSessionStore((s) => s.user);
  const userId = user?.id ?? '';
  const firstName = (user?.name ?? '').trim().split(/\s+/)[0] ?? '';

  const path = useAsync(() => studentService.getLearningPath(userId), [userId]);
  const concepts = useAsync(() => studentService.listConcepts(), []);
  const subjectOf = useMemo(() => {
    const m = new Map((concepts.data ?? []).map((c) => [c.id, c.subject]));
    return (conceptId: string) => m.get(conceptId) ?? '';
  }, [concepts.data]);
  // Warm the cache for all Nova poses so none pops in late on the pages this hub leads to.
  useEffect(() => preloadMascots(), []);
  const [now] = useState(() => Date.now());
  const plan = useMemo(() => (path.data ? resolveTodaysPlan(userId, path.data) : undefined), [path.data, userId]);

  return (
    <div className="flex flex-col gap-6">
      <Card as="section" raised aria-labelledby="home-plan-title" className="relative overflow-hidden border-brand-100 bg-gradient-to-b from-brand-50 to-surface">
        {path.loading && !path.data ? (
          <LoadingState label={t('a11y.loading')} lines={4} />
        ) : path.error ? (
          <PlanError onRetry={path.reload} />
        ) : !plan || (plan.steps.length === 0 && !path.data?.some((s) => s.status === 'done')) ? (
          <PlanEmpty />
        ) : (
          <PlanBody plan={plan} firstName={firstName} subjectOf={subjectOf} />
        )}
      </Card>

      <div className="stagger grid gap-4 md:grid-cols-2">
        <QuickReview now={now} userId={userId} />
        <BadgesPeek userId={userId} />
      </div>
    </div>
  );
}

function PlanBody({ plan, firstName, subjectOf }: { plan: ReturnType<typeof resolveTodaysPlan>; firstName: string; subjectOf: (conceptId: string) => string }) {
  const { t } = useTranslation();
  // No steps left in the plan but the child has finished things before: that is the "done" state too.
  const { steps, next, minutesLeft } = plan;
  const allDone = plan.allDone || steps.length === 0;
  const greeting = allDone
    ? t('kids.home.done.title')
    : minutesLeft > 0
      ? t('kids.home.greetingMinutes', { name: firstName, count: next?.estimatedMinutes ?? minutesLeft })
      : t('kids.home.greeting', { name: firstName });
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <h1 id="home-plan-title" className="text-2xl font-bold text-ink md:text-3xl">
          {t('kids.home.title')}
        </h1>
        <HelpBubble textKey="kids.home.help" align="end" />
      </div>

      <MascotMessage mood={allDone ? 'cheer' : 'wave'} size="lg" speakText={greeting}>
        {greeting}
      </MascotMessage>
      {allDone && <p className="text-lg text-ink-soft">{t('kids.home.done.body')}</p>}

      {steps.length > 0 && (
        <ol aria-label={t('kids.home.plan.list')} className="stagger flex flex-col gap-3">
          {steps.map((s) => (
            <PlanRow key={s.id} step={s} subject={subjectOf(s.conceptId)} />
          ))}
        </ol>
      )}

      {!allDone && minutesLeft > 0 && <p className="text-lg font-semibold text-ink-soft">{t('kids.home.plan.time', { count: minutesLeft })}</p>}

      {!allDone && next ? (
        <BigActionButton to="/student/path" icon={<Play />} fullWidth className="md:w-auto md:self-start">
          {next.status === 'in_progress' ? t('kids.home.continue') : t('kids.home.start')}
        </BigActionButton>
      ) : (
        <BigActionButton to="/student/path" icon={<Rocket />} fullWidth className="md:w-auto md:self-start">
          {t('kids.home.done.more')}
        </BigActionButton>
      )}
      {allDone && (
        <ButtonLink to="/student/play" variant="secondary" size="xl" fullWidth className="md:w-auto md:self-start">
          {t('kids.home.done.play')}
        </ButtonLink>
      )}
    </div>
  );
}

function PlanRow({ step, subject }: { step: LearningPathStep; subject: string }) {
  const { t } = useTranslation();
  const done = step.status === 'done';
  const Icon = done ? CircleCheck : Circle;
  return (
    <li className={cn('group flex items-center gap-3 rounded-lg border bg-surface p-3 md:p-4', done ? 'border-success-500' : 'border-line')}>
      <Icon aria-hidden className={cn('h-8 w-8 shrink-0', done ? 'text-success-700' : 'text-ink-faint')} />
      {subject && <SubjectIcon subject={subject} size="sm" className={cn(done && 'opacity-70')} />}
      <span className="sr-only">{done ? t('kids.home.plan.done') : t('kids.home.plan.todo')}: </span>
      <span className={cn('min-w-0 flex-1 text-lg font-semibold', done ? 'text-ink-soft' : 'text-ink')}>
        {t(`kids.home.plan.step.${step.kind}`, { topic: t(`concept.${step.conceptId}`) })}
        {!done && <span className="mt-0.5 block text-base font-normal text-ink-soft md:hidden">{t('kids.home.plan.time', { count: step.estimatedMinutes })}</span>}
      </span>
      {!done && <span className="hidden shrink-0 text-base text-ink-soft md:block">{t('kids.home.plan.time', { count: step.estimatedMinutes })}</span>}
    </li>
  );
}

function PlanEmpty() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-5">
      <h1 id="home-plan-title" className="text-2xl font-bold text-ink md:text-3xl">
        {t('kids.home.title')}
      </h1>
      <MascotMessage mood="sleepy" size="lg" speakText={t('kids.home.empty.body')}>
        <span className="block text-xl font-bold">{t('kids.home.empty.title')}</span>
        <span className="mt-1 block font-normal text-ink-soft">{t('kids.home.empty.body')}</span>
      </MascotMessage>
      <BigActionButton to="/student/diagnostic" icon={<Play />} fullWidth className="md:w-auto md:self-start">
        {t('kids.learn.warmup.title')}
      </BigActionButton>
    </div>
  );
}

function PlanError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div role="alert" className="flex flex-col gap-5">
      <h1 id="home-plan-title" className="text-2xl font-bold text-ink md:text-3xl">
        {t('kids.home.title')}
      </h1>
      <MascotMessage mood="oops" size="lg">
        <span className="block text-xl font-bold">{t('kids.home.error.title')}</span>
        <span className="mt-1 block font-normal text-ink-soft">{t('kids.home.error.body')}</span>
      </MascotMessage>
      <Button size="xl" onClick={onRetry} className="self-start">
        {t('common.action.retry')}
      </Button>
    </div>
  );
}

/** Small card: how many things are ready to remember again, with one button when there are some. */
function QuickReview({ userId, now }: { userId: string; now: number }) {
  const { t } = useTranslation();
  const revision = useAsync(() => studentService.getRevisionQueue(userId), [userId]);
  const due = countReadyNow(revision.data ?? [], now);
  let body: ReactNode;
  if (revision.loading && !revision.data) body = <LoadingState label={t('a11y.loading')} lines={2} />;
  else if (revision.error) {
    body = (
      <div role="alert" className="flex items-center gap-3">
        <Mascot mood="oops" size="sm" />
        <Button variant="secondary" onClick={revision.reload}>
          {t('common.action.retry')}
        </Button>
      </div>
    );
  } else {
    body = (
      <div className="flex flex-col items-start gap-3">
        <p className="text-lg text-ink">{due > 0 ? t('kids.home.review.some', { count: due }) : t('kids.home.review.none')}</p>
        {due > 0 && (
          <ButtonLink to="/student/revision" variant="secondary" size="lg" leftIcon={<RefreshCw aria-hidden className="h-5 w-5" />}>
            {t('kids.learn.revision.title')}
          </ButtonLink>
        )}
      </div>
    );
  }
  return (
    <Card as="section" aria-labelledby="home-review-title" interactive>
      <h2 id="home-review-title" className="mb-3 flex items-center gap-2 text-xl font-bold text-ink">
        <RefreshCw aria-hidden className="fx-icon h-6 w-6 text-brand-600" />
        {t('kids.home.review.title')}
      </h2>
      {body}
    </Card>
  );
}

/** Small card: the last few badges (pictures with names), and a link to all of them. */
function BadgesPeek({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const recent = useAsync(() => rewardsService.listRecentBadges(userId, 3), [userId]);
  let body: ReactNode;
  if (recent.loading && !recent.data) body = <LoadingState label={t('a11y.loading')} lines={2} />;
  else if (recent.error) {
    body = (
      <div role="alert" className="flex items-center gap-3">
        <Mascot mood="oops" size="sm" />
        <Button variant="secondary" onClick={recent.reload}>
          {t('common.action.retry')}
        </Button>
      </div>
    );
  } else {
    const badges = recent.data ?? [];
    body = (
      <div className="flex flex-col items-start gap-3">
        {badges.length === 0 ? (
          <p className="text-lg text-ink">{t('kids.home.badges.none')}</p>
        ) : (
          <ul className="flex flex-wrap gap-4">
            {badges.map(({ badge }) => (
              <li key={badge.id} className="flex w-24 flex-col items-center gap-1 text-center">
                <BadgeImage badgeId={badge.id} rarity={badge.rarity} size="md" />
                <span className="text-sm font-semibold text-ink">{t(badge.titleKey)}</span>
              </li>
            ))}
          </ul>
        )}
        <Link
          to="/student/badges"
          className="inline-flex min-h-[48px] items-center rounded-md px-1 text-base font-semibold text-brand-700 underline underline-offset-4 outline-none focus-visible:shadow-focus"
        >
          {t('kids.home.badges.all')}
        </Link>
      </div>
    );
  }
  return (
    <Card as="section" aria-labelledby="home-badges-title" interactive>
      <h2 id="home-badges-title" className="mb-3 flex items-center gap-2 text-xl font-bold text-ink">
        <Award aria-hidden className="fx-icon h-6 w-6 text-accent-600" />
        {t('kids.badges.title')}
      </h2>
      {body}
    </Card>
  );
}
