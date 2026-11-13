import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './a11y';

/** Counts a whole number up from 0 to `target` once on mount (and eases to later changes). Static when motion is reduced. */
export function useCountUp(target: number, duration = 600): number {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(reduced ? target : 0);
  const current = useRef(shown);
  useEffect(() => {
    if (reduced) return;
    const from = current.current;
    let start = 0;
    let raf = 0;
    const step = (now: number) => {
      if (!start) start = now;
      const p = Math.min(1, (now - start) / duration);
      const next = Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3)));
      current.current = next;
      setShown(next);
      if (p < 1) raf = window.requestAnimationFrame(step);
    };
    raf = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(raf);
  }, [target, duration, reduced]);
  return reduced ? target : shown;
}
