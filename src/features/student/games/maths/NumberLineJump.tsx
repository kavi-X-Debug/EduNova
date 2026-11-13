import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/components/ui';
import { usePrefersReducedMotion } from '@/lib/a11y';
import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { GxSparkles } from '../engine/GameFx';
import { Sprite } from '../engine/Sprite';
import { BigChoiceButton, ChoiceGroup, NumberPad, RoundFeedback, TimerBar, useGameSession, type GameSession } from '../engine';
import { makeNumberLineRound, ROUNDS_PER_PLAY, type NumberLineRound } from './numberLineJump.generator';

/** Token-coloured number line. Decorative (the question text says everything); the frog and, after answering, the jumps are drawn. */
function NumberLine({ round, showJumps, label }: { round: NumberLineRound; showJumps: boolean; label: string }) {
  const { min, max, start, jumps } = round;
  const step = 28;
  const pad = 18;
  const width = (max - min) * step + pad * 2;
  const x = (n: number) => pad + (n - min) * step;
  const y = 54;
  const labelEvery = max - min > 10 ? 5 : 1;
  const stops = jumps.reduce<number[]>((acc, j) => [...acc, acc[acc.length - 1] + j], [start]);
  return (
    <svg role="img" aria-label={label} viewBox={`0 0 ${width} 100`} className="h-auto w-full">
      <line x1={x(min) - 8} x2={x(max) + 8} y1={y} y2={y} className="stroke-ink-soft" strokeWidth={3} strokeLinecap="round" />
      {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((n) => (
        <g key={n}>
          <line x1={x(n)} x2={x(n)} y1={y - 7} y2={y + 7} className="stroke-ink-soft" strokeWidth={2} />
          {(n % labelEvery === 0 || n === start) && (
            <text x={x(n)} y={y + 30} textAnchor="middle" fontSize={16} className="fill-ink">
              {n}
            </text>
          )}
        </g>
      ))}
      {showJumps &&
        stops.slice(1).map((to, i) => {
          const from = stops[i];
          const mid = (x(from) + x(to)) / 2;
          return <path key={i} d={`M ${x(from)} ${y - 8} Q ${mid} ${y - 46} ${x(to)} ${y - 8}`} fill="none" strokeWidth={3} strokeDasharray="6 4" className="stroke-brand-500" />;
        })}
      {showJumps && <circle cx={x(stops[stops.length - 1])} cy={y} r={9} className="fill-success-500 stroke-success-700" strokeWidth={2} />}
      <circle cx={x(start)} cy={y} r={showJumps ? 5 : 7} className="fill-badge-leaf-400 stroke-badge-leaf-800" strokeWidth={3} />
    </svg>
  );
}

const HOP_MS = 700;
const FROG_PX = 56;

/**
 * The pond scene around the number line (all pictures decorative; the question and the answer are text).
 * Waiting: the frog sits on its lily pad and bobs. After the answer the frog hops along the real jumps, one arc per
 * jump with a soft squash on landing. Wrong: a small wobble first, then it still hops to the right place. Right: sparkle and a star.
 * With reduced motion the frog simply appears at the end. A missing sprite file just disappears.
 */
