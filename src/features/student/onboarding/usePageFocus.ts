import { useEffect, useRef } from 'react';
import { announce } from '@/lib/a11y';

/** Moves focus to the page <h1> on mount (route change) and announces its text. */
export function usePageFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const h1 = ref.current?.querySelector('h1');
    if (!h1) return;
    h1.setAttribute('tabindex', '-1');
    h1.classList.add('outline-none');
    h1.focus({ preventScroll: true });
    if (h1.textContent) announce(h1.textContent);
  }, []);
  return ref;
}
