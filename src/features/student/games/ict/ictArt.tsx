import type { FlowSymbol } from './flowchartBuilder.generator';
import type { FolderType } from './folderSorter.generator';
import type { Shape } from './mouseMaze.generator';
import { KEY_ROWS } from './keyboardExplorer.generator';

/** Token-coloured SVG pictures for the ICT games. All decorative (aria-hidden): the text next to them carries the meaning. */

export function KeyCap({ label, className = 'h-24 w-auto' }: { label: string; className?: string }) {
  const wide = label.length > 1 && !/^[↑↓←→]$/.test(label);
  const w = wide ? 150 : 80;
  return (
    <svg aria-hidden focusable="false" viewBox={`0 0 ${w + 8} 92`} className={className}>
      <rect x={4} y={10} width={w} height={74} rx={14} className="fill-brand-100 stroke-brand-600" strokeWidth={3} />
      <rect x={10} y={10} width={w - 12} height={58} rx={11} className="fill-surface stroke-brand-500" strokeWidth={2} />
      <text x={4 + w / 2 - 3} y={50} textAnchor="middle" fontSize={wide ? 22 : 34} fontWeight={700} className="fill-ink">
        {label}
      </text>
    </svg>
  );
}

/** Four rows of keys with one key outlined. */
export function MiniKeyboard({ target }: { target: string }) {
  const k = 30;
  const gap = 4;
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 346 150" className="h-auto w-full max-w-md">
      {KEY_ROWS.map((row, r) =>
        row.split('').map((c, i) => {
          const x = 4 + i * (k + gap) + r * 8;
          const y = 4 + r * (k + gap);
          const hot = c === target;
          return (
            <g key={c}>
              <rect x={x} y={y} width={k} height={k} rx={6} strokeWidth={hot ? 4 : 1.5} className={hot ? 'fill-badge-sun-400 stroke-ink' : 'fill-brand-50 stroke-brand-100'} />
              <text x={x + k / 2} y={y + 21} textAnchor="middle" fontSize={16} fontWeight={hot ? 800 : 500} className="fill-ink">
                {c}
              </text>
            </g>
          );
        }),
      )}
    </svg>
  );
}

const SHAPE_STYLE: Record<Shape, string> = {
  star: 'fill-badge-sun-400 stroke-badge-sun-800',
  circle: 'fill-badge-sky-400 stroke-badge-sky-800',
  square: 'fill-badge-leaf-400 stroke-badge-leaf-800',
  triangle: 'fill-badge-bloom-400 stroke-badge-bloom-800',
  heart: 'fill-badge-bloom-200 stroke-badge-bloom-800',
  moon: 'fill-badge-sun-200 stroke-badge-sun-800',
};
export function ShapeIcon({ shape, className = 'h-10 w-10' }: { shape: Shape; className?: string }) {
  const s = SHAPE_STYLE[shape];
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 48 48" className={className}>
      {shape === 'star' && <path d="M24 4 29.5 17.5 44 18.5 33 28 36.5 42 24 34.5 11.5 42 15 28 4 18.5 18.5 17.5Z" className={s} strokeWidth={3} strokeLinejoin="round" />}
      {shape === 'circle' && <circle cx={24} cy={24} r={18} className={s} strokeWidth={3} />}
      {shape === 'square' && <rect x={7} y={7} width={34} height={34} rx={5} className={s} strokeWidth={3} />}
      {shape === 'triangle' && <path d="M24 6 42 40H6Z" className={s} strokeWidth={3} strokeLinejoin="round" />}
      {shape === 'heart' && <path d="M24 41C10 31 6 24 6 17a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 7-4 14-18 24Z" className={s} strokeWidth={3} strokeLinejoin="round" />}
      {shape === 'moon' && <path d="M30 6a18 18 0 1 0 12 28A15 15 0 0 1 30 6Z" className={s} strokeWidth={3} strokeLinejoin="round" />}
    </svg>
  );
}

