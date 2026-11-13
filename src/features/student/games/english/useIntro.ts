import { useEffect, useState } from 'react';

/** True for the first `ms` after the round appears. Entrance animations run only then, so re-ordering DOM nodes later never replays them. */
export function useIntro(ms = 1400): boolean {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const id = window.setTimeout(() => setOn(false), ms);
    return () => window.clearTimeout(id);
  }, [ms]);
  return on;
}
