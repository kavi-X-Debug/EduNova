import { useState } from 'react';
import { cn } from './cn';
import { mascotSrc } from './mascotAssets';

export type MascotMood = 'happy' | 'thinking' | 'cheer' | 'oops' | 'sleepy' | 'wave';
export type MascotSize = 'sm' | 'md' | 'lg';

export interface MascotProps {
  mood?: MascotMood;
  size?: MascotSize;
  /** Give a translated description to expose Nova to screen readers. Omit (default) to keep it decorative (aria-hidden). */
  label?: string;
  /** Idle movement (gentle float / one wiggle). Always behind `motion-ok:`, so reduced motion shows it still. Default true. */
  animate?: boolean;
  className?: string;
}

const SIZES: Record<MascotSize, string> = { sm: 'h-12 w-12', md: 'h-20 w-20', lg: 'h-32 w-32' };
/** Rendered pixel size per size (the PNGs are 400 x 400); used for width/height attributes so nothing shifts while loading. */
const PX: Record<MascotSize, number> = { sm: 48, md: 80, lg: 128 };
const src = (mood: MascotMood) => mascotSrc(mood);
const failed = new Set<MascotMood>();

/** Finite, soft animations from tailwind.config.ts (fx-*); nothing flashes or loops forever. */
const IDLE: Record<MascotMood, string> = {
  happy: 'motion-ok:animate-fx-float',
  thinking: 'motion-ok:animate-fx-float',
  cheer: 'motion-ok:animate-fx-wiggle',
  oops: '',
  sleepy: 'motion-ok:animate-fx-float',
  wave: 'motion-ok:animate-fx-wave origin-bottom',
};

const line = 'fill-none stroke-ink';

/**
 * Nova, the friendly helper. Shows the Google Flow pose at /mascot/nova-<mood>.png; if the image is missing or fails to
 * load, the built-in vector Nova (MascotSvg, tokens only, no hex) is drawn instead. Decorative by default: the message
 * always lives in the text next to it.
 * Motion (all behind `motion-ok:`, so none with reduced motion): a gentle idle bob, a small pop when the mood changes
 * or Nova first appears, and one wave tilt for the wave pose.
 */
