import type { SceneId } from './data/prepositions';

const BOX = 'fill-brand-100 stroke-brand-700';
const TABLE = 'fill-badge-sun-200 stroke-badge-sun-800';
const BALL = 'fill-accent-500 stroke-badge-sun-800';

/** Token-coloured picture of a ball in a place. The floor is at y=140; the box is open at the top, drawn from the front. */
export function PrepositionScene({ scene, label }: { scene: SceneId; label: string }) {
  const table = (
    <g strokeWidth={3} strokeLinejoin="round">
      <rect x={60} y={100} width={140} height={10} rx={3} className={TABLE} />
      <line x1={72} x2={72} y1={110} y2={140} className="stroke-badge-sun-800" strokeWidth={6} />
      <line x1={188} x2={188} y1={110} y2={140} className="stroke-badge-sun-800" strokeWidth={6} />
    </g>
  );
  const box = (x: number, w = 80, h = 60) => <rect x={x} y={140 - h} width={w} height={h} rx={4} strokeWidth={3} className={BOX} />;
  const ball = (cx: number, cy: number, r = 16) => <circle cx={cx} cy={cy} r={r} strokeWidth={3} className={BALL} />;
  return (
    <svg role="img" aria-label={label} viewBox="0 0 260 175" className="mx-auto h-auto w-full max-w-lg">
      <rect x={0} y={140} width={260} height={35} className="fill-surface-sunken" />
      <line x1={0} x2={260} y1={140} y2={140} strokeWidth={2} className="stroke-ink-soft" />
      {scene === 'in' && (
        <>
          <rect x={90} y={64} width={80} height={76} rx={4} strokeWidth={3} className="fill-brand-50 stroke-brand-700" />
          {ball(130, 96, 18)}
          <rect x={90} y={108} width={80} height={32} rx={4} strokeWidth={3} className={BOX} />
        </>
      )}
      {scene === 'on' && (
        <>
          {table}
          {ball(130, 84)}
        </>
      )}
      {scene === 'under' && (
        <>
          {table}
          {ball(130, 126, 14)}
        </>
      )}
      {scene === 'between' && (
        <>
          {box(30, 60)}
          {box(170, 60)}
          {ball(130, 124)}
        </>
      )}
      {scene === 'behind' && (
        <>
          {ball(165, 92, 24)}
          {box(80)}
        </>
      )}
      {scene === 'near' && (
        <>
          {box(60)}
          {ball(200, 124)}
        </>
      )}
      {scene === 'in front of' && (
        <>
          {box(90)}
          {ball(130, 154, 14)}
        </>
      )}
    </svg>
  );
}
