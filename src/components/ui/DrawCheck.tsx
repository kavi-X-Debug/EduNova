import { cn } from './cn';

/** Decorative completion tick that draws itself once (stroke-dashoffset). Static when motion is reduced. Pair with text. */
export function DrawCheck({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={cn('h-4 w-4', className)}>
      <circle cx="12" cy="12" r="9.5" strokeWidth={2} className="opacity-30" />
      <path d="M7.5 12.5l3 3 6-6.5" pathLength={1} strokeDasharray={1} strokeDashoffset={0} className="motion-ok:animate-fx-draw" />
    </svg>
  );
}
