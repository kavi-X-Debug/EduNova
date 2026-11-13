import { ArrowRight } from 'lucide-react';
import { cn } from '@/components/ui';
import { GxSparkles } from '../engine/GameFx';
import { Sprite } from '../engine/Sprite';
import type { RoundStatus } from '../engine';
import type { FolderType } from './folderSorter.generator';
import { DeviceIcon, FileIcon } from './ictArt';

/**
 * Flow sprites for the ICT games (public/game-sprites). Everything is decorative (aria-hidden), the meaning stays in the text, and all
 * movement is behind `motion-ok:` (finite, gentle, transform/opacity only). A missing sprite just draws nothing.
 */

/** A friendly coach beside the activity: nods while you think, hops when you are right, gives a tiny shake when not. */
export function Coach({ status, name = 'robot', size = 72, className }: { status: RoundStatus; name?: string; size?: number; className?: string }) {
  const motion = status === 'right' ? 'motion-ok:animate-gx-hop' : status === 'wrong' ? 'motion-ok:animate-gx-nudge-x' : 'motion-ok:animate-gx-ict-nod';
  return (
    <span aria-hidden className={cn('relative inline-flex shrink-0', className)}>
      {status === 'right' && <GxSparkles />}
      <Sprite name={name} size={size} eager className={motion} />
    </span>
  );
}

/** Keyboard Explorer: the coach on the left, the screen on the right (it pops when the answer is right). */
export function ScreenBuddy({ status, size = 72, className }: { status: RoundStatus; size?: number; className?: string }) {
  return (
    <span aria-hidden className={cn('relative inline-flex shrink-0', className)}>
      {status === 'right' && <GxSparkles />}
      <Sprite name="monitor" size={size} eager className={status === 'right' ? 'motion-ok:animate-gx-pop' : undefined} />
    </span>
  );
}

/** Mouse Maze: the mouse walks one step along a dashed trail towards the cheese each round; the cursor nudges the way. */
export function MouseTrail({ index, total, status }: { index: number; total: number; status: RoundStatus }) {
  const answered = status !== 'asking';
  const p = Math.min(1, (index + (answered ? 1 : 0)) / Math.max(1, total));
  const atGoal = answered && index + 1 >= total;
  return (
    <div aria-hidden className="relative h-20 overflow-hidden rounded-xl border-2 border-brand-100 bg-brand-50">
      <span className="absolute inset-x-4 top-1/2 border-t-2 border-dashed border-line-strong" />
      <div className="absolute inset-y-0 left-2 w-[calc(100%-7rem)] ease-out motion-ok:transition-transform motion-ok:duration-[900ms]" style={{ transform: `translateX(${p * 100}%)` }}>
        <Sprite name="mouse" size={56} eager className="absolute left-0 top-1/2 -translate-y-1/2 motion-ok:animate-gx-ict-whisker" />
        <Sprite name="cursor" size={32} eager className={cn('absolute left-14 top-1/2 -translate-y-1/2', answered && 'motion-ok:animate-gx-ict-point')} />
      </div>
      <span className="absolute right-2 top-1/2 -translate-y-1/2">
        {atGoal && <GxSparkles />}
        <Sprite name="cheese" size={56} eager className={atGoal ? 'motion-ok:animate-gx-pop' : undefined} />
      </span>
    </div>
  );
}

