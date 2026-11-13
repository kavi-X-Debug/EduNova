import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
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
      <circle cx={x(start)} cy={y} r={showJumps ? 6 : 10} className="fill-badge-leaf-400 stroke-badge-leaf-800" strokeWidth={3} />
    </svg>
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
      <NumberLine round={round} showJumps={!asking} label={lineLabel} />
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
