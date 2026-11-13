import type { ReactNode } from 'react';
import { cn } from '@/components/ui';
import type { PictureId } from './data/words';

// Simple, original, token-coloured pictures (no hex, no external files). Drawn in a 100 x 100 box.
const rays = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4;
  return { x1: 50 + Math.cos(a) * 30, y1: 50 + Math.sin(a) * 30, x2: 50 + Math.cos(a) * 42, y2: 50 + Math.sin(a) * 42 };
});

const ART: Record<PictureId, ReactNode> = {
  tree: (
    <>
      <rect x={44} y={56} width={12} height={34} rx={3} className="fill-badge-sun-800" />
      <circle cx={50} cy={38} r={26} className="fill-badge-leaf-400 stroke-badge-leaf-800" strokeWidth={3} />
      <circle cx={33} cy={54} r={15} className="fill-badge-leaf-400 stroke-badge-leaf-800" strokeWidth={3} />
      <circle cx={67} cy={54} r={15} className="fill-badge-leaf-400 stroke-badge-leaf-800" strokeWidth={3} />
      <circle cx={50} cy={46} r={20} className="fill-badge-leaf-400" />
    </>
  ),
  flower: (
    <>
      <path d="M50 92 V48" className="stroke-badge-leaf-600" strokeWidth={5} strokeLinecap="round" fill="none" />
      <path d="M50 76 Q30 70 26 56 Q44 56 50 76 Z" className="fill-badge-leaf-400 stroke-badge-leaf-800" strokeWidth={2} />
      <path d="M50 70 Q70 64 74 50 Q56 50 50 70 Z" className="fill-badge-leaf-400 stroke-badge-leaf-800" strokeWidth={2} />
      {[0, 72, 144, 216, 288].map((deg) => (
        <circle key={deg} cx={50 + Math.cos(((deg - 90) * Math.PI) / 180) * 15} cy={34 + Math.sin(((deg - 90) * Math.PI) / 180) * 15} r={11} className="fill-badge-bloom-400 stroke-badge-bloom-800" strokeWidth={2} />
      ))}
      <circle cx={50} cy={34} r={9} className="fill-badge-sun-400 stroke-badge-sun-600" strokeWidth={2} />
    </>
  ),
  book: (
    <>
      <rect x={16} y={22} width={68} height={58} rx={5} className="fill-brand-500 stroke-brand-700" strokeWidth={3} />
      <rect x={24} y={29} width={52} height={44} rx={2} className="fill-surface" />
      <path d="M50 29 V73" className="stroke-brand-600" strokeWidth={3} />
      {[40, 50, 60].map((y) => (
        <g key={y} className="stroke-line-strong" strokeWidth={3} strokeLinecap="round">
          <path d={`M30 ${y} H44`} />
          <path d={`M56 ${y} H70`} />
        </g>
      ))}
    </>
  ),
  sun: (
    <>
      {rays.map((r, i) => (
        <line key={i} {...r} className="stroke-badge-sun-600" strokeWidth={5} strokeLinecap="round" />
      ))}
      <circle cx={50} cy={50} r={22} className="fill-badge-sun-400 stroke-badge-sun-600" strokeWidth={3} />
    </>
  ),
  moon: <path d="M62 14 A38 38 0 1 0 86 64 A30 30 0 0 1 62 14 Z" className="fill-badge-sun-200 stroke-badge-sun-600" strokeWidth={3} strokeLinejoin="round" />,
  star: <polygon points="50,10 61,38 91,38 67,56 76,86 50,68 24,86 33,56 9,38 39,38" className="fill-badge-sun-400 stroke-badge-sun-600" strokeWidth={3} strokeLinejoin="round" />,
  cat: (
    <>
      <polygon points="22,40 24,12 44,28" className="fill-ink-faint stroke-ink-soft" strokeWidth={3} strokeLinejoin="round" />
      <polygon points="78,40 76,12 56,28" className="fill-ink-faint stroke-ink-soft" strokeWidth={3} strokeLinejoin="round" />
      <circle cx={50} cy={56} r={30} className="fill-ink-faint stroke-ink-soft" strokeWidth={3} />
      <circle cx={39} cy={52} r={4} className="fill-ink" />
      <circle cx={61} cy={52} r={4} className="fill-ink" />
      <polygon points="45,62 55,62 50,68" className="fill-danger-500" />
      <path d="M50 68 V72 M50 72 Q44 78 38 74 M50 72 Q56 78 62 74" className="stroke-ink" strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d="M18 60 H34 M18 68 H34 M66 60 H82 M66 68 H82" className="stroke-ink-soft" strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  bird: (
    <>
      <path d="M18 56 L4 48 L8 64 Z" className="fill-badge-sky-600" />
      <ellipse cx={46} cy={58} rx={30} ry={22} className="fill-badge-sky-400 stroke-badge-sky-800" strokeWidth={3} />
      <circle cx={70} cy={38} r={15} className="fill-badge-sky-400 stroke-badge-sky-800" strokeWidth={3} />
      <polygon points="82,34 96,40 82,46" className="fill-badge-sun-400 stroke-badge-sun-600" strokeWidth={2} strokeLinejoin="round" />
      <circle cx={72} cy={35} r={3} className="fill-ink" />
      <path d="M30 56 Q46 36 58 62 Q42 70 30 56 Z" className="fill-badge-sky-200 stroke-badge-sky-800" strokeWidth={2} />
      <path d="M40 80 V92 M54 80 V92" className="stroke-badge-sun-600" strokeWidth={3} strokeLinecap="round" />
    </>
  ),
  house: (
    <>
      <rect x={20} y={46} width={60} height={42} className="fill-badge-sun-200 stroke-badge-sun-800" strokeWidth={3} />
      <polygon points="12,48 50,14 88,48" className="fill-brand-600 stroke-brand-700" strokeWidth={3} strokeLinejoin="round" />
      <rect x={42} y={62} width={16} height={26} rx={2} className="fill-badge-sun-800" />
      <rect x={26} y={54} width={12} height={12} className="fill-badge-sky-200 stroke-badge-sky-800" strokeWidth={2} />
      <rect x={62} y={54} width={12} height={12} className="fill-badge-sky-200 stroke-badge-sky-800" strokeWidth={2} />
    </>
  ),
  ball: (
    <>
      <circle cx={50} cy={50} r={36} className="fill-danger-500 stroke-danger-700" strokeWidth={3} />
      <path d="M16 40 Q50 62 84 40" className="stroke-surface" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M22 72 Q50 50 78 72" className="stroke-surface" strokeWidth={4} fill="none" strokeLinecap="round" />
    </>
  ),
  mango: (
    <>
      <path d="M50 22 Q56 10 66 12 Q62 22 52 24 Z" className="fill-badge-leaf-600 stroke-badge-leaf-800" strokeWidth={2} />
      <path d="M50 24 Q18 22 18 58 Q18 88 52 88 Q86 84 84 52 Q82 26 50 24 Z" className="fill-badge-sun-400 stroke-badge-sun-600" strokeWidth={3} />
      <path d="M30 44 Q34 34 44 32" className="stroke-badge-sun-200" strokeWidth={4} fill="none" strokeLinecap="round" />
    </>
  ),
  umbrella: (
    <>
      <path d="M8 54 A42 42 0 0 1 92 54 Q80 46 71 54 Q60 46 50 54 Q40 46 29 54 Q20 46 8 54 Z" className="fill-brand-500 stroke-brand-700" strokeWidth={3} strokeLinejoin="round" />
      <path d="M50 54 V82 Q50 92 40 90" className="stroke-ink-soft" strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M50 12 V6" className="stroke-ink-soft" strokeWidth={4} strokeLinecap="round" />
    </>
  ),
  cup: (
    <>
      <path d="M72 38 H80 Q92 38 92 52 Q92 66 74 66" className="stroke-brand-600" strokeWidth={6} fill="none" />
      <path d="M18 32 H74 V56 Q74 82 46 82 Q18 82 18 56 Z" className="fill-surface stroke-brand-600" strokeWidth={4} strokeLinejoin="round" />
      <path d="M26 44 H66" className="stroke-brand-100" strokeWidth={6} strokeLinecap="round" />
      <ellipse cx={46} cy={90} rx={34} ry={5} className="fill-brand-100" />
    </>
  ),
  fish: (
    <>
      <polygon points="70,50 94,30 94,70" className="fill-accent-500 stroke-warning-700" strokeWidth={3} strokeLinejoin="round" />
      <ellipse cx={44} cy={50} rx={32} ry={22} className="fill-accent-500 stroke-warning-700" strokeWidth={3} />
      <path d="M40 30 Q50 14 60 30 Z" className="fill-warning-500 stroke-warning-700" strokeWidth={2} />
      <circle cx={26} cy={44} r={4} className="fill-ink" />
      <path d="M40 38 Q48 50 40 62 M52 36 Q60 50 52 64" className="stroke-warning-700" strokeWidth={2} fill="none" strokeLinecap="round" />
    </>
  ),
  river: (
    <>
      <rect x={0} y={0} width={100} height={30} className="fill-badge-leaf-400" />
      <rect x={0} y={70} width={100} height={30} className="fill-badge-leaf-400" />
      <path d="M0 50 Q25 32 50 50 T100 50" className="stroke-badge-sky-400" strokeWidth={26} fill="none" />
      <path d="M8 50 Q28 38 46 50 M60 52 Q76 42 92 50" className="stroke-badge-sky-200" strokeWidth={3} fill="none" strokeLinecap="round" />
    </>
  ),
  mountain: (
    <>
      <polygon points="4,86 38,22 72,86" className="fill-ink-faint stroke-ink-soft" strokeWidth={3} strokeLinejoin="round" />
      <polygon points="50,86 74,40 98,86" className="fill-badge-leaf-600 stroke-badge-leaf-800" strokeWidth={3} strokeLinejoin="round" />
      <polygon points="38,22 29,40 36,37 40,42 46,36" className="fill-surface" />
    </>
  ),
  grass: (
    <>
      <path d="M6 90 H94" className="stroke-badge-sun-800" strokeWidth={4} strokeLinecap="round" />
      {[16, 30, 44, 58, 72, 86].map((x, i) => (
        <path key={x} d={`M${x} 90 Q${x + (i % 2 ? 6 : -6)} ${60 - (i % 3) * 8} ${x + (i % 2 ? 2 : -2)} ${28 + (i % 3) * 8}`} className="stroke-badge-leaf-600" strokeWidth={6} fill="none" strokeLinecap="round" />
      ))}
    </>
  ),
  ladder: (
    <>
      <rect x={28} y={8} width={9} height={86} rx={3} className="fill-badge-sun-800" />
      <rect x={63} y={8} width={9} height={86} rx={3} className="fill-badge-sun-800" />
      {[24, 42, 60, 78].map((y) => (
        <rect key={y} x={32} y={y} width={36} height={7} rx={2} className="fill-badge-sun-600 stroke-badge-sun-800" strokeWidth={2} />
      ))}
    </>
  ),
  bell: (
    <>
      <circle cx={50} cy={12} r={6} className="fill-badge-sun-600" />
      <path d="M50 16 Q28 16 28 46 Q28 62 14 74 H86 Q72 62 72 46 Q72 16 50 16 Z" className="fill-badge-sun-400 stroke-badge-sun-600" strokeWidth={3} strokeLinejoin="round" />
      <circle cx={50} cy={82} r={8} className="fill-badge-sun-600" />
    </>
  ),
};

/** A picture. Decorative by default; pass `label` (translated) when it carries meaning on its own. */
export function SinhalaPicture({ id, label, className }: { id: PictureId; label?: string; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} className={cn('h-auto w-full', className)}>
      {ART[id]}
    </svg>
  );
}
