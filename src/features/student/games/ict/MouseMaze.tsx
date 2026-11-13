import { useRef, useState } from 'react';
import { MousePointerClick } from 'lucide-react';
import { cn } from '@/components/ui';
import { focusRing } from '@/components/ui/cn';
import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { DragDropZone, RoundFeedback, playSound, useGameSession, type GameSession } from '../engine';
import { ShapeIcon } from './ictArt';
import { makeMouseRound, ROUNDS_PER_PLAY, type MouseRound, type Shape } from './mouseMaze.generator';

const P = 'games.ict.mouseMaze';
/** Two clicks on the same shape this close together (ms) count as a double-click: works for mouse, touch and Enter twice. */
const DOUBLE_MS = 800;

function RoundView({ session }: { session: GameSession<MouseRound> }) {
  const t = useT();
  const { round, status } = session;
  const asking = status === 'asking';
  const [placements, setPlacements] = useState<Record<string, string | null>>({});
  const [hint, setHint] = useState('');
  const [firstClick, setFirstClick] = useState(false);
  const last = useRef<{ shape: Shape; at: number } | null>(null);
  const name = (s: Shape) => t(`${P}.shape.${s}`);
  const instruction = t(`${P}.act.${round.action}`, { shape: name(round.target) });
  const wrong = (picked: Shape) => t(`${P}.explainWrong`, { picked: name(picked), shape: name(round.target) });

  const pick = (shape: Shape, at: number) => {
    if (!asking) return;
    if (shape !== round.target) return session.answer(false, wrong(shape));
    if (round.action === 'click') return session.answer(true);

    if (last.current && last.current.shape === shape && at - last.current.at < DOUBLE_MS) return session.answer(true);
    last.current = { shape, at };
    setFirstClick(true);
    setHint(t(`${P}.onceMore`));
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="flex items-center gap-3 text-xl font-bold text-ink">
        <MousePointerClick aria-hidden className="h-7 w-7 shrink-0 text-brand-600" />
        <span>{instruction}</span>
      </p>
      {round.action === 'drag' ? (
        <DragDropZone
          label={instruction}
          disabled={!asking}
          items={round.shapes.map((s) => ({ id: s, text: name(s), label: <span className="flex items-center gap-2"><ShapeIcon shape={s} className="h-8 w-8" />{name(s)}</span> }))}
          zones={[{ id: 'box', label: t(`${P}.box`), capacity: 1 }]}
          placements={placements}
          onPlace={(id, zone) => {
            setPlacements((p) => ({ ...p, [id]: zone }));
            if (zone) session.answer(id === round.target, id === round.target ? undefined : wrong(id as Shape));
          }}
        />
      ) : (
        <div role="group" aria-label={t(`${P}.board`)} className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {round.shapes.map((s) => {
            const isTarget = s === round.target;
            return (
              <button
                key={s}
                type="button"
                disabled={!asking}
                onClick={(e) => {
                  playSound('tap');
                  pick(s, e.timeStamp);
                }}
                className={cn(
                  'flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border-2 bg-surface px-3 py-4 text-lg font-bold text-ink transition duration-fast ease-standard motion-ok:active:scale-[0.97]',
                  focusRing,
                  !asking && isTarget ? 'border-success-700 bg-success-50' : 'border-brand-100 hover:border-brand-500 hover:bg-brand-50',
                  !asking && !isTarget && 'opacity-60',
                )}
              >
                <ShapeIcon shape={s} className="h-14 w-14" />
                <span>{name(s)}</span>
              </button>
            );
          })}
        </div>
      )}
      {round.action === 'double' && asking && (
        <div className="flex flex-col items-start gap-2">
          <p className="text-base text-ink-soft">{t(`${P}.tipKeys`, { tab: 'Tab', enter: 'Enter' })}</p>
          {firstClick && (
            <button
              type="button"
              onClick={() => session.answer(true)}
              className={cn('min-h-14 rounded-xl border-2 border-dashed border-brand-600 bg-brand-50 px-5 py-2 text-lg font-bold text-brand-700', focusRing)}
            >
              {t(`${P}.altDouble`)}
            </button>
          )}
        </div>
      )}
      <p role="status" aria-live="polite" className="min-h-6 text-lg font-bold text-brand-700">
        {asking ? hint : ''}
      </p>
      <RoundFeedback session={session} />
    </div>
  );
}

/** Mouse Maze: click, double-click and drag shapes. Every move has a keyboard or button alternative. See docs/GAMES-AUTHORING.md. */
export default function MouseMaze(props: GameComponentProps) {
  void props;
  const session = useGameSession<MouseRound>({ rounds: ROUNDS_PER_PLAY, makeRound: makeMouseRound });
  return <RoundView key={session.index} session={session} />;
}
