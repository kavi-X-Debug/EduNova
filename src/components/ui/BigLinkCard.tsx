import type { ComponentType, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn, focusRing } from './cn';

export interface BigLinkCardProps {
  to: string;
  /** Big picture (lucide icon component). Decorative: the title carries the meaning. */
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  /** Short title (2-4 words), already translated. */
  title: string;
  /** One short sentence, already translated. */
  description?: string;
  /** Optional small thing on the right, e.g. a "3 ready" badge. */
  aside?: ReactNode;
  className?: string;
}

/** A whole-card link for hub pages: big icon tile, short title, one sentence, chevron. 80px+ tall. */
export function BigLinkCard({ to, icon: Icon, title, description, aside, className }: BigLinkCardProps) {
  return (
    <Link
      to={to}
      className={cn(
        'group/card flex min-h-[88px] items-center gap-4 rounded-xl border border-line bg-surface p-4 shadow-card transition duration-base ease-standard hover:border-line-strong hover:shadow-fx-glow motion-ok:hover:-translate-y-1 motion-ok:focus-visible:-translate-y-1',
        focusRing,
        className,
      )}
    >
      <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        <Icon aria-hidden className="fx-icon h-8 w-8" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xl font-bold text-ink">{title}</span>
        {description && <span className="mt-0.5 block text-base text-ink-soft">{description}</span>}
      </span>
      {aside}
      <ChevronRight aria-hidden className="h-6 w-6 shrink-0 text-ink-faint transition-transform duration-base ease-standard motion-ok:group-hover/card:translate-x-1" />
    </Link>
  );
}
