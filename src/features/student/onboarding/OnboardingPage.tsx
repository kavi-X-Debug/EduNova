import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, ProgressBar, RadioGroup } from '@/components/ui';
import { announce } from '@/lib/a11y';
import { useSessionStore } from '@/store';
import type { Locale } from '@/types';
import { destinationFor } from './destination';
import { readOnboarding, writeOnboarding } from './onboardingStorage';
import { usePageFocus } from './usePageFocus';

const LOCALES: Locale[] = ['en', 'si', 'ta'];
const GRADES = [6, 7, 8, 9, 10, 11];
const SUBJECTS = ['maths', 'science', 'sinhala', 'english', 'ict'];
const TOTAL = 3;

export default function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useSessionStore((s) => s.user);
  const locale = useSessionStore((s) => s.locale);
  const setLocale = useSessionStore((s) => s.setLocale);
  const ref = usePageFocus<HTMLDivElement>();
  const [step, setStep] = useState(1);
  const [grade, setGrade] = useState(user?.grade ? String(user.grade) : '');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [error, setError] = useState<string>();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'student' || readOnboarding(user.id)) {
    return <Navigate to={destinationFor(user.role, user.id)} replace />;
  }

  const chooseLocale = (l: Locale) => {
    setLocale(l);
    announce(t('a11y.language.changed', { language: t(`common.language.${l}`) }));
  };

  const next = () => {
    if (step === 2 && !grade) return setError(t('errors.field.required'));
    if (step === 3 && subjects.length === 0) return setError(t('errors.field.required'));
    setError(undefined);
    if (step < TOTAL) {
      setStep(step + 1);
      return;
    }
    writeOnboarding(user.id, { grade: Number(grade), subjects, locale });
    navigate('/student/diagnostic', { replace: true });
  };

  const stepLabel = t('auth.onboarding.step', { current: step, total: TOTAL });

  return (
    <div ref={ref}>
      <h1 className="text-2xl font-bold text-ink">{t('auth.onboarding.title')}</h1>
      <p className="mt-1 text-sm font-semibold text-ink-soft">{stepLabel}</p>
      <ProgressBar className="mt-2" value={(step / TOTAL) * 100} label={stepLabel} />

      <form
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
          <Button type="submit">{step === TOTAL ? t('auth.onboarding.finish') : t('common.action.next')}</Button>
        </div>
        <p className="text-xs text-ink-soft">{t('auth.onboarding.privacy')}</p>
      </form>
    </div>
  );
}
