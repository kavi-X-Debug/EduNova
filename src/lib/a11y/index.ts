import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, RefObject } from 'react';

/** Tailwind's `sr-only` utility: hide visually, keep for assistive tech. */
export const visuallyHidden = 'sr-only';
/** Reverts sr-only on focus (e.g. skip links). */
export const visuallyHiddenFocusable = 'sr-only focus:not-sr-only';

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),[contenteditable="true"]';

export function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute('hidden') && el.getAttribute('aria-hidden') !== 'true',
  );
}

/** Remember the focused element; returns a function that restores focus to it. */
export function captureFocus(): () => void {
  const el = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  return () => {
    if (el && el.isConnected) el.focus({ preventScroll: true });
  };
}

/** Hook form of captureFocus: restores focus to the prior element when `active` turns false or on unmount. */
export function useFocusReturn(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const restore = captureFocus();
    return restore;
  }, [active]);
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

/** Respects the OS "reduce motion" setting; updates live. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

// ---- Announcer (aria-live) -------------------------------------------------
// A single shared pair of live regions, created lazily on <body>, so any
// component can announce without rendering a region itself.
type Politeness = 'polite' | 'assertive';
const regions: Partial<Record<Politeness, HTMLElement>> = {};

function getRegion(p: Politeness): HTMLElement {
  let el = regions[p];
  if (!el || !el.isConnected) {
    el = document.createElement('div');
    el.className = visuallyHidden;
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
  el.textContent = '';
  window.setTimeout(() => {
    el.textContent = message;
  }, 50);
}

/** Returns a stable `announce(message, politeness?)` function. */
export function useAnnounce() {
  return announce;
}

// ---- Roving tabindex -------------------------------------------------------
interface RovingOptions {
  orientation?: 'horizontal' | 'vertical' | 'both';
  loop?: boolean;
  /** Controlled/initial active index. */
  initialIndex?: number;
  onChange?: (index: number) => void;
}

/**
 * Roving tabindex for tablists, toolbars, menus, radio-like groups.
 * Usage: const { getItemProps, containerProps } = useRovingTabindex(count);
 *   <div role="tablist" {...containerProps}> <button {...getItemProps(i)} /> ...
 * Honors RTL-agnostic arrow keys; Home/End supported.
 */
export function useRovingTabindex(count: number, options: RovingOptions = {}) {
  const { orientation = 'horizontal', loop = true, initialIndex = 0, onChange } = options;
  const [active, setActive] = useState(initialIndex);
  const refs = useRef<(HTMLElement | null)[]>([]);

  const focusIndex = useCallback(
    (i: number) => {
      setActive(i);
      onChange?.(i);
      refs.current[i]?.focus();
    },
    [onChange],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      const next = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
      const prev = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
      const keys = {
        next: [next, ...(orientation === 'both' ? ['ArrowDown'] : [])],
        prev: [prev, ...(orientation === 'both' ? ['ArrowUp'] : [])],
      };
      let i: number;
      if (keys.next.includes(e.key)) i = active + 1;
      else if (keys.prev.includes(e.key)) i = active - 1;
      else if (e.key === 'Home') i = 0;
      else if (e.key === 'End') i = count - 1;
      else return;
      e.preventDefault();
      if (i < 0) i = loop ? count - 1 : 0;
      if (i > count - 1) i = loop ? 0 : count - 1;
      focusIndex(i);
    },
    [active, count, focusIndex, loop, orientation],
  );

  const getItemProps = (index: number) => ({
    ref: (el: HTMLElement | null) => {
      refs.current[index] = el;
    },
    tabIndex: index === active ? 0 : -1,
    onFocus: () => setActive(index),
  });

  return {
    activeIndex: active,
    setActiveIndex: focusIndex,
    getItemProps,
    containerProps: { onKeyDown },
  };
}