function FrogScene({ round, status, label }: { round: NumberLineRound; status: GameSession<NumberLineRound>['status']; label: string }) {
  const reduced = usePrefersReducedMotion();
  const { min, max, start, jumps } = round;
  const stops = jumps.reduce<number[]>((acc, j) => [...acc, acc[acc.length - 1] + j], [start]);
  const last = stops.length - 1;
  const pct = (n: number) => ((18 + (n - min) * 28) / ((max - min) * 28 + 36)) * 100;
  const [hopStep, setStep] = useState(0);
  const [hopping, setHopping] = useState(false);
  const answered = status !== 'asking';
  const wrong = status === 'wrong';
  const step = reduced && answered ? last : hopStep;

  useEffect(() => {
    if (!answered) return;
    if (reduced) return;
    const timers: number[] = [];
    const lead = wrong ? 750 : 250;
    for (let i = 1; i <= last; i++) {
      const at = lead + (i - 1) * HOP_MS;
      timers.push(window.setTimeout(() => { setStep(i); setHopping(true); }, at));
      timers.push(window.setTimeout(() => setHopping(false), at + 560));
    }
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [answered, wrong, reduced, last]);

  const arrived = answered && step === last;
  const frogAt = pct(stops[step]);
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-brand-100 bg-gradient-to-b from-brand-50 to-success-50 px-2 pb-2 pt-16">
      <Sprite name="sun" size={48} className="absolute right-2 top-2 motion-ok:animate-gx-maths-shine" />
      <div className="relative">
        <NumberLine round={round} showJumps={answered} label={label} />
        {/* Lily pads: the start, then each landing once the frog has reached it. */}
        {stops.map((n, i) => (
          <span
            key={i}
            aria-hidden
            className={cn('pointer-events-none absolute top-[54%] h-0 w-0 transition-opacity duration-300', i === 0 || (answered && i <= step) ? 'opacity-100' : 'opacity-0')}
            style={{ left: `${pct(n)}%` }}
          >
            <Sprite name="lily-pad" size={34} className="absolute -left-[17px] -top-[10px] h-[34px] w-[34px]" />
          </span>
        ))}
        {/* The flag shows only when the frog has landed on the answer. */}
        <span aria-hidden className={cn('pointer-events-none absolute top-[54%] h-0 w-0 transition-opacity duration-300', arrived ? 'opacity-100' : 'opacity-0')} style={{ left: `${pct(stops[last])}%` }}>
          <Sprite name="finish-flag" size={40} className="absolute -top-[52px] left-3 h-10 w-10 origin-bottom-left motion-ok:animate-gx-maths-wave" />
        </span>
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-[54%] h-0 motion-ok:transition-transform motion-ok:duration-500 motion-ok:ease-in-out" style={{ transform: `translateX(${frogAt}%)` }}>
          <span key={step} className={cn('absolute -left-7 h-14 w-14', step > 0 && 'motion-ok:animate-gx-maths-hop')} style={{ top: -(FROG_PX - 4) }}>
            <span className={cn('absolute inset-0', wrong && answered && step === 0 && 'motion-ok:animate-gx-maths-wobble')}>
              <Sprite name="frog" size={FROG_PX} className={cn('absolute inset-0 h-full w-full', hopping && 'opacity-0', !answered && 'motion-ok:animate-gx-bob')} />
              <Sprite name="frog-jump" size={FROG_PX} className={cn('absolute inset-0 h-full w-full', !hopping && 'opacity-0')} />
            </span>
            {arrived && status === 'right' && (
              <>
                <GxSparkles />
                <Sprite name="star" size={28} className="absolute -top-6 left-3.5 h-7 w-7 motion-ok:animate-gx-star-pop" />
              </>
            )}
          </span>
        </span>
      </div>
    </div>
  );
}

function RoundView({ session }: { session: GameSession<NumberLineRound> }) {
  const t = useT();
  const { round, status } = session;
  const [typed, setTyped] = useState('');
  const [picked, setPicked] = useState<number | null>(null);
  const asking = status === 'asking';
  const why = t('games.maths.numberLineJump.explain', { start: round.start, sum: round.sum, answer: round.answer });
  const lineLabel = t('games.maths.numberLineJump.lineLabel', { min: round.min, max: round.max, start: round.start });

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xl font-bold text-ink">{t('games.maths.numberLineJump.start', { start: round.start })}</p>
      <ul aria-label={t('games.maths.numberLineJump.jumps')} className="flex flex-wrap gap-3">
        {round.jumps.map((j, i) => (
          <li key={i} className="inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-brand-100 bg-brand-50 px-4 py-2 text-lg font-bold text-brand-700">
            {j > 0 ? <ArrowRight aria-hidden className="h-6 w-6" /> : <ArrowLeft aria-hidden className="h-6 w-6" />}
            {t(j > 0 ? 'games.maths.numberLineJump.right' : 'games.maths.numberLineJump.left', { n: Math.abs(j) })}
          </li>
        ))}
      </ul>
      <FrogScene round={round} status={status} label={lineLabel} />
      {session.extraChallenge && asking && <TimerBar key={session.index} seconds={30} onElapsed={() => session.answer(false, why)} />}
      <p className="text-xl font-bold text-ink">{t('games.maths.numberLineJump.question')}</p>
      {round.mode === 'choose' ? (
        <ChoiceGroup label={t('games.maths.numberLineJump.question')}>
          {round.options.map((o) => (
            <BigChoiceButton
              key={o}
              disabled={!asking}
              state={asking ? 'idle' : o === round.answer ? 'right' : o === picked ? 'wrong' : 'dim'}
              onClick={() => {
                setPicked(o);
                session.answer(o === round.answer, why);
              }}
            >
              {o}
            </BigChoiceButton>
          ))}
        </ChoiceGroup>
      ) : (
        <NumberPad
          value={typed}
          onChange={setTyped}
          disabled={!asking}
          allowNegative
          maxLength={3}
          label={t('games.maths.numberLineJump.answerLabel')}
          onSubmit={() => session.answer(Number(typed) === round.answer, why)}
        />
      )}
      <RoundFeedback session={session} />
    </div>
  );
}

/** Reference game: see docs/GAMES-AUTHORING.md. The session lives here; per-round state lives in RoundView (remounted per round). */
export default function NumberLineJump(props: GameComponentProps) {
  void props; // level and seed reach the session through <GameShell>
  const session = useGameSession<NumberLineRound>({ rounds: ROUNDS_PER_PLAY, makeRound: makeNumberLineRound });
  return <RoundView key={session.index} session={session} />;
}
