import { useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, GraduationCap, ShieldCheck, Users } from 'lucide-react';
import { BigActionButton, HelpBubble, MascotMessage } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { useT } from '@/i18n';
import { announce } from '@/lib/a11y';
import { useSessionStore } from '@/store';
import type { Role } from '@/types';
import { ChoiceCard } from './choices';
import { kidControl, kidFieldWrap } from './kidStyles';
import { destinationFor } from './destination';
import { RedirectByRole } from './RedirectByRole';

const ROLES: { role: Role; icon: typeof GraduationCap }[] = [
  { role: 'student', icon: GraduationCap },
  { role: 'teacher', icon: Users },
  { role: 'admin', icon: ShieldCheck },
];

/** A warm first screen: Nova says hello, "Who are you?", one email box and one big Continue. Demo only: no password is checked. */
export default function LoginPage() {
  const t = useT();
  const navigate = useNavigate();
  const user = useSessionStore((s) => s.user);
  const signIn = useSessionStore((s) => s.signIn);
  const from = (useLocation().state as { from?: unknown } | null)?.from;
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [emailError, setEmailError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [busy, setBusy] = useState(false);

  if (user && !busy) return <RedirectByRole role={user.role} userId={user.id} from={from} />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(undefined);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      const msg = t(email.trim() ? 'kidsplay.login.email.bad' : 'kidsplay.login.email.empty');
      setEmailError(msg);
      announce(msg, 'assertive');
      emailRef.current?.focus();
      return;
    }
    setEmailError(undefined);
    setBusy(true);
    try {
      const u = await signIn(email, role);
      navigate(await destinationFor(u.role, u.id, from), { replace: true });
    } catch {
      const msg = t('kidsplay.login.error');
      setFormError(msg);
      announce(msg, 'assertive');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink md:text-3xl">{t('kidsplay.login.title')}</h1>
        <HelpBubble textKey="kidsplay.login.help" align="end" />
      </div>
      <MascotMessage mood="wave" size="md" className="mt-4">
        {t('kidsplay.login.nova')}
      </MascotMessage>

      <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-5" aria-busy={busy}>
        {formError && (
          <MascotMessage mood="oops" size="sm">
            <span role="alert">{formError}</span>
          </MascotMessage>
        )}

        <fieldset>
          <legend className="sr-only">{t('kidsplay.login.title')}</legend>
          <div className="flex flex-col gap-3">
            {ROLES.map(({ role: r, icon: Icon }) => (
              <ChoiceCard
                key={r}
                type="radio"
                name="role"
                value={r}
                checked={role === r}
                onChange={() => setRole(r)}
                picture={<Icon aria-hidden className="h-8 w-8" />}
              >
                {t(`common.role.${r}`)}
              </ChoiceCard>
            ))}
          </div>
          <p className="mt-2 text-base text-ink-soft">{t('auth.login.demoHint')}</p>
        </fieldset>

        <Input
          label={t('kidsplay.login.email')}
          type="email"
          ref={emailRef}
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
          className={kidControl}
          wrapperClassName={kidFieldWrap}
        />
        <Input
          label={t('auth.login.password')}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint={t('kidsplay.login.password.hint')}
          className={kidControl}
          wrapperClassName={kidFieldWrap}
        />
        <BigActionButton type="submit" icon={<ArrowRight />} fullWidth disabled={busy} aria-busy={busy || undefined}>
          {t('kidsplay.continue')}
        </BigActionButton>
      </form>
    </div>
  );
}
