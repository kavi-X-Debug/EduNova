import { Star } from 'lucide-react';
import { cn } from '@/components/ui';
import { useGt as useT } from '@/features/student/games/useGt';

const SIZE = { sm: 'h-6 w-6', md: 'h-9 w-9', lg: 'h-14 w-14' } as const;

/**
 * Stars as a picture ("2 of 3 stars"): filled = earned, outline = not this time. The name says it too (role="img"),
 * so it never relies on colour or shape alone. Stars are the only score a child sees: never a rank or percent.
 */
export function StarsMeter({ stars, max = 3, size = 'md', className }: { stars: number; max?: number; size?: keyof typeof SIZE; className?: string }) {
  const t = useT();
  return (
    <span role="img" aria-label={t('games.stars.label', { count: stars, max })} className={cn('inline-flex items-center gap-1', className)}>
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn(SIZE[size], i < stars ? 'fill-accent-500 text-accent-600 motion-ok:animate-fx-pop-in' : 'fill-transparent text-line-strong')}
          style={i < stars ? { animationDelay: `${i * 120}ms` } : undefined}
        />
      ))}
    </span>
  );
}
