import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Check } from 'lucide-react';
import { BigActionButton, cn } from '@/components/ui';
import { focusRing } from '@/components/ui/cn';
import { announce } from '@/lib/a11y';
import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { playSound, RoundFeedback, useGameSession, type GameSession } from '../engine';
import { Sprite } from '../engine/Sprite';
import { useIntro } from './useIntro';
import { makeStoryRound, ROUNDS_PER_PLAY, type StoryRound } from './storySequence.generator';

const moveCls = cn('flex h-14 w-14 items-center justify-center rounded-xl border-2 border-brand-100 bg-surface text-brand-700 hover:border-brand-500 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40', focusRing);

/**
 * A little path from sunrise (the start of the story) to school (the end). It stays quiet while the child orders the cards (it never shows
 * which card is right); when the order is right the path lights up piece by piece and the school hops. Decorative.
 */
function StoryPath({ steps, lit }: { steps: number; lit: boolean }) {
  return (
    <div aria-hidden className="flex items-center gap-1">
      <Sprite name="sunrise" size={56} eager className="h-14 w-14 motion-ok:animate-gx-english-hover" />
      {Array.from({ length: steps }, (_, i) => (
        <span key={i} className="flex min-w-0 flex-1 items-center gap-1">
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line-strong">
            {lit && <span className="block h-full origin-left rounded-full bg-brand-600 motion-ok:animate-gx-english-grow" style={{ animationDelay: `${i * 260}ms` }} />}
          </span>
          <span className={cn('h-3 w-3 shrink-0 rounded-full', lit ? 'bg-brand-600 motion-ok:animate-gx-pop' : 'bg-line-strong')} style={lit ? { animationDelay: `${i * 260 + 300}ms` } : undefined} />
        </span>
      ))}
      <span className={lit ? 'inline-flex motion-ok:animate-gx-hop' : 'inline-flex'} style={lit ? { animationDelay: `${steps * 260}ms` } : undefined}>
        <Sprite name="school" size={56} eager className="h-14 w-14" />
      </span>
    </div>
  );
}

function RoundView({ session }: { session: GameSession<StoryRound> }) {
  const t = useT();
  const { round, status } = session;
  const asking = status === 'asking';
  const [order, setOrder] = useState<number[]>(round.order); // order[pos] = index into round.steps
  const root = useRef<HTMLOListElement>(null);
  const refocus = useRef<string | null>(null);
  const intro = useIntro(1800);

  useEffect(() => {
    if (!refocus.current) return;
    const el = root.current?.querySelector<HTMLButtonElement>(refocus.current);
    refocus.current = null;
    if (el && !el.disabled) el.focus();
  });

  const move = (pos: number, by: -1 | 1) => {
    const to = pos + by;
    if (!asking || to < 0 || to >= order.length) return;
    const next = [...order];
    [next[pos], next[to]] = [next[to], next[pos]];
    setOrder(next);
    playSound('tap');
    const step = order[pos];
    refocus.current = `[data-move="${step}-${by < 0 ? 'up' : 'down'}"]`;
    // At the top or bottom the same button is disabled: fall back to the other one.
    if ((by < 0 && to === 0) || (by > 0 && to === order.length - 1)) refocus.current = `[data-move="${step}-${by < 0 ? 'down' : 'up'}"]`;
    announce(t('games.english.storySequence.moved', { item: round.steps[step], n: to + 1, total: order.length }));
  };

  const check = () => {
    if (!asking) return;
    const right = order.every((s, pos) => s === pos);
    session.answer(right, t('games.english.storySequence.explain', { first: round.steps[0] }));
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xl font-bold text-ink">{t('games.english.storySequence.prompt')}</p>
      <StoryPath steps={order.length} lit={status === 'right'} />
      <ol ref={root} aria-label={t('games.english.storySequence.list')} className="flex flex-col gap-3">
        {order.map((step, pos) => (
          <li
            key={step}
            className={cn('flex items-center gap-3 rounded-xl border-2 border-brand-100 bg-surface p-3', intro && 'motion-ok:animate-gx-rise', status === 'right' && 'motion-ok:animate-gx-hop')}
            style={intro || status === 'right' ? { animationDelay: `${pos * (status === 'right' ? 260 : 110)}ms` } : undefined}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-surface">
              <span aria-hidden>{pos + 1}</span>
              <span className="sr-only">{t('games.english.storySequence.stepNumber', { n: pos + 1 })}</span>
            </span>
            <span lang="en" className="flex-1 text-lg font-bold text-ink">
              {round.steps[step]}
            </span>
            <button type="button" data-move={`${step}-up`} disabled={!asking || pos === 0} aria-label={t('games.english.storySequence.up', { item: round.steps[step] })} onClick={() => move(pos, -1)} className={moveCls}>
              <ArrowUp aria-hidden className="h-6 w-6" />
            </button>
            <button type="button" data-move={`${step}-down`} disabled={!asking || pos === order.length - 1} aria-label={t('games.english.storySequence.down', { item: round.steps[step] })} onClick={() => move(pos, 1)} className={moveCls}>
              <ArrowDown aria-hidden className="h-6 w-6" />
            </button>
          </li>
        ))}
      </ol>
      {asking && (
        <div>
          <BigActionButton icon={<Check />} onClick={check}>
            {t('games.english.common.check')}
          </BigActionButton>
        </div>
      )}
      {status === 'wrong' && (
        <div>
          <p className="mb-2 text-lg font-bold text-ink">{t('games.english.storySequence.rightOrder')}</p>
          <ol lang="en" className="list-decimal space-y-1 pl-6 text-lg text-ink">
            {round.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>
      )}
      <RoundFeedback session={session} />
    </div>
  );
}

export default function StorySequence(props: GameComponentProps) {
  void props;
  const session = useGameSession<StoryRound>({ rounds: ROUNDS_PER_PLAY, makeRound: makeStoryRound });
  return <RoundView key={session.index} session={session} />;
}
