import { useRef, type ReactNode, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, LoadingState, Mascot, MascotMessage, cn, type MascotMood } from '@/components/ui';

/** Friendly loading state: Nova is thinking, plain words. */
export function KidLoading() {
  const { t } = useTranslation();
  return (
    <div aria-busy="true" className="flex flex-col gap-5">
      <MascotMessage mood="thinking" size="md">
        {t('kidslearn.loading')}
      </MascotMessage>
      <LoadingState label={t('a11y.loading')} lines={3} />
    </div>
  );
}

/** Plain-word error with Nova looking sorry and one big retry button. */
export function KidError({ onRetry, body }: { onRetry?: () => void; body?: string }) {
  const { t } = useTranslation();
  const text = body ?? t('kidslearn.error.body');
  return (
    <div role="alert" className="flex flex-col gap-5">
      <MascotMessage mood="oops" size="lg" speakText={text}>
        <span className="block text-xl font-bold">{t('kidslearn.error.title')}</span>
        <span className="mt-1 block font-normal text-ink-soft">{text}</span>
      </MascotMessage>
      {onRetry && (
        <Button size="xl" onClick={onRetry} className="self-start">
          {t('common.action.retry')}
        </Button>
      )}
    </div>
  );
}

/** Empty state with Nova, a short sentence and (optionally) the one next action. */
export function KidEmpty({ mood = 'sleepy', title, body, action }: { mood?: MascotMood; title: string; body?: string; action?: ReactNode }) {
  return (
    <Card raised className="flex flex-col gap-5">
      <MascotMessage mood={mood} size="lg" speakText={body ? `${title} ${body}` : title}>
        <span className="block text-xl font-bold">{title}</span>
        {body && <span className="mt-1 block font-normal text-ink-soft">{body}</span>}
      </MascotMessage>
      {action}
    </Card>
  );
}

/** "Question 2 of 10" as a row of dots: done = filled, current = ringed, later = soft. The text says it too. */
export function DotProgress({ current, total, label, className }: { current: number; total: number; label: string; className?: string }) {
  const max = Math.min(total, 20);
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <p className="text-lg font-bold text-ink">{label}</p>
      <div role="progressbar" aria-label={label} aria-valuemin={1} aria-valuemax={total} aria-valuenow={current} aria-valuetext={label} className="flex flex-wrap gap-2">
        {Array.from({ length: max }, (_, i) => (
          <span
            key={i}
            aria-hidden
            className={cn(
              'h-3.5 w-3.5 rounded-full border-2 transition-colors duration-base motion-reduce:transition-none',
              i + 1 < current ? 'border-brand-600 bg-brand-600' : i + 1 === current ? 'border-brand-600 bg-surface ring-2 ring-brand-100 ring-offset-1' : 'border-line-strong bg-surface-sunken',
            )}
          />
        ))}
      </div>
    </div>
  );
}

/** Gentle "Great job" screen: Nova cheers, one next-step button (children). */
export function DoneScreen({ title, body, headingRef, children }: { title: string; body?: string; headingRef?: RefObject<HTMLHeadingElement | null>; children: ReactNode }) {
  const localRef = useRef<HTMLHeadingElement>(null);
  const ref = headingRef ?? localRef;
  return (
    <Card as="section" raised aria-labelledby="kid-done-title" className="flex flex-col items-center gap-5 bg-gradient-to-b from-success-50 to-surface text-center">
      <Mascot mood="cheer" size="lg" />
      <h2 id="kid-done-title" ref={ref} tabIndex={-1} className="text-3xl font-bold text-ink outline-none">
        {title}
      </h2>
      {body && <p className="max-w-prose text-lg text-ink-soft">{body}</p>}
      <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">{children}</div>
    </Card>
  );
}
