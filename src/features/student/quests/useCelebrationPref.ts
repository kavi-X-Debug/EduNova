import { useCallback, useState } from 'react';
import { usePrefersReducedMotion } from '@/lib/a11y';

const KEY = 'edunova.quests.celebrate';

function read(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}

/**
 * Celebration animations are optional (student toggle) and always skipped under
 * reduced motion. The text announcement is shown regardless.
 */
export function useCelebrationPref() {
  const reduced = usePrefersReducedMotion();
  const [enabled, setEnabledState] = useState(read);
  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
    try {
      localStorage.setItem(KEY, next ? 'on' : 'off');
    } catch {
      /* storage unavailable: preference lasts for this session only */
    }
  }, []);
  return { enabled, setEnabled, reduced, showAnimation: enabled && !reduced };
}
