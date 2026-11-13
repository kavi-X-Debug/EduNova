import { useEffect, useRef, useState, type ComponentType } from 'react';
import { useLocation } from 'react-router-dom';
import { BookOpen, Gamepad2, House, MessageCircleQuestionMark, UserRound } from 'lucide-react';
import { BigActionButton, Button, Mascot, Modal, cn } from '@/components/ui';
import type { MascotMood } from '@/components/ui';
import { useT } from '@/i18n';
import type { TKey } from '@/i18n';
import { announce } from '@/lib/a11y';
import { useSessionStore } from '@/store';
import { useTourStore } from './useTourStore';

interface Step {
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  mood: MascotMood;
  title: TKey;
  text: TKey;
}

/** 5 short steps: what Home is, how to start a lesson, where to ask, where badges live, how to see it again. */
const STEPS: Step[] = [
  { icon: House, mood: 'wave', title: 'kids.tour.s1.title', text: 'kids.tour.s1.text' },
  { icon: BookOpen, mood: 'happy', title: 'kids.tour.s2.title', text: 'kids.tour.s2.text' },
  { icon: MessageCircleQuestionMark, mood: 'thinking', title: 'kids.tour.s3.title', text: 'kids.tour.s3.text' },
  { icon: Gamepad2, mood: 'cheer', title: 'kids.tour.s4.title', text: 'kids.tour.s4.text' },
  { icon: UserRound, mood: 'happy', title: 'kids.tour.s5.title', text: 'kids.tour.s5.text' },
];

/**
 * Mounted once in the student area. Opens by itself the first time a student reaches Home, and again
 * whenever Me > "Show me around" calls `useTourStore.getState().openTour()`.
 */
export function TourHost() {
  const user = useSessionStore((s) => s.user);
  const { pathname } = useLocation();
  const done = useTourStore((s) => (user ? s.doneBy[user.id] === true : true));
  const open = useTourStore((s) => s.open);
  const autoTried = useRef(false);

  useEffect(() => {
    if (autoTried.current || !user || user.role !== 'student' || done || pathname !== '/student') return;
    // Let the Home page settle first so the tour does not fight the route's own focus move.
    const id = window.setTimeout(() => {
      autoTried.current = true; // set when it fires, so a StrictMode remount does not cancel it for good
      useTourStore.getState().openTour();
    }, 600);
    return () => window.clearTimeout(id);
  }, [user, done, pathname]);

  if (!open || !user) return null;
  return <WelcomeTour userId={user.id} />;
}

function WelcomeTour({ userId }: { userId: string }) {
  const t = useT();
  const [index, setIndex] = useState(0);
  const step = STEPS[index];
  const last = index === STEPS.length - 1;
  const finish = useTourStore((s) => s.finish);
  const Icon = step.icon;

  const close = () => {
    finish(userId);
    announce(t('kids.tour.finished'));
    // If nothing took focus back (the tour opened by itself), land on the page heading rather than the page top.
    window.setTimeout(() => {
      if (document.activeElement === document.body) document.querySelector<HTMLElement>('main h1')?.focus();
    }, 0);
  };

  // Announce each step (polite) without moving focus off the button the child just pressed.
  useEffect(() => {
    announce(t('kids.tour.announce', { current: index + 1, total: STEPS.length, title: t(step.title), text: t(step.text) }));
    // Only when the step changes; a language switch mid-tour must not re-announce.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <Modal
      open
      onClose={close}
      title={t(step.title)}
      closeLabel={t('kids.tour.skip')}
      footer={
        <>
          <Button variant="ghost" size="lg" onClick={close} className="me-auto">
            {t('kids.tour.skip')}
          </Button>
          {index > 0 && (
            <Button variant="secondary" size="xl" onClick={() => setIndex(index - 1)}>
              {t('kids.tour.back')}
            </Button>
          )}
          <BigActionButton onClick={last ? close : () => setIndex(index + 1)}>{last ? t('kids.tour.finish') : t('kids.tour.next')}</BigActionButton>
        </>
      }
    >
      <p className="mb-3 text-sm font-semibold text-ink-soft">{t('kids.tour.step', { current: index + 1, total: STEPS.length })}</p>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="flex shrink-0 items-end gap-2">
          <Mascot key={index} mood={step.mood} size="lg" />
          <span aria-hidden className="mb-2 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 text-brand-700 motion-ok:animate-fx-pop-in">
            <Icon aria-hidden className="h-8 w-8" />
          </span>
        </div>
        <p className="text-lg text-ink">{t(step.text)}</p>
      </div>
      <div aria-hidden className="mt-5 flex justify-center gap-2">
        {STEPS.map((s, i) => (
          <span key={s.title} className={cn('h-2.5 rounded-full transition-all duration-base ease-standard', i === index ? 'w-6 bg-brand-600' : 'w-2.5 bg-line-strong')} />
        ))}
      </div>
    </Modal>
  );
}
