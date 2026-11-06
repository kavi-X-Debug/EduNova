export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Shared focus ring: uses the shadow-focus token. */
export const focusRing = 'outline-none focus-visible:shadow-focus';
/** Minimum 44px touch target. */
export const touchTarget = 'min-h-[44px] min-w-[44px]';
