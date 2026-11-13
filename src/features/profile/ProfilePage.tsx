import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  AVATAR_COLOURS, AVATAR_PRESETS, Banner, Button, Card, Checkbox, ErrorState, Input, LoadingState, PageHeader, ProfileAvatar, Select, cn, useToast,
} from '@/components/ui';
import { useLocale } from '@/i18n';
import { useAsync } from '@/lib';
import { announce } from '@/lib/a11y';
import { profileService, studentService } from '@/services';
import type { StudentProfile } from '@/services';
import { useA11yPrefsStore, useSessionStore } from '@/store';
import { RewardsCard } from '@/features/student/badges/RewardsCard';
import type { AvatarChoice, Locale, NotificationPrefs, User, UserProfile } from '@/types';

const GRADES = [6, 7, 8, 9, 10, 11];
const SUBJECTS = ['maths', 'science', 'sinhala', 'english', 'ict'];
const choiceBtn = 'flex min-h-11 min-w-11 items-center justify-center rounded-md border-2 p-1 outline-none focus-visible:shadow-focus';

export default function ProfilePage() {
  const { t } = useTranslation();
  const user = useSessionStore((s) => s.user);
  const userId = user?.id ?? '';
  const isStudent = user?.role === 'student';
  const { data, loading, error, reload } = useAsync(async () => {
    const [profile, student] = await Promise.all([profileService.getProfile(userId), isStudent ? studentService.getProfile(userId) : Promise.resolve(null)]);
    return { profile, student };
  }, [userId, isStudent]);

  return (
    <div>
      <PageHeader title={t('profile.title')} description={t('profile.subtitle')} />
      {loading && !data && <LoadingState label={t('a11y.loading')} lines={5} />}
      {error && <ErrorState description={t('profile.error')} onRetry={reload} retryLabel={t('common.action.retry')} />}
      {data && user && <ProfileSections user={user} profile={data.profile} student={data.student} />}
    </div>
  );
}

function ProfileSections({ user, profile, student }: { user: User; profile: UserProfile; student: StudentProfile | null }) {
  const { t } = useTranslation();
  const isStudent = user.role === 'student';
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <DetailsCard user={user} profile={profile} student={student} />
        <NotificationsCard profile={profile} />
        <AccessibilityCard />
        <PasswordCard userId={user.id} />
      </div>
      <div className="flex flex-col gap-6">
        {isStudent && <RewardsCard limit={100} title={t('profile.rewards.title')} />}
        <DataCard />
        <SignOutCard />
      </div>
    </div>
  );
}

