import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Check, Languages, Rocket } from 'lucide-react';
import { BigActionButton, Button, HelpBubble, LoadingState, MascotMessage, cn } from '@/components/ui';
import { useAsync } from '@/lib';
import { useLocale } from '@/i18n';
import { announce } from '@/lib/a11y';
import { studentService } from '@/services';
import { useSessionStore } from '@/store';
import type { Locale } from '@/types';
import { LanguageChoices, SubjectChoices } from './choices';
import { RedirectByRole } from './RedirectByRole';

// Grade 6 MVP: only Grade 6 has learning paths for now, so a child is not asked for a grade.
const DEFAULT_GRADE = 6;
const TOTAL = 3;
const STEPS = [
  { icon: Languages, label: 'kidsplay.onb.step.lang' },
  { icon: BookOpen, label: 'kidsplay.onb.step.subjects' },
  { icon: Check, label: 'kidsplay.onb.step.done' },
] as const;

/** Gate: sends non-students and already-onboarded students on; shows the wizard otherwise. */
export default function OnboardingPage() {
  const { t } = useLocale();
  const user = useSessionStore((s) => s.user);
  const userId = user?.id ?? '';
  const isStudent = user?.role === 'student';
  const profile = useAsync(() => (isStudent ? studentService.getProfile(userId) : Promise.resolve(undefined)), [userId, isStudent]);

  if (!user) return <Navigate to="/login" replace />;
  if (!isStudent) return <RedirectByRole role={user.role} userId={user.id} />;
  if (profile.error) {
    return (
      <div role="alert" className="flex flex-col gap-4">
        <MascotMessage mood="oops" size="md">
          {t('kidsplay.saveError')}
        </MascotMessage>
        <BigActionButton variant="secondary" onClick={profile.reload} className="self-start">
          {t('kidsplay.ask.again')}
        </BigActionButton>
      </div>
    );
  }
  if (profile.loading) return <LoadingState label={t('a11y.loading')} lines={4} />;
  if (profile.data) return <Navigate to="/student" replace />;
  return <Wizard userId={user.id} firstName={user.name.trim().split(/\s+/)[0] ?? ''} initialGrade={user.grade} />;
}

/** Three tiny steps: pick your language, pick your subjects, done. */
function Wizard({ userId, firstName, initialGrade }: { userId: string; firstName: string; initialGrade?: number }) {
  const { t, locale, setLocale } = useLocale();
  const navigate = useNavigate();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const [step, setStep] = useState(1);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  // Move focus to the new step's heading (after the child pressed Continue or Back).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const save = async () => {
    setSaving(true);
    setSaveError(false);
    try {
      await studentService.saveProfile(userId, { grade: initialGrade ?? DEFAULT_GRADE, subjects, locale });
      navigate('/student/diagnostic', { replace: true });
    } catch {
      setSaveError(true);
      announce(t('kidsplay.saveError'), 'assertive');
    } finally {
      setSaving(false);
    }
  };

  const chooseLocale = (l: Locale) => {
    void setLocale(l);
    announce(t('a11y.language.changed', { language: t(`common.language.${l}`) }));
  };

  const next = () => {
    if (step === 2 && subjects.length === 0) {
      const msg = t('kidsplay.onb.subjects.error');
      setError(msg);
      announce(msg, 'assertive');
      return;
    }
    setError(undefined);
    if (step < TOTAL) setStep(step + 1);
    else void save();
  };

  const title = step === 1 ? t('kidsplay.onb.lang.title') : step === 2 ? t('kidsplay.onb.subjects.title') : t('kidsplay.onb.done.title', { name: firstName });
  const stepLabel = t('auth.onboarding.step', { current: step, total: TOTAL });

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <ol aria-label={stepLabel} className="flex items-center gap-2">
          {STEPS.map((s, i) => {
            const n = i + 1;
            const Icon = s.icon;
            const state = n < step ? 'done' : n === step ? 'now' : 'todo';
            return (
              <li
                key={s.label}
                aria-current={state === 'now' ? 'step' : undefined}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full border-2',
                  state === 'now' && 'border-brand-600 bg-brand-600 text-surface',
                  state === 'done' && 'border-success-500 bg-success-50 text-success-700',
                  state === 'todo' && 'border-line-strong bg-surface text-ink-faint',
                )}
              >
                <Icon aria-hidden className="h-6 w-6" />
                <span className="sr-only">{t(s.label)}</span>
              </li>
            );
          })}
        </ol>
        <HelpBubble textKey="kidsplay.onb.help" align="end" />
      </div>
      <p className="mt-2 text-base font-semibold text-ink-soft">{stepLabel}</p>

      <h1 ref={headingRef} tabIndex={-1} className="mt-4 text-2xl font-bold text-ink outline-none md:text-3xl">
        {title}
      </h1>

      <form
        className="mt-5 flex flex-col gap-5"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
      >
        {step === 1 && <LanguageChoices hideLegend legend={t('kidsplay.onb.lang.title')} value={locale} onChange={chooseLocale} />}
        {step === 2 && <SubjectChoices hideLegend legend={t('kidsplay.onb.subjects.title')} hint={t('kidsplay.onb.subjects.hint')} value={subjects} onChange={setSubjects} error={error} />}
        {step === 3 && (
          <MascotMessage mood="cheer" size="lg" speakText={t('kidsplay.onb.done.body')}>
            {t('kidsplay.onb.done.body')}
          </MascotMessage>
        )}

        {saveError && (
          <MascotMessage mood="oops" size="sm">
            <span role="alert">{t('kidsplay.saveError')}</span>
          </MascotMessage>
        )}

        <BigActionButton type="submit" icon={step === TOTAL ? <Rocket /> : <ArrowRight />} fullWidth disabled={saving} aria-busy={saving || undefined}>
          {step === TOTAL ? t('kidsplay.onb.done.go') : t('kidsplay.continue')}
        </BigActionButton>
        {step > 1 && (
          <Button
            variant="ghost"
            size="lg"
            className="self-center"
            onClick={() => {
              setError(undefined);
              setStep(step - 1);
            }}
          >
            {t('common.action.back')}
          </Button>
        )}
        <p className="text-base text-ink-soft">{t('auth.onboarding.privacy')}</p>
      </form>
    </div>
  );
}
