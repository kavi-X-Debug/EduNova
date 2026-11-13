import { useEffect, useState, type CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/components/ui';
import { Sprite } from '../engine/Sprite';
import { GxSparkles } from '../engine/GameFx';
import { Glyph } from './art';
import { SPRITE_OF } from './sprites';
import type { RoundStatus } from '../engine';

/**
 * Flow-sprite scenes for the science games. All decorative (aria-hidden): every name and meaning is also real text elsewhere on the screen.
 * Motion is gx-science-* / gx-* (tailwind.config.ts), gentle, finite, behind `motion-ok:` (so still with reduced motion).
 */

/** True `ms` after `on` became true (so a sparkle can follow a slide). */
function useAfter(on: boolean, ms: number) {
  const [late, setLate] = useState(false);
  useEffect(() => {
    if (!on) return;
    const id = window.setTimeout(() => setLate(true), ms);
    return () => window.clearTimeout(id);
  }, [on, ms]);
  return late;
}

const dx = (px: number): CSSProperties => ({ ['--gx-dx' as string]: `${px}px` });

const stage = 'relative flex w-full max-w-sm items-center justify-center overflow-hidden rounded-xl border-2 border-brand-100 bg-brand-50';

/* ---------------------------------- Magnet lab ---------------------------------- */

/** A magnet that wiggles. `pull`: after the answer the paper clip slides to it (the wood block stays put). `pickup`: just the magnet. */
export function MagnetStage({ kind, status }: { kind: 'pull' | 'pickup'; status: RoundStatus }) {
  const done = status !== 'asking';
  const sparkle = useAfter(status === 'right', 1200);
  return (
    <div aria-hidden className={cn(stage, 'h-28 gap-10')}>
      <span className="relative inline-flex">
        <Sprite name="magnet" size={kind === 'pickup' ? 88 : 72} eager className="motion-ok:animate-gx-science-wiggle" />
        {sparkle && <GxSparkles />}
      </span>
      {kind === 'pull' && (
        <>
          <Sprite name="paper-clip" size={52} className={cn(done && 'motion-ok:animate-gx-science-slide')} style={dx(-34)} />
          <Sprite name="wood-block" size={52} />
        </>
      )}
    </div>
  );
}

/** Two bar-magnet sprites facing each other: after the answer they slide together (attract) or gently apart (repel). */
export function MagnetPolesStage({ attract, status }: { attract: boolean; status: RoundStatus }) {
  const done = status !== 'asking';
  const sparkle = useAfter(status === 'right', 1200);
  const move = attract ? 16 : 10;
  return (
    <div aria-hidden className={cn(stage, 'h-20 gap-10')}>
      <Sprite name="magnet" size={56} className={cn(done && 'motion-ok:animate-gx-science-slide')} style={dx(attract ? move : -move)} />
      <span className="relative inline-flex -scale-x-100">
        <Sprite name="magnet" size={56} className={cn(done && 'motion-ok:animate-gx-science-slide')} style={dx(attract ? move : -move)} />
        {sparkle && <GxSparkles />}
      </span>
    </div>
  );
}

/* ------------------------------ Light and shadows ------------------------------ */

/** A desk lamp with a softly breathing glow, a giraffe and its shadow on the wall (the shadow stretches once after the answer). */
export function LightScene({ status }: { status: RoundStatus }) {
  const done = status !== 'asking';
  return (
    <div aria-hidden className="relative h-36 w-full max-w-md overflow-hidden rounded-xl border-2 border-brand-100 bg-badge-sky-200">
      <span className="absolute bottom-0 right-0 top-0 w-1/4 bg-surface" />
      <span className="absolute left-[5%] top-3 h-24 w-24 rounded-full bg-badge-sun-200 opacity-60 motion-ok:animate-gx-science-breathe" />
      <Sprite name="desk-lamp" size={84} eager className="absolute left-[7%] top-5" />
      <Sprite name="giraffe" size={88} eager className="absolute bottom-1 left-[40%]" />
      <Sprite
        name="giraffe"
        size={80}
        eager
        className={cn('absolute bottom-1 right-[6%] origin-bottom opacity-30 brightness-0', done && 'motion-ok:animate-gx-science-stretch')}
      />
    </div>
  );
}

/** Glass sheets at three levels: light passes (clear), some passes (frosted), none (dark). The words come from the bin names. */
export function GlassLegend({ bins }: { bins: Array<{ id: string; label: string }> }) {
  const look: Record<string, string> = { transparent: 'opacity-100', translucent: 'opacity-40', opaque: 'brightness-50 grayscale' };
  return (
    <ul aria-hidden className="flex flex-wrap justify-center gap-3">
      {bins.map((b) => (
        <li key={b.id} className="flex flex-col items-center gap-1 text-base font-semibold text-ink-soft">
          <Sprite name="glass-sheet" size={48} className={look[b.id]} />
          <span>{b.label}</span>
        </li>
      ))}
    </ul>
  );
}

/* ---------------------------------- Sound detective ---------------------------------- */

/** The detective owl tilts its head now and then. */
export function OwlPicture({ size = 96 }: { size?: number }) {
  return (
    <span aria-hidden className="inline-flex">
      <Sprite name="owl-detective" size={size} eager className="origin-bottom motion-ok:animate-gx-science-tilt" />
    </span>
  );
}

/** The instrument for an "either" round: drum bounces with ripple rings when answered, bell swings; anything else keeps its icon. */
export function SoundItemPicture({ item, status }: { item: string; status: RoundStatus }) {
  const done = status !== 'asking';
  if (item === 'drum') {
    return (
      <span aria-hidden className="relative inline-flex h-16 w-16 items-center justify-center">
        {done &&
          [0, 280, 560].map((d) => (
            <span key={d} className="absolute inset-0 rounded-full border-2 border-brand-500 opacity-0 motion-ok:animate-gx-science-ripple" style={{ animationDelay: `${d}ms` }} />
          ))}
        <Sprite key={String(done)} name="drum" size={64} eager className={cn('relative', done ? 'motion-ok:animate-gx-hop' : 'motion-ok:animate-gx-bob')} />
      </span>
    );
  }
  if (item === 'smallBell') {
    return (
      <span aria-hidden className="inline-flex">
        <Sprite key={String(done)} name="bell" size={64} eager className="origin-top motion-ok:animate-gx-science-swing" />
      </span>
    );
  }
  return <Glyph id={item} className="h-14 w-14 text-brand-600" size={56} />;
}

/* ---------------------------------- Water cycle ---------------------------------- */

/** Sun, rain cloud, mountain and a water drop. When the order is right the drop travels up to the cloud and rains back down. */
export function WaterCycleScene({ status }: { status: RoundStatus }) {
  const right = status === 'right';
  return (
    <div aria-hidden className="relative h-36 w-[300px] max-w-full overflow-hidden rounded-xl border-2 border-brand-100 bg-badge-sky-200">
      <Sprite name="sun" size={60} eager className="absolute left-2 top-1 motion-ok:animate-gx-bob" />
      <Sprite name="rain-cloud" size={76} eager className="absolute left-[176px] top-0 motion-ok:animate-gx-bob" style={{ animationDelay: '1s' }} />
      <Sprite name="mountain" size={92} eager className="absolute bottom-5 left-[84px]" />
      <span className="absolute inset-x-0 bottom-0 h-6 bg-badge-sky-400" />
      <Sprite key={String(right)} name="water-drop" size={30} eager className={cn('absolute bottom-[26px] left-4', right && 'motion-ok:animate-gx-science-travel')} />
    </div>
  );
}

/* ---------------------------------- Food chain ---------------------------------- */

/** The creatures of a chain, each idling. Once built right: arrows pulse and each creature does a tiny hop, one after another. */
export function ChainStrip({ ids, status }: { ids: string[]; status: RoundStatus }) {
  const right = status === 'right';
  return (
    <div aria-hidden className="flex flex-wrap items-center justify-center gap-1.5">
      {ids.map((id, i) => (
        <span key={`${id}-${status}`} className="flex items-center gap-1.5">
          <span
            className={cn(
              'inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-50',
              right ? 'motion-ok:animate-gx-hop' : 'motion-ok:animate-gx-bob',
            )}
            style={{ animationDelay: right ? `${i * 450}ms` : `${i * 600}ms` }}
          >
            {SPRITE_OF[id] ? <Sprite name={SPRITE_OF[id]} size={48} fallback={<Glyph id={id} className="h-8 w-8 text-brand-600" />} /> : <Glyph id={id} className="h-8 w-8 text-brand-600" />}
          </span>
          {i < ids.length - 1 && status !== 'asking' && (
            <ArrowRight className={cn('h-6 w-6 shrink-0 text-brand-600', right && 'motion-ok:animate-gx-science-arrow')} style={right ? { animationDelay: `${i * 450 + 300}ms` } : undefined} />
          )}
        </span>
      ))}
    </div>
  );
}

/* ---------------------------------- Circuit ---------------------------------- */

const slot = 'relative inline-flex h-16 w-16 items-center justify-center rounded-xl';

/** Battery, switch and bulb as little sprites. Missing parts are dashed empty slots; the bulb glows softly when lit; the switch lever clicks when the circuit is complete. */
export function CircuitSprites({ battery, bulb, sw, lit }: { battery: boolean; bulb: boolean; sw: 'closed' | 'open' | 'none'; lit: boolean }) {
  const empty = <span className={cn(slot, 'border-2 border-dashed border-ink-soft bg-surface-muted')} />;
  const wire = <span className="h-1 w-5 rounded-full bg-ink-soft" />;
  return (
    <div aria-hidden className="flex items-center justify-center">
      {battery ? <Sprite name="battery" size={64} /> : empty}
      {wire}
      {sw === 'none' ? empty : <Sprite key={String(lit)} name="switch" size={64} className={cn(sw === 'open' && '-rotate-12', sw === 'closed' && lit && 'motion-ok:animate-gx-science-click')} />}
      {wire}
      {bulb ? (
        <span className={slot}>
          {lit && <span className="absolute -inset-2 rounded-full bg-badge-sun-400/50 opacity-75 motion-ok:animate-gx-science-lit" />}
          <Sprite name="light-bulb" size={64} className={cn('relative', !lit && 'brightness-75 saturate-50')} />
        </span>
      ) : (
        empty
      )}
    </div>
  );
}
