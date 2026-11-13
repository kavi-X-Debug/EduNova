import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),[contenteditable="true"]';

function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute('hidden') && el.getAttribute('aria-hidden') !== 'true',
  );
}

/** Remember the focused element; returns a function that restores focus to it. */
function captureFocus(): () => void {
  const el = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  return () => {
    if (el && el.isConnected) el.focus({ preventScroll: true });
  };
}

/**
 * Trap Tab focus inside `ref` while `active`. Moves focus in on open, closes on Escape
 * (if onEscape given) and returns focus to the trigger on close.
 */
export function useFocusTrap<T extends HTMLElement>(
  ref: RefObject<T | null>,
  active: boolean,
  options: { onEscape?: () => void; initialFocus?: RefObject<HTMLElement | null> } = {},
) {
  const { onEscape, initialFocus } = options;
  const escRef = useRef(onEscape);
  useEffect(() => {
    escRef.current = onEscape;
  });

  useEffect(() => {
    const root = ref.current;
    if (!active || !root) return;
    const restore = captureFocus();
    const first = initialFocus?.current ?? getFocusable(root)[0] ?? root;
    if (first === root && !root.hasAttribute('tabindex')) root.setAttribute('tabindex', '-1');
    first.focus({ preventScroll: true });

    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' && escRef.current) {
        e.stopPropagation();
        escRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = getFocusable(root);
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const a = items[0];
      const z = items[items.length - 1];
      const cur = document.activeElement;
      if (e.shiftKey && (cur === a || !root.contains(cur))) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && (cur === z || !root.contains(cur))) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      restore();
    };
  }, [active, ref, initialFocus]);
}

/** True when the person turned on "reduce motion" in their profile (html[data-reduce-motion="true"]). */
const profileReducesMotion = (): boolean => typeof document !== 'undefined' && document.documentElement.dataset.reduceMotion === 'true';

/** Respects the OS "reduce motion" setting and the profile preference; updates live. */
export function usePrefersReducedMotion(): boolean {
  const read = () =>
    profileReducesMotion() ||
    (typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [reduced, setReduced] = useState(read);
  useEffect(() => {
    const onChange = () => setReduced(read());
    const mq = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    mq?.addEventListener('change', onChange);
    const mo = new MutationObserver(onChange);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-reduce-motion'] });
    return () => {
      mq?.removeEventListener('change', onChange);
      mo.disconnect();
    };
  }, []);
  return reduced;
}

// ---- Announcer (aria-live) -------------------------------------------------
// A single shared pair of live regions, created lazily on <body>, so any
// component can announce without rendering a region itself.
type Politeness = 'polite' | 'assertive';
const regions: Partial<Record<Politeness, HTMLElement>> = {};
const timers: Partial<Record<Politeness, number>> = {};

function getRegion(p: Politeness): HTMLElement {
  let el = regions[p];
  if (!el || !el.isConnected) {
    el = document.createElement('div');
    el.className = 'sr-only';
    el.setAttribute('aria-live', p);
    el.setAttribute('aria-atomic', 'true');
    el.setAttribute('role', p === 'assertive' ? 'alert' : 'status');
    document.body.appendChild(el);
    regions[p] = el;
  }
  return el;
}

/** Imperative announce (usable outside React). Re-announces identical messages. */
export function announce(message: string, politeness: Politeness = 'polite') {
  if (typeof document === 'undefined') return;
  const el = getRegion(politeness);
  // A newer announcement supersedes a pending one: clear its timer so none leak or fire late.
  window.clearTimeout(timers[politeness]);
  el.textContent = '';
  timers[politeness] = window.setTimeout(() => {
    el.textContent = message;
    timers[politeness] = undefined;
  }, 50);
}