/** Flowchart Builder (order levels): the coach, then a tiny chart. Once the order is right the arrows light up in turn and the boxes pulse. */
export function FlowStrip({ count, status }: { count: number; status: RoundStatus }) {
  const right = status === 'right';
  return (
    <div aria-hidden className="flex items-center gap-2 rounded-xl border-2 border-brand-100 bg-brand-50 px-3 py-2">
      <Coach status={status} size={56} />
      <div className="flex min-w-0 max-w-md flex-1 items-center">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="flex min-w-0 flex-1 items-center last:flex-none">
            <span
              className={cn('h-7 w-9 shrink-0 border-2 border-brand-600 bg-surface', i === 0 || i === count - 1 ? 'rounded-full' : 'rounded-sm', right && 'border-success-700 bg-success-50 motion-ok:animate-gx-ict-pulse')}
              style={right ? { animationDelay: `${i * 160}ms` } : undefined}
            />
            {i < count - 1 && (
              <span className="relative mx-1 flex min-w-4 flex-1 justify-center text-brand-600">
                <ArrowRight className="h-5 w-5 opacity-60" />
                {right && <ArrowRight className="absolute h-5 w-5 text-success-700 opacity-0 motion-ok:animate-gx-ict-flow" style={{ animationDelay: `${i * 200}ms` }} />}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** A decision diamond that pulses softly when the answer is right. */
export function DiamondBuddy({ status, size = 64 }: { status: RoundStatus; size?: number }) {
  return <Sprite name="flow-diamond" size={size} className={status === 'right' ? 'motion-ok:animate-gx-ict-pulse' : undefined} />;
}

/**
 * Safe or Unsafe? stage. The padlock clicks shut once you answer; the picture then shows what is true: a shield with a soft shimmer
 * for safe, a calm warning sign (a gentle wobble, no flashing) for unsafe. It shows the truth, not whether the child was right.
 */
export function SafeStage({ status, safe }: { status: RoundStatus; safe: boolean }) {
  const answered = status !== 'asking';
  return (
    <div aria-hidden className="flex h-24 items-center justify-center gap-6 rounded-xl border-2 border-brand-100 bg-brand-50">
      <Sprite name="padlock" size={64} eager className={answered ? 'motion-ok:animate-gx-ict-shut' : 'motion-ok:animate-gx-ict-nod'} />
      <span className="relative inline-flex h-20 w-20 items-center justify-center">
        {answered && safe && (
          <>
            <span className="absolute inset-0 rounded-full border-4 border-success-500 opacity-0 motion-ok:animate-gx-ict-ring" />
            <GxSparkles />
            <Sprite name="shield-check" size={80} className="motion-ok:animate-gx-pop" />
          </>
        )}
        {answered && !safe && <Sprite name="warning-sign" size={80} className="motion-ok:animate-gx-ict-wobble" />}
      </span>
    </div>
  );
}

/** Parts of a Computer: three friendly parts on the banner, each nodding a little out of step. */
export function PartsBanner() {
  return (
    <div aria-hidden className="flex items-end justify-center gap-5 rounded-xl border-2 border-brand-100 bg-brand-50 px-3 py-2">
      {['monitor', 'laptop', 'mouse'].map((n, i) => (
        <Sprite key={n} name={n} size={56} eager className="motion-ok:animate-gx-ict-nod" style={{ animationDelay: `${i * 500}ms` }} />
      ))}
    </div>
  );
}

const DEVICE_SPRITE: Record<string, string> = { monitor: 'monitor', mouse: 'mouse' };
/** A part's picture: the Flow sprite when there is one (monitor, mouse), otherwise the plain icon. `hop` = a small happy bounce. */
export function DeviceArt({ id, className = 'h-12 w-12', hop }: { id: string; className?: string; hop?: boolean }) {
  const sprite = DEVICE_SPRITE[id];
  if (!sprite) return <DeviceIcon id={id} className={className} />;
  return <Sprite name={sprite} size={48} className={cn(className, hop && 'motion-ok:animate-gx-hop')} />;
}

const FILE_SPRITE: Partial<Record<FolderType, string>> = { documents: 'doc-file', pictures: 'image-file', music: 'music-file' };
/** A file's picture: the Flow sprite for documents, pictures and music; the plain icon for videos. */
export function FileArt({ type, className = 'h-7 w-7' }: { type: FolderType; className?: string }) {
  const sprite = FILE_SPRITE[type];
  if (!sprite) return <FileIcon type={type} className={className} />;
  return <Sprite name={sprite} size={32} className={className} />;
}

/** A folder picture (the Flow folder). */
export function FolderArt({ className = 'h-7 w-7' }: { className?: string }) {
  return <Sprite name="folder" size={32} className={className} />;
}
