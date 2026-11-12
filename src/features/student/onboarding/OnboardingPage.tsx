import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, ErrorState, LoadingState, ProgressBar, RadioGroup } from '@/components/ui';
import { useAsync } from '@/lib';
import { useLocale } from '@/i18n';
import { announce } from '@/lib/a11y';
import { studentService } from '@/services';
import { useSessionStore } from '@/store';
import type { Locale } from '@/types';
import { RedirectByRole } from './RedirectByRole';

const LOCALES: Locale[] = ['en', 'si', 'ta'];
const GRADES = [6, 7, 8, 9, 10, 11];
const SUBJECTS = ['maths', 'science', 'sinhala', 'english', 'ict'];
const TOTAL = 3;

/** Gate: sends non-students and already-onboarded students on; shows the wizard otherwise. */
export default function OnboardingPage() {
  const { t } = useTranslation();
  const user = useSessionStore((s) => s.user);
  const userId = user?.id ?? '';
  const isStudent = user?.role === 'student';
  const profile = useAsync(() => (isStudent ? studentService.getProfile(userId) : Promise.resolve(undefined)), [userId, isStudent]);

  if (!user) return <Navigate to="/login" replace />;
  if (!isStudent) return <RedirectByRole role={user.role} userId={user.id} />;
  if (profile.error) return <ErrorState description={t('errors.generic')} onRetry={profile.reload} retryLabel={t('common.action.retry')} />;
  if (profile.loading) return <LoadingState label={t('a11y.loading')} lines={4} />;
  if (profile.data) return <Navigate to="/student" replace />;
  return <Wizard userId={user.id} initialGrade={user.grade} />;
}

function Wizard({ userId, initialGrade }: { userId: string; initialGrade?: number }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { locale, setLocale } = useLocale();
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(1);
  const [grade, setGrade] = useState(initialGrade ? String(initialGrade) : '');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const save = async () => {
    setSaving(true);
    setSaveError(false);
    try {
      await studentService.saveProfile(userId, { grade: Number(grade), subjects, locale });
      navigate('/student/diagnostic', { replace: true });
    } catch {
      setSaveError(true);
      announce(t('auth.onboarding.saveError'), 'assertive');
    } finally {
      setSaving(false);
    }
  };

  const chooseLocale = (l: Locale) => {
    setLocale(l);
    announce(t('a11y.language.changed', { language: t(`common.language.${l}`) }));
  };

  const next = () => {
    if ((step === 2 && !grade) || (step === 3 && subjects.length === 0)) {
      const msg = t('errors.field.required');
      setError(msg);
      announce(msg, 'assertive');
      formRef.current?.querySelector<HTMLElement>('input')?.focus();
      return;
    }
    setError(undefined);
    if (step < TOTAL) {
      setStep(step + 1);
      return;
    }
    void save();
  };

  const stepLabel = t('auth.onboarding.step', { current: step, total: TOTAL });

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">{t('auth.onboarding.title')}</h1>
      <p className="mt-1 text-sm font-semibold text-ink-soft">{stepLabel}</p>
      <ProgressBar className="mt-2" value={(step / TOTAL) * 100} label={stepLabel} />

      <form
        ref={formRef}
        className="mt-6 flex flex-col gap-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
      >
        {step === 1 && (
          <>
            <RadioGroup
              name="locale"
              legend={t('auth.onboarding.language.title')}
              value={locale}
              onChange={(v) => chooseLocale(v as Locale)}
              options={LOCALES.map((l) => ({ value: l, label: <span lang={l}>{t(`common.language.${l}`)}</span> }))}
            />
            <p className="text-xs text-ink-soft">{t('auth.onboarding.language.hint')}</p>
          </>
        )}
        {step === 2 && (
          <RadioGroup
            name="grade"
            legend={t('auth.onboarding.grade.title')}
            value={grade}
            onChange={setGrade}
            error={error}
            options={GRADES.map((g) => ({ value: String(g), label: t('common.grade', { grade: g }) }))}
          />
        )}
        {step === 3 && (
          <fieldset className="flex flex-col">
            <legend className="mb-1 text-sm font-semibold text-ink">{t('auth.onboarding.subjects.title')}</legend>
            {SUBJECTS.map((s) => (
              <Checkbox
                key={s}
                label={t(`subject.${s}`)}
                checked={subjects.includes(s)}
                onChange={(e) => setSubjects(e.target.checked ? [...subjects, s] : subjects.filter((x) => x !== s))}
              />
            ))}
            {error && <p role="alert" className="text-xs font-semibold text-danger-700">{error}</p>}
          </fieldset>
        )}

        <div className="flex flex-wrap justify-between gap-3">
          {step > 1 ? (
            <Button
              variant="secondary"
              onClick={() => {
                setError(undefined);
                setStep(step - 1);
              }}
            >
              {t('common.action.back')}
            </Button>
          ) : (
            <span />
          )}
          <Button type="submit" loading={saving} loadingLabel={t('ui.common.loading')}>
            {step === TOTAL ? (saveError ? t('common.action.retry') : t('auth.onboarding.finish')) : t('common.action.next')}
          </Button>
        </div>
        {saveError && (
          <p role="alert" className="text-sm font-semibold text-danger-700">
            {t('auth.onboarding.saveError')}
          </p>
        )}
        <p className="text-xs text-ink-soft">{t('auth.onboarding.privacy')}</p>
      </form>
    </div>
  );
}
