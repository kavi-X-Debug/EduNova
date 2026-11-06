/**
 * Mock controls.
 *  - Failure mode:  `?fail=1` in the URL, or localStorage `edunova.mock.fail` = '1'  (every service call rejects)
 *  - Empty scenario: `?empty=1` in the URL, or localStorage `edunova.mock.empty` = '1' (list endpoints return [])
 *  - Latency: random 150-400ms per call.
 */
const FAIL_KEY = 'edunova.mock.fail';
const EMPTY_KEY = 'edunova.mock.empty';

function flag(urlParam: string, storageKey: string): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const q = new URLSearchParams(window.location.search).get(urlParam);
    if (q !== null) return q === '1' || q === 'true';
    return window.localStorage.getItem(storageKey) === '1';
  } catch {
    return false;
  }
}

function setFlag(storageKey: string, on: boolean): void {
  try {
    if (on) window.localStorage.setItem(storageKey, '1');
    else window.localStorage.removeItem(storageKey);
  } catch {
    /* storage unavailable */
  }
}

export const mockControls = {
  isFailing: () => flag('fail', FAIL_KEY),
  isEmpty: () => flag('empty', EMPTY_KEY),
  setFailing: (on: boolean) => setFlag(FAIL_KEY, on),
  setEmpty: (on: boolean) => setFlag(EMPTY_KEY, on),
};

export class MockServiceError extends Error {
  constructor(message = 'Simulated service failure') {
    super(message);
    this.name = 'MockServiceError';
  }
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Wraps a service call with simulated latency and the controllable failure mode. */
export async function simulate<T>(fn: () => T): Promise<T> {
  await sleep(150 + Math.random() * 250);
  if (mockControls.isFailing()) throw new MockServiceError();
  return fn();
}

/** Returns [] when the empty scenario is on. */
export function orEmpty<T>(items: T[]): T[] {
  return mockControls.isEmpty() ? [] : items;
}

export function clone<T>(v: T): T {
  return structuredClone(v);
}
