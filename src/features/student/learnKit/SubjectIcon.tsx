import { useState } from 'react';
import { cn } from '@/components/ui';
import { subjectImage, subjectStyle } from './subjects';

const BOX = { sm: 'h-10 w-10', md: 'h-12 w-12', lg: 'h-14 w-14 md:h-16 md:w-16' } as const;
const PX = { sm: 40, md: 48, lg: 64 } as const;
const GLYPH = { sm: 'h-6 w-6', md: 'h-7 w-7', lg: 'h-8 w-8' } as const;
const failed = new Set<string>();

/**
 * Subject picture: the Google Flow icon at /subjects/<subject>.png (also `trail` and `atom`). If the image is missing
 * or fails to load, or the subject has none, the lucide icon on a colour tile is shown instead. Decorative (aria-hidden):
 * the subject name always sits next to it. Put `group` on the parent to get the gentle hover wiggle (not under reduced motion).
 */
export function SubjectIcon({ subject, size = 'md', className }: { subject: string; size?: keyof typeof BOX; className?: string }) {
  const [, force] = useState(0);
  const image = subjectImage(subject);
  if (image && !failed.has(subject)) {
    return (
      <span aria-hidden className={cn('inline-flex shrink-0', BOX[size], className)}>
        <img
          src={image}
          alt=""
          width={PX[size]}
          height={PX[size]}
          decoding="async"
          loading="lazy"
          draggable={false}
          className="h-full w-full select-none rounded-lg object-contain motion-ok:animate-fx-pop-in motion-ok:group-hover:animate-fx-wiggle"
          onError={() => {
            failed.add(subject);
            force((n) => n + 1);
          }}
        />
      </span>
    );
  }
  const { icon: Icon, tile } = subjectStyle(subject);
  return (
    <span aria-hidden className={cn('flex shrink-0 items-center justify-center rounded-lg', BOX[size], tile, className)}>
      <Icon className={GLYPH[size]} />
    </span>
  );
}
