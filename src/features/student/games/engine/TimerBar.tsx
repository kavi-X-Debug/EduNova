import { useEffect, useRef, useState } from 'react';
import { Hourglass } from 'lucide-react';
import { useGt as useT } from '@/features/student/games/useGt';
import { useGameContext } from './GameContext';

/**
 * Gentle optional timer for the "extra challenge" mode (OFF by default: render it only when `session.extraChallenge`).
 * A calm bar that shrinks once a second (no flashing, no sound, no big red end). It pauses while the game is paused.
 * When the time is used up it calls `onElapsed` once: treat that as "let's look at the answer together" (e.g. call
 * `session.answer(false, explanation)`), never as a penalty. Remount it per round with `key={session.index}`.
 */
export function TimerBar({ seconds, onElapsed }: { seconds: number; onElapsed: () => void }) {
  const t = useT();
  const { paused } = useGameContext();
  const [left, setLeft] = useState(seconds);
  const done = useRef(false);
  const cb = useRef(onElapsed);
  useEffect(() => {
    cb.current = onElapsed;
  });

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [paused]);

  useEffect(() => {
    if (left === 0 && !done.current) {
      done.current = true;
      cb.current();
    }
  }, [left]);

  return (
    <div className="flex items-center gap-3" role="timer" aria-label={t('games.timer.label')}>
      <Hourglass aria-hidden className="h-6 w-6 shrink-0 text-ink-soft" />
      <div aria-hidden className="h-3 flex-1 overflow-hidden rounded-full bg-surface-sunken">
        <div className="h-full rounded-full bg-brand-500 transition-[width] duration-slow ease-standard motion-reduce:transition-none" style={{ width: `${(left / seconds) * 100}%` }} />
      </div>
      <span className="w-14 text-right text-base font-bold tabular-nums text-ink-soft">{t('games.timer.seconds', { count: left })}</span>
    </div>
  );
}