export function Mascot({ mood = 'happy', size = 'md', label, animate = true, className }: MascotProps) {
  const [, force] = useState(0);
  const useImage = !failed.has(mood);
  const px = PX[size];
  return (
    <span
      className={cn('inline-flex shrink-0', SIZES[size], animate && IDLE[mood], className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <span key={mood} className={cn('flex h-full w-full', animate && 'motion-ok:animate-fx-pop-in')}>
        {useImage ? (
          <img
            src={src(mood)}
            alt=""
            width={px}
            height={px}
            decoding="async"
            draggable={false}
            className="h-full w-full select-none object-contain"
            onError={() => {
              failed.add(mood);
              force((n) => n + 1);
            }}
          />
        ) : (
          <MascotSvg mood={mood} />
        )}
      </span>
    </span>
  );
}

function MascotSvg({ mood }: { mood: MascotMood }) {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden
      focusable="false"
      className="h-full w-full"
    >
      {/* ground shadow */}
      <ellipse cx="60" cy="108" rx="30" ry="5" className="fill-ink/10" />
      {/* antenna with a little star */}
      <path d="M60 24 V13" className="fill-none stroke-brand-700" strokeWidth="4" strokeLinecap="round" />
      <path d="M60 2 L62.8 8 L69 8.8 L64.4 13 L65.6 19 L60 16 L54.4 19 L55.6 13 L51 8.8 L57.2 8 Z" className="fill-accent-500" />
      {/* arms (cheer lifts them) */}
      {mood === 'wave' ? (
        <>
          <path d="M96 72 Q114 60 108 40" className="fill-none stroke-brand-600" strokeWidth="9" strokeLinecap="round" />
          <circle cx="19" cy="66" r="8" className="fill-brand-600" />
        </>
      ) : mood === 'cheer' ? (
        <>
          <path d="M24 72 Q6 62 10 42" className="fill-none stroke-brand-600" strokeWidth="9" strokeLinecap="round" />
          <path d="M96 72 Q114 62 110 42" className="fill-none stroke-brand-600" strokeWidth="9" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="19" cy="66" r="8" className="fill-brand-600" />
          <circle cx="101" cy="66" r="8" className="fill-brand-600" />
        </>
      )}
      {/* feet */}
      <ellipse cx="46" cy="101" rx="11" ry="6" className="fill-brand-700" />
      <ellipse cx="74" cy="101" rx="11" ry="6" className="fill-brand-700" />
      {/* body */}
      <rect x="22" y="24" width="76" height="76" rx="36" className="fill-brand-500" />
      {/* face plate */}
      <ellipse cx="60" cy="58" rx="31" ry="26" className="fill-surface" />
      {/* cheeks */}
      <circle cx="39" cy="67" r="4.5" className="fill-danger-500/25" />
      <circle cx="81" cy="67" r="4.5" className="fill-danger-500/25" />

      {(mood === 'happy' || mood === 'wave') && (
        <>
          <Eye cx={48} cy={54} />
          <Eye cx={72} cy={54} />
          <path d="M49 65 Q60 77 71 65" className={line} strokeWidth="3.5" strokeLinecap="round" />
        </>
      )}
      {mood === 'thinking' && (
        <>
          <path d="M40 44 Q47 40 54 44" className={line} strokeWidth="3" strokeLinecap="round" />
          <Eye cx={50} cy={53} dx={2} dy={-2} />
          <Eye cx={72} cy={53} dx={2} dy={-2} />
          <path d="M54 69 H67" className={line} strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="94" cy="30" r="3" className="fill-brand-100" />
          <circle cx="102" cy="20" r="4" className="fill-brand-100" />
          <circle cx="111" cy="8" r="5" className="fill-brand-100" />
        </>
      )}
      {mood === 'cheer' && (
        <>
          <path d="M41 56 Q48 46 55 56" className={line} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M65 56 Q72 46 79 56" className={line} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M47 63 Q60 84 73 63 Z" className="fill-ink" />
          <path d="M53 72 Q60 80 67 72 Q60 68 53 72 Z" className="fill-danger-500" />
          <Sparkle x={14} y={22} />
          <Sparkle x={106} y={24} />
        </>
      )}
      {mood === 'oops' && (
        <>
          <path d="M39 45 L53 50" className={line} strokeWidth="3" strokeLinecap="round" />
          <path d="M81 45 L67 50" className={line} strokeWidth="3" strokeLinecap="round" />
          <Eye cx={48} cy={57} />
          <Eye cx={72} cy={57} />
          <path d="M49 72 Q54.5 65 60 72 T71 72" className={line} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M93 34 Q99 44 93 48 Q87 44 93 34 Z" className="fill-badge-sky-400" />
        </>
      )}
      {mood === 'sleepy' && (
        <>
          <path d="M41 56 Q48 62 55 56" className={line} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M65 56 Q72 62 79 56" className={line} strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="60" cy="69" rx="3.5" ry="3" className="fill-ink/70" />
          <path d="M88 30 H98 L88 42 H98" className="fill-none stroke-brand-600" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M101 14 H108 L101 22 H108" className="fill-none stroke-brand-600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

function Eye({ cx, cy, dx = 0, dy = 0 }: { cx: number; cy: number; dx?: number; dy?: number }) {
  return (
    <>
      <circle cx={cx + dx} cy={cy + dy} r="5" className="fill-ink" />
      <circle cx={cx + dx + 1.6} cy={cy + dy - 1.8} r="1.6" className="fill-surface" />
    </>
  );
}

function Sparkle({ x, y }: { x: number; y: number }) {
  return <path d={`M${x} ${y - 8} L${x + 2.5} ${y - 2.5} L${x + 8} ${y} L${x + 2.5} ${y + 2.5} L${x} ${y + 8} L${x - 2.5} ${y + 2.5} L${x - 8} ${y} L${x - 2.5} ${y - 2.5} Z`} className="fill-accent-500" />;
}
