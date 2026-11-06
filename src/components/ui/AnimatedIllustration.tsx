import { cn } from './cn';

export type IllustrationName =
  | 'learning-twin'
  | 'learning-path'
  | 'quest-map'
  | 'mastery-celebration'
  | 'revision-decay'
  | 'hero-learning-companion';

const SRC: Record<IllustrationName, string> = {
  'learning-twin': '/animations/learning-twin.svg',
  'learning-path': '/animations/learning-path.svg',
  'quest-map': '/animations/quest-map.svg',
  'mastery-celebration': '/animations/mastery-celebration.svg',
  'revision-decay': '/animations/revision-decay.svg',
  'hero-learning-companion': '/images/hero-learning-companion.svg',
};

export interface AnimatedIllustrationProps {
  name: IllustrationName;
  /** Required. Use alt="" only if the meaning is also given as adjacent text. */
  alt: string;
  className?: string;
}

/** SVGs honour prefers-reduced-motion internally. Never the only signal: pair with text. */
export function AnimatedIllustration({ name, alt, className }: AnimatedIllustrationProps) {
  return <img src={SRC[name]} alt={alt} loading="lazy" className={cn('h-auto max-w-full', className)} />;
}
