import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Select, Button } from '@/components/ui';
import { useLocale } from '@/i18n';
import { useSessionStore } from '@/store';
import type { Locale } from '@/types';

/** Language switcher + sign out, shown in every layout's top bar. */
export function HeaderSlot() {
  const { locale, setLocale, locales, names, t } = useLocale();
  const signOut = useSessionStore((s) => s.signOut);
  const user = useSessionStore((s) => s.user);
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-2">
      <Select
        label={<span className="sr-only">{t('a11y.language.switcher')}</span>}
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        options={locales.map((l) => ({ value: l, label: names[l] }))}
        wrapperClassName="w-32"
      />
      {user && (
        <Button
          variant="ghost"
          leftIcon={<LogOut aria-hidden className="h-4 w-4" />}
          onClick={async () => {
            try {
              await signOut();
            } finally {
              // Always leave the signed-in area, even if the service call fails
              // (shared school devices must not stay signed in).
              useSessionStore.setState({ user: null, role: null });
              navigate('/login', { replace: true });
            }
          }}
        >
          {t('nav.account.signOut')}
        </Button>
      )}
    </div>
  );
}
