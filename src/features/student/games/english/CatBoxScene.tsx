import { useEffect, useState } from 'react';
import { cn } from '@/components/ui';
import { usePrefersReducedMotion } from '@/lib/a11y';
import { Sprite } from '../engine/Sprite';
import type { SceneId } from './data/prepositions';
import { PrepositionScene } from './PrepositionScene';

interface Place { size: number; left: number; top: number }
interface Layout { boxes: Place[]; ball: Place; ballBehind?: boolean; table?: boolean }

/**
 * Stage is 13:8 and every number is a percentage: `size` and `left` of the stage width, `top` of the stage height. Sprites are square, so a
 * sprite `size` wide is `size * 1.625` tall in height percent. The sentence says "The ball is ___ the box", so the BALL is what moves
 * to the place (in, on, under...); the cat is its friend who comes to cheer once the answer is known. `on` and `under` say "the table", so
 * those two pictures draw the (token-coloured) table instead of a box.
 */
const RATIO = 13 / 8;
const BALL = 11;
const LAYOUT: Record<SceneId, Layout> = {
  in: { boxes: [{ size: 40, left: 30, top: 34 }], ball: { size: BALL, left: 44.5, top: 53 } },
  on: { boxes: [], table: true, ball: { size: BALL, left: 44.5, top: 39.5 } },
  under: { boxes: [], table: true, ball: { size: BALL, left: 44.5, top: 70 } },
  between: { boxes: [{ size: 24, left: 24, top: 56 }, { size: 24, left: 60, top: 56 }], ball: { size: BALL, left: 44.5, top: 74 } },
  behind: { boxes: [{ size: 40, left: 30, top: 34 }], ball: { size: 16, left: 54, top: 36 }, ballBehind: true },
  near: { boxes: [{ size: 30, left: 50, top: 40 }], ball: { size: BALL, left: 30, top: 72 } },
  'in front of': { boxes: [{ size: 40, left: 30, top: 20 }], ball: { size: 14, left: 43, top: 70 } },
};
const BALL_START = { left: 88, top: 76 };
const CAT = { size: 22 };
const CAT_HOME = { left: 2, top: 56 };
const CAT_CHEER = { left: 76, top: 56 };

/** CSS translate that puts a `size`-wide square element (placed at the stage's top-left) at `p`. */
const at = (size: number, p: { left: number; top: number }) => `translate(${(p.left / size) * 100}%, ${(p.top / (size * RATIO)) * 100}%)`;
const slide = 'absolute left-0 top-0 aspect-square motion-ok:transition-transform motion-ok:duration-[900ms] motion-ok:ease-out';

/**
 * Cat-and-box picture for a preposition round (replaces the plain SVG picture). The ball slides to its place when the round starts, and
 * when the answer is known the ball bounces and the cat slides over and hops. Decorative art only: the stage is one labelled picture and
 * the sentence and answers stay live text. If a sprite is missing the original SVG scene is drawn instead.
 */
export function CatBoxScene({ scene, label, answered }: { scene: SceneId; label: string; answered: boolean }) {
  const [broken, setBroken] = useState(false);
  const [ready, setReady] = useState(false);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 120);
    return () => window.clearTimeout(id);
  }, []);
  if (broken) return <PrepositionScene scene={scene} label={label} />;
  const { boxes, ball, ballBehind, table } = LAYOUT[scene];
  const settled = ready || reduced;
  const miss = () => setBroken(true);
  return (
    <div role="img" aria-label={label} className="relative mx-auto aspect-[13/8] w-full max-w-lg overflow-hidden rounded-xl border-2 border-brand-100 bg-brand-50">
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-[8%] bg-surface-sunken" />
      {table && (
        <svg aria-hidden viewBox="0 0 260 160" className="absolute inset-0 z-10 h-full w-full" strokeLinejoin="round">
          <line x1={72} x2={72} y1={102} y2={147} strokeWidth={6} className="stroke-badge-sun-800" />
          <line x1={188} x2={188} y1={102} y2={147} strokeWidth={6} className="stroke-badge-sun-800" />
          <rect x={60} y={92} width={140} height={10} rx={3} strokeWidth={3} className="fill-badge-sun-200 stroke-badge-sun-800" />
        </svg>
      )}
      {boxes.map((b) => (
        <span key={b.left} aria-hidden className="absolute z-10" style={{ left: `${b.left}%`, top: `${b.top}%`, width: `${b.size}%` }}>
          <Sprite name="box" size={128} eager onMissing={miss} className="h-auto w-full" />
        </span>
      ))}
      <span aria-hidden className={cn(slide, ballBehind ? 'z-0' : 'z-20')} style={{ width: `${ball.size}%`, transform: at(ball.size, settled ? ball : BALL_START) }}>
        <span className={cn('block h-full w-full', answered && 'motion-ok:animate-gx-hop')}>
          <svg viewBox="0 0 40 40" className="h-full w-full">
            <circle cx={20} cy={20} r={17} strokeWidth={3} className="fill-accent-500 stroke-badge-sun-800" />
            <path d="M11 17a10 10 0 0 1 8-7" fill="none" strokeWidth={3} strokeLinecap="round" className="stroke-surface" />
          </svg>
        </span>
      </span>
      <span aria-hidden className={cn(slide, 'z-30')} style={{ width: `${CAT.size}%`, transform: at(CAT.size, answered ? CAT_CHEER : CAT_HOME) }}>
        <span className={cn('block h-full w-full', answered && 'motion-ok:animate-gx-hop')} style={answered ? { animationDelay: '900ms' } : undefined}>
          <Sprite name="cat" size={128} eager onMissing={miss} className="h-full w-full" />
        </span>
      </span>
    </div>
  );
}
