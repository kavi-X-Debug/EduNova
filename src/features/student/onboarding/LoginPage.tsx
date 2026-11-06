import { useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Input, Select } from '@/components/ui';
import { announce } from '@/lib/a11y';
import { useSessionStore } from '@/store';
import type { Role } from '@/types';
import { destinationFor } from './destination';
import { RedirectByRole } from './RedirectByRole';
import { usePageFocus } from './usePageFocus';

const ROLES: Role[] = ['student', 'teacher', 'admin'];

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useSessionStore((s) => s.user);
  const signIn = useSessionStore((s) => s.signIn);
  const ref = usePageFocus<HTMLDivElement>();
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [emailError, setEmailError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [busy, setBusy] = useState(false);

  if (user && !busy) return <RedirectByRole role={user.role} userId={user.id} />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(undefined);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      const msg = t(email.trim() ? 'errors.field.email' : 'errors.field.required');
      setEmailError(msg);
      announce(`${t('auth.login.email')}: ${msg}`, 'assertive');
      emailRef.current?.focus();
      return;
    }
    setEmailError(undefined);
    setBusy(true);
    try {
      const u = await signIn(email, role);
      navigate(await destinationFor(u.role, u.id), { replace: true });
    } catch {
      const msg = t('auth.login.error');
      setFormError(msg);
      announce(msg, 'assertive');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div ref={ref}>
      <h1 className="text-2xl font-bold text-ink">{t('auth.login.title')}</h1>
      <p className="mt-1 text-base text-ink-soft">{t('auth.login.subtitle')}</p>
      <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-4" aria-busy={busy}>
        {formError && (
          <p role="alert" className="rounded-md border border-danger-500 bg-danger-50 p-3 text-sm font-semibold text-danger-700">
            {formError}
          </p>
        )}
        <Select
          label={t('auth.login.roleLabel')}
          hint={t('auth.login.demoHint')}
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          options={ROLES.map((r) => ({ value: r, label: t(`common.role.${r}`) }))}
        />
        <Input
          label={t('auth.login.email')}
          type="email"
          ref={emailRef}
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
        />
        <Input
          label={t('auth.login.password')}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" size="lg" fullWidth loading={busy} loadingLabel={t('ui.common.loading')}>
          {t('auth.login.submit')}
        </Button>
      </form>
    </div>
  );
}
