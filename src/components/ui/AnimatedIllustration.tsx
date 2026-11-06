import { cn } from './cn';

export type IllustrationName =
  | 'learning-twin'
  | 'learning-path'
  | 'quest-map'
  | 'mastery-celebration'
  | 'revision-decay'
  | 'hero-learning-companion';

interface Meta {
  src: string;
  /** Natural size of the SVG viewBox; used for intrinsic width/height. */
  width: number;
  height: number;
}

const META: Record<IllustrationName, Meta> = {
  'learning-twin': { src: '/animations/learning-twin.svg', width: 480, height: 360 },
  'learning-path': { src: '/animations/learning-path.svg', width: 640, height: 200 },
  'quest-map': { src: '/animations/quest-map.svg', width: 480, height: 300 },
  'mastery-celebration': { src: '/animations/mastery-celebration.svg', width: 400, height: 300 },
  'revision-decay': { src: '/animations/revision-decay.svg', width: 560, height: 300 },
  'hero-learning-companion': { src: '/images/hero-learning-companion.svg', width: 800, height: 520 },
};

export interface AnimatedIllustrationProps {
  name: IllustrationName;
  /**
   * Required. Meaningful illustrations need non-empty alt. Use alt="" only when the same
   * meaning is given as adjacent text (a dev warning is logged for empty alt).
   */
  alt: string;
  /**
   * Rendered width in px. Height follows the aspect ratio. Recommended minimums so labels inside
   * the SVG stay legible: learning-path 480, learning-twin/quest-map/revision-decay 480,
   * mastery-celebration 280, hero 360. On narrow screens prefer full width (className="w-full").
   */
  size?: number;
  /** Set true for below-the-fold images only. Default is eager so the image never collapses to 0px. */
  lazy?: boolean;
  className?: string;
}

/** SVGs honour prefers-reduced-motion internally. Never the only signal: pair with text. */
export function AnimatedIllustration({ name, alt, size, lazy = false, className }: AnimatedIllustrationProps) {
  const m = META[name];
  if (import.meta.env.DEV && alt.trim() === '') {
    console.warn(`AnimatedIllustration "${name}": empty alt. Provide alt text or render an adjacent text equivalent.`);
  }
  return (
    <img
      src={m.src}
      alt={alt}
      width={size ?? m.width}
      height={size ? Math.round((size * m.height) / m.width) : m.height}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      style={{ aspectRatio: `${m.width} / ${m.height}` }}
      className={cn('h-auto max-w-full', className)}
    />
  );
}
