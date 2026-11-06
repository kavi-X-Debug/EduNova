import { cn } from './cn';

export interface AvatarProps {
  /** Person's name: used for initials and accessible name. */
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg' };

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('');
  return src ? (
    <img src={src} alt={name} className={cn('rounded-full object-cover', sizes[size], className)} />
  ) : (
    <span role="img" aria-label={name} className={cn('inline-flex items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700', sizes[size], className)}>
      <span aria-hidden>{initials}</span>
    </span>
  );
}
