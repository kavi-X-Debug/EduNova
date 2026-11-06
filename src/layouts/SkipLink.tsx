import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

/** Skip link to main#main-content. Moves focus without appending the hash to the URL. */
export function SkipLink() {
  const { t } = useTranslation();
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const main = document.getElementById('main-content');
    main?.focus();
    main?.scrollIntoView?.();
  };
  return (
    <a
      href="#main-content"
      onClick={onClick}
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-3 focus:font-semibold focus:text-brand-700 focus:shadow-raised focus-visible:shadow-focus"
    >
      {t('layout.skipToContent')}
    </a>
  );
}
