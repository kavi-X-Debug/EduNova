import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Translate a key that may not exist in the locale files yet (listed in docs/REQUESTS.md).
 * Falls back to the English text so the UI never shows a raw key.
 */
export function useLt() {
  const { t } = useTranslation();
  return useCallback(
    (key: string, fallback: string, options?: Record<string, unknown>): string =>
      t(key, { defaultValue: fallback, ...options }) as string,
    [t],
  );
}