const BODY = 'fill-brand-100 stroke-brand-600';
export function DeviceIcon({ id, className = 'h-12 w-12' }: { id: string; className?: string }) {
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 64 64" className={className} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round">
      {id === 'keyboard' && (
        <>
          <rect x={4} y={18} width={56} height={30} rx={5} className={BODY} />
          {[0, 1, 2, 3, 4].map((i) => <rect key={`a${i}`} x={10 + i * 9} y={24} width={6} height={6} rx={1} className="fill-surface stroke-brand-500" strokeWidth={1.5} />)}
          {[0, 1, 2, 3, 4].map((i) => <rect key={`b${i}`} x={13 + i * 9} y={33} width={6} height={6} rx={1} className="fill-surface stroke-brand-500" strokeWidth={1.5} />)}
        </>
      )}
      {id === 'mouse' && (
        <>
          <rect x={18} y={8} width={28} height={48} rx={14} className={BODY} />
          <path d="M32 8v20M18 28h28" className="stroke-brand-600" fill="none" />
        </>
      )}
      {id === 'microphone' && (
        <>
          <rect x={24} y={6} width={16} height={30} rx={8} className={BODY} />
          <path d="M16 30a16 16 0 0 0 32 0M32 46v10M22 56h20" className="stroke-brand-600" fill="none" />
        </>
      )}
      {id === 'monitor' && (
        <>
          <rect x={6} y={8} width={52} height={36} rx={5} className={BODY} />
          <rect x={11} y={13} width={42} height={26} rx={2} className="fill-badge-sky-200 stroke-badge-sky-600" strokeWidth={2} />
          <path d="M32 44v8M20 54h24" className="stroke-brand-600" fill="none" />
        </>
      )}
      {id === 'printer' && (
        <>
          <rect x={16} y={6} width={32} height={18} rx={2} className="fill-surface stroke-brand-600" />
          <rect x={6} y={22} width={52} height={24} rx={5} className={BODY} />
          <rect x={16} y={38} width={32} height={18} rx={2} className="fill-surface stroke-brand-600" />
          <path d="M22 45h20M22 50h14" className="stroke-brand-500" strokeWidth={2} fill="none" />
        </>
      )}
      {id === 'speaker' && (
        <>
          <rect x={14} y={6} width={36} height={52} rx={7} className={BODY} />
          <circle cx={32} cy={22} r={5} className="fill-surface stroke-brand-600" />
          <circle cx={32} cy={42} r={10} className="fill-surface stroke-brand-600" />
        </>
      )}
      {id === 'cpu' && (
        <>
          <rect x={14} y={14} width={36} height={36} rx={5} className={BODY} />
          <rect x={23} y={23} width={18} height={18} rx={3} className="fill-badge-sun-200 stroke-badge-sun-800" strokeWidth={2} />
          <path d="M22 8v6M32 8v6M42 8v6M22 50v6M32 50v6M42 50v6M8 22h6M8 32h6M8 42h6M50 22h6M50 32h6M50 42h6" className="stroke-brand-600" fill="none" />
        </>
      )}
      {id === 'disk' && (
        <>
          <rect x={8} y={14} width={48} height={36} rx={6} className={BODY} />
          <circle cx={26} cy={32} r={11} className="fill-surface stroke-brand-600" />
          <circle cx={26} cy={32} r={3} className="fill-brand-500 stroke-brand-600" strokeWidth={1.5} />
          <path d="M40 24l8 6" className="stroke-brand-600" fill="none" />
        </>
      )}
    </svg>
  );
}

export function FlowSymbolIcon({ symbol, className = 'h-12 w-20' }: { symbol: FlowSymbol; className?: string }) {
  const c = 'fill-brand-50 stroke-brand-600';
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 80 48" className={className} strokeWidth={3} strokeLinejoin="round">
      {symbol === 'terminator' && <rect x={4} y={8} width={72} height={32} rx={16} className={c} />}
      {symbol === 'process' && <rect x={6} y={8} width={68} height={32} rx={2} className={c} />}
      {symbol === 'decision' && <path d="M40 3 76 24 40 45 4 24Z" className={c} />}
      {symbol === 'io' && <path d="M18 8H76L62 40H4Z" className={c} />}
    </svg>
  );
}

export function FileIcon({ type, className = 'h-6 w-6' }: { type: FolderType; className?: string }) {
  const fill = { pictures: 'fill-badge-leaf-200 stroke-badge-leaf-800', music: 'fill-badge-bloom-200 stroke-badge-bloom-800', documents: 'fill-badge-sky-200 stroke-badge-sky-800', videos: 'fill-badge-sun-200 stroke-badge-sun-800' }[type];
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 24 24" className={className} strokeWidth={2} strokeLinejoin="round">
      <path d="M5 2h9l5 5v15H5Z" className={fill} />
      {type === 'pictures' && <path d="M7 18l4-5 3 3 2-2 2 4Z" className="fill-ink-soft stroke-none" />}
      {type === 'music' && <path d="M10 17V9l6-2v8M10 17a2 2 0 1 1-2-2M16 15a2 2 0 1 1-2-2" fill="none" className="stroke-ink" />}
      {type === 'documents' && <path d="M8 12h8M8 15h8M8 18h5" className="stroke-ink" fill="none" />}
      {type === 'videos' && <path d="M10 11l5 3-5 3Z" className="fill-ink stroke-ink" />}
    </svg>
  );
}

export function FolderIcon({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 28 28" className={className} strokeWidth={2} strokeLinejoin="round">
      <path d="M2 7a2 2 0 0 1 2-2h6l3 3h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z" className="fill-badge-sun-400 stroke-badge-sun-800" />
    </svg>
  );
}