// ---------- Details: name, avatar, language, grade and subjects ----------
function DetailsCard({ user, profile, student }: { user: User; profile: UserProfile; student: StudentProfile | null }) {
  const { t } = useTranslation();
  const { locale, setLocale, locales, names } = useLocale();
  const toast = useToast();
  const [name, setName] = useState(profile.displayName);
  const [avatar, setAvatar] = useState<AvatarChoice>(profile.avatar);
  const [grade, setGrade] = useState(student ? String(student.grade) : '');
  const [subjects, setSubjects] = useState<string[]>(student?.subjects ?? []);
  const [nameError, setNameError] = useState<string>();
  const [subjectError, setSubjectError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const changeLocale = (next: Locale) => {
    void setLocale(next);
    if (student) void studentService.saveProfile(user.id, { ...student, grade: Number(grade) || student.grade, subjects, locale: next }).catch(() => undefined);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    setNameError(trimmed ? undefined : t('profile.details.name.error'));
    setSubjectError(student && subjects.length === 0 ? t('profile.details.subjects.error') : undefined);
    if (!trimmed || (student && subjects.length === 0)) return;
    setSaving(true);
    try {
      const saved = await profileService.updateProfile(user.id, { displayName: trimmed, avatar });
      if (student) await studentService.saveProfile(user.id, { grade: Number(grade), subjects, locale });
      useSessionStore.setState((s) => ({ user: s.user ? { ...s.user, name: saved.displayName } : s.user }));
      toast.show({ tone: 'success', message: t('profile.saved') });
      announce(t('profile.saved'));
    } catch {
      toast.show({ tone: 'danger', message: t('profile.saveError') });
      announce(t('profile.saveError'), 'assertive');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card as="section" title={t('profile.details.title')} aria-label={t('profile.details.title')}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <ProfileAvatar name={name || user.email} avatar={avatar} size="xl" />
          <p className="text-sm text-ink-soft">{t(`common.role.${user.role}`)} · {user.email}</p>
        </div>
        <Input label={t('profile.details.name.label')} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required autoComplete="name" error={nameError} />

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-semibold text-ink">{t('profile.avatar.title')}</legend>
          <p className="text-xs text-ink-soft">{t('profile.avatar.hint')}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={avatar.kind === 'initials'} aria-label={t('profile.avatar.initials')} title={t('profile.avatar.initials')} onClick={() => setAvatar({ ...avatar, kind: 'initials', presetId: undefined })} className={cn(choiceBtn, avatar.kind === 'initials' ? 'border-brand-600' : 'border-line')}>
              <ProfileAvatar name={name || user.email} avatar={{ kind: 'initials', colour: avatar.colour }} size="md" />
            </button>
            {AVATAR_PRESETS.map((p) => (
              <button key={p.id} type="button" aria-pressed={avatar.kind === 'preset' && avatar.presetId === p.id} aria-label={t(`profile.avatar.preset.${p.id}`)} title={t(`profile.avatar.preset.${p.id}`)} onClick={() => setAvatar({ ...avatar, kind: 'preset', presetId: p.id })} className={cn(choiceBtn, avatar.kind === 'preset' && avatar.presetId === p.id ? 'border-brand-600' : 'border-line')}>
                <ProfileAvatar name={t(`profile.avatar.preset.${p.id}`)} avatar={{ kind: 'preset', presetId: p.id, colour: avatar.colour }} size="md" />
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm font-semibold text-ink">{t('profile.avatar.colour')}</p>
          <div className="flex flex-wrap gap-2">
            {Object.keys(AVATAR_COLOURS).map((c) => (
              <button key={c} type="button" aria-pressed={avatar.colour === c} aria-label={t(`profile.avatar.colour.${c}`)} title={t(`profile.avatar.colour.${c}`)} onClick={() => setAvatar({ ...avatar, colour: c })} className={cn(choiceBtn, avatar.colour === c ? 'border-brand-600' : 'border-line')}>
                <span aria-hidden className={cn('flex h-8 w-8 items-center justify-center rounded-full border border-line-strong', AVATAR_COLOURS[c])}>
                  {avatar.colour === c && <Check className="h-4 w-4" />}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <Select
          label={t('profile.language.label')}
          hint={t('profile.language.hint')}
          value={locale}
          onChange={(e) => changeLocale(e.target.value as Locale)}
          options={locales.map((l) => ({ value: l, label: names[l] }))}
        />

        {student ? (
          <>
            <Select label={t('profile.details.grade.label')} value={grade} onChange={(e) => setGrade(e.target.value)} options={GRADES.map((g) => ({ value: String(g), label: t('common.grade', { grade: g }) }))} />
            <fieldset aria-describedby={subjectError ? 'profile-subjects-err' : undefined}>
              <legend className="mb-1 text-sm font-semibold text-ink">{t('profile.details.subjects.label')}</legend>
              {SUBJECTS.map((s) => (
                <Checkbox key={s} label={t(`subject.${s}`)} checked={subjects.includes(s)} onChange={(e) => setSubjects(e.target.checked ? [...subjects, s] : subjects.filter((x) => x !== s))} />
              ))}
              {subjectError && <p id="profile-subjects-err" role="alert" className="text-xs font-semibold text-danger-700">{subjectError}</p>}
            </fieldset>
          </>
        ) : (
          user.role === 'student' && (
            <p className="text-sm text-ink-soft">
              {t('profile.details.setup.note')}{' '}
              <Link to="/onboarding" className="font-semibold text-brand-700 underline outline-none focus-visible:shadow-focus">{t('profile.details.setup.link')}</Link>
            </p>
          )
        )}

        <Button type="submit" loading={saving} loadingLabel={t('a11y.loading')} className="self-start">
          {t('profile.save')}
        </Button>
      </form>
    </Card>
  );
}

// ---------- Notification preferences ----------
const NOTIFICATION_KEYS: (keyof NotificationPrefs)[] = ['reminders', 'weeklySummary', 'teacherMessages', 'productNews'];

function NotificationsCard({ profile }: { profile: UserProfile }) {
  const { t } = useTranslation();
  const toast = useToast();
  const [prefs, setPrefs] = useState<NotificationPrefs>(profile.notifications);
  const [saving, setSaving] = useState(false);
  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profileService.updateProfile(profile.userId, { notifications: prefs });
      toast.show({ tone: 'success', message: t('profile.saved') });
      announce(t('profile.saved'));
    } catch {
      toast.show({ tone: 'danger', message: t('profile.saveError') });
      announce(t('profile.saveError'), 'assertive');
    } finally {
      setSaving(false);
    }
  };
  return (
    <Card as="section" title={t('profile.notifications.title')} aria-label={t('profile.notifications.title')}>
      <form onSubmit={save} className="flex flex-col gap-2">
        <p className="mb-1 text-sm text-ink-soft">{t('profile.notifications.note')}</p>
        {NOTIFICATION_KEYS.map((k) => (
          <Checkbox key={k} label={t(`profile.notifications.${k}`)} hint={t(`profile.notifications.${k}.hint`)} checked={prefs[k]} onChange={(e) => setPrefs({ ...prefs, [k]: e.target.checked })} />
        ))}
        <Button type="submit" loading={saving} loadingLabel={t('a11y.loading')} className="mt-2 self-start">
          {t('profile.save')}
        </Button>
      </form>
    </Card>
  );
}

// ---------- Accessibility preferences (this device only; applied immediately) ----------
function AccessibilityCard() {
  const { t } = useTranslation();
  const reduceMotion = useA11yPrefsStore((s) => s.reduceMotion);
  const largeText = useA11yPrefsStore((s) => s.largeText);
  const setPref = useA11yPrefsStore((s) => s.setPref);
  return (
    <Card as="section" title={t('profile.a11y.title')} aria-label={t('profile.a11y.title')}>
      <p className="mb-2 text-sm text-ink-soft">{t('profile.a11y.note')}</p>
      <Checkbox label={t('profile.a11y.reduceMotion')} hint={t('profile.a11y.reduceMotion.hint')} checked={reduceMotion} onChange={(e) => { setPref('reduceMotion', e.target.checked); announce(t(e.target.checked ? 'profile.a11y.reduceMotion.on' : 'profile.a11y.reduceMotion.off')); }} />
      <Checkbox label={t('profile.a11y.largeText')} hint={t('profile.a11y.largeText.hint')} checked={largeText} onChange={(e) => { setPref('largeText', e.target.checked); announce(t(e.target.checked ? 'profile.a11y.largeText.on' : 'profile.a11y.largeText.off')); }} />
    </Card>
  );
}

// ---------- Change password (MOCK) ----------
function PasswordCard({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const toast = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string }>({});
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    if (!current) err.current = t('profile.password.error.current');
    if (next.length < 8) err.next = t('profile.password.error.short');
    else if (next === current) err.next = t('profile.password.error.same');
    if (confirm !== next) err.confirm = t('profile.password.error.match');
    setErrors(err);
    if (Object.keys(err).length > 0) {
      announce(t('profile.password.error.summary'), 'assertive');
      return;
    }
    setSaving(true);
    try {
      await profileService.changePassword(userId, { current, next });
      setCurrent('');
      setNext('');
      setConfirm('');
      toast.show({ tone: 'success', message: t('profile.password.done') });
      announce(t('profile.password.done'));
    } catch {
      toast.show({ tone: 'danger', message: t('profile.saveError') });
      announce(t('profile.saveError'), 'assertive');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card as="section" title={t('profile.password.title')} aria-label={t('profile.password.title')}>
      <Banner tone="warning" className="mb-4">
        {t('profile.password.mock')}
      </Banner>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Input type="password" label={t('profile.password.current')} value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required error={errors.current} />
        <Input type="password" label={t('profile.password.new')} hint={t('profile.password.hint')} value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" required error={errors.next} />
        <Input type="password" label={t('profile.password.confirm')} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required error={errors.confirm} />
        <Button type="submit" loading={saving} loadingLabel={t('a11y.loading')} className="self-start">
          {t('profile.password.submit')}
        </Button>
      </form>
    </Card>
  );
}

// ---------- My data ----------
function DataCard() {
  const { t } = useTranslation();
  return (
    <Card as="section" title={t('profile.data.title')} aria-label={t('profile.data.title')}>
      <p className="text-sm text-ink-soft">{t('profile.data.body')}</p>
      <p className="mt-2 text-sm text-ink-soft">{t('profile.data.rewards')}</p>
    </Card>
  );
}

function SignOutCard() {
  const { t } = useTranslation();
  const signOut = useSessionStore((s) => s.signOut);
  const navigate = useNavigate();
  return (
    <Card as="section" title={t('profile.signOut.title')} aria-label={t('profile.signOut.title')}>
      <p className="mb-3 text-sm text-ink-soft">{t('profile.signOut.note')}</p>
      <Button
        variant="secondary"
        leftIcon={<LogOut aria-hidden className="h-4 w-4" />}
        onClick={async () => {
          try {
            await signOut();
          } finally {
            useSessionStore.setState({ user: null, role: null });
            navigate('/login', { replace: true });
          }
        }}
      >
        {t('nav.account.signOut')}
      </Button>
    </Card>
  );
}
