import { useState, type ComponentType, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronDown, PartyPopper, Save, Type, Volume2, Wind } from 'lucide-react';
import {
  ANIMAL_AVATAR_IDS,
  AVATAR_COLOURS,
  AVATAR_PRESETS,
  BigActionButton,
  Card,
  HelpBubble,
  PageHeader,
  ProfileAvatar,
  cn,
  useToast,
} from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { useLocale, type TKey } from '@/i18n';
import { announce } from '@/lib/a11y';
import { profileService, studentService } from '@/services';
import type { StudentProfile } from '@/services';
import { useA11yPrefsStore, useGamePrefsStore, useSessionStore } from '@/store';
import { LanguageChoices, SubjectChoices } from '@/features/student/onboarding/choices';
import { kidControl, kidFieldWrap } from '@/features/student/onboarding/kidStyles';
import { useCelebrationPref } from '@/features/student/quests/useCelebrationPref';
import type { AvatarChoice, Locale, User, UserProfile } from '@/types';
import { DataCard, NotificationsCard, PasswordCard, SignOutCard } from './ProfilePage';

type IconType = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

const pick = 'flex min-h-[64px] min-w-[64px] items-center justify-center rounded-xl border-2 p-1 outline-none transition duration-fast ease-standard focus-visible:shadow-focus';

/** A big on/off switch with a picture. The state is also written ("On" / "Off"), never colour alone. */
function SettingToggle({ icon: Icon, label, on, onChange }: { icon: IconType; label: string; on: boolean; onChange: (next: boolean) => void }) {
  const { t } = useLocale();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn(
        'flex min-h-[72px] w-full flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border-2 p-3 text-left outline-none transition duration-fast ease-standard focus-visible:shadow-focus',
        on ? 'border-brand-600 bg-brand-50' : 'border-line bg-surface hover:border-ink-faint',
      )}
    >
      <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
        <Icon aria-hidden className="h-7 w-7" />
      </span>
      <span className="min-w-[8rem] flex-1 text-lg font-bold text-ink">{label}</span>
      <span className={cn('flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-base font-bold', on ? 'bg-brand-600 text-surface' : 'bg-surface-sunken text-ink-soft')}>
        {on && <Check aria-hidden className="h-5 w-5" />}
        {t(on ? 'kidsplay.me.toggle.on' : 'kidsplay.me.toggle.off')}
      </span>
    </button>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-xl font-bold text-ink">{title}</legend>
      {children}
    </fieldset>
  );
}

/**
 * The child's "Me" page: big picture and name, picture choices, language, subjects, simple switches.
 * Grown-up settings (notifications, password mock, data) live in a collapsed "For grown-ups" section.
 */
export function KidsProfile({ user, profile, student, intro }: { user: User; profile: UserProfile; student: StudentProfile | null; intro?: ReactNode }) {
  const { t, locale, setLocale } = useLocale();
  const toast = useToast();
  const [name, setName] = useState(profile.displayName);
  const [avatar, setAvatar] = useState<AvatarChoice>(profile.avatar);
  const [subjects, setSubjects] = useState<string[]>(student?.subjects ?? []);
  const [nameError, setNameError] = useState<string>();
  const [subjectError, setSubjectError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const reduceMotion = useA11yPrefsStore((s) => s.reduceMotion);
  const largeText = useA11yPrefsStore((s) => s.largeText);
  const setPref = useA11yPrefsStore((s) => s.setPref);
  const party = useCelebrationPref();
  const sound = useGamePrefsStore((s) => s.sound);
  const setSound = useGamePrefsStore((s) => s.setSound);

  const changeLocale = (next: Locale) => {
    void setLocale(next);
    if (student) void studentService.saveProfile(user.id, { ...student, subjects, locale: next }).catch(() => undefined);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    const noSubjects = Boolean(student) && subjects.length === 0;
    setNameError(trimmed ? undefined : t('kidsplay.me.name.error'));
    setSubjectError(noSubjects ? t('kidsplay.me.subjects.error') : undefined);
    if (!trimmed || noSubjects) {
      announce(t(trimmed ? 'kidsplay.me.subjects.error' : 'kidsplay.me.name.error'), 'assertive');
      return;
    }
    setSaving(true);
    try {
      const saved = await profileService.updateProfile(user.id, { displayName: trimmed, avatar });
      if (student) await studentService.saveProfile(user.id, { grade: student.grade, subjects, locale });
      useSessionStore.setState((s) => ({ user: s.user ? { ...s.user, name: saved.displayName } : s.user }));
      toast.show({ tone: 'success', message: t('kidsplay.me.saved') });
      announce(t('kidsplay.me.saved'));
    } catch {
      toast.show({ tone: 'danger', message: t('kidsplay.saveError') });
      announce(t('kidsplay.saveError'), 'assertive');
    } finally {
      setSaving(false);
    }
  };

  const labelFor = (id: string) => t((ANIMAL_AVATAR_IDS.includes(id) ? `kidsplay.avatar.${id}` : `profile.avatar.preset.${id}`) as TKey);
  // Friendly animals first, then the classic pictures.
  const presets = [...AVATAR_PRESETS].sort((a, b) => Number(ANIMAL_AVATAR_IDS.includes(b.id)) - Number(ANIMAL_AVATAR_IDS.includes(a.id)));
  const shownName = name.trim() || user.name;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader className="mb-0" title={t('kidsplay.me.title')} description={t('kidsplay.me.subtitle')} actions={<HelpBubble textKey="kids.me.help" align="end" />} />
      {intro}

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <Card as="section" aria-label={t('kidsplay.me.title')} className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <ProfileAvatar name={shownName} avatar={avatar} size="xl" className="h-28 w-28 [&>svg]:h-14 [&>svg]:w-14" />
            <p className="min-w-0 break-words text-2xl font-bold text-ink">{shownName}</p>
          </div>

          <Input
            label={t('kidsplay.me.name.label')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            required
            autoComplete="name"
            error={nameError}
            className={kidControl}
            wrapperClassName={kidFieldWrap}
          />

          <Section title={t('kidsplay.me.avatar.title')}>
            <div className="grid grid-cols-4 gap-2 md:grid-cols-7">
              <button
                type="button"
                aria-pressed={avatar.kind === 'initials'}
                aria-label={t('profile.avatar.initials')}
                title={t('profile.avatar.initials')}
                onClick={() => setAvatar({ ...avatar, kind: 'initials', presetId: undefined })}
                className={cn(pick, avatar.kind === 'initials' ? 'border-brand-600 bg-brand-50' : 'border-line')}
              >
                <ProfileAvatar name={shownName} avatar={{ kind: 'initials', colour: avatar.colour }} size="lg" />
              </button>
              {presets.map((p) => {
                const on = avatar.kind === 'preset' && avatar.presetId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={on}
                    aria-label={labelFor(p.id)}
                    title={labelFor(p.id)}
                    onClick={() => setAvatar({ ...avatar, kind: 'preset', presetId: p.id })}
                    className={cn(pick, on ? 'border-brand-600 bg-brand-50' : 'border-line')}
                  >
                    <ProfileAvatar name={labelFor(p.id)} avatar={{ kind: 'preset', presetId: p.id, colour: avatar.colour }} size="lg" />
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title={t('kidsplay.me.colour.title')}>
            <div className="flex flex-wrap gap-3">
              {Object.keys(AVATAR_COLOURS).map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={avatar.colour === c}
                  aria-label={t(`profile.avatar.colour.${c}` as TKey)}
                  title={t(`profile.avatar.colour.${c}` as TKey)}
                  onClick={() => setAvatar({ ...avatar, colour: c })}
                  className={cn(pick, avatar.colour === c ? 'border-brand-600' : 'border-line')}
                >
                  <span aria-hidden className={cn('flex h-11 w-11 items-center justify-center rounded-full border border-line-strong', AVATAR_COLOURS[c])}>
                    {avatar.colour === c && <Check className="h-6 w-6" />}
                  </span>
                </button>
              ))}
            </div>
          </Section>
        </Card>

        <Card as="section" aria-label={t('kidsplay.me.lang.title')}>
          <LanguageChoices legend={t('kidsplay.me.lang.title')} value={locale} onChange={changeLocale} name="me-language" />
        </Card>

        <Card as="section" aria-label={t('kidsplay.me.subjects.title')}>
          {student ? (
            <SubjectChoices wide legend={t('kidsplay.me.subjects.title')} value={subjects} onChange={setSubjects} error={subjectError} />
          ) : (
            <p className="text-lg text-ink-soft">
              {t('kidsplay.me.setup.note')}{' '}
              <Link to="/onboarding" className="font-bold text-brand-700 underline outline-none focus-visible:shadow-focus">
                {t('kidsplay.me.setup.link')}
              </Link>
            </p>
          )}
        </Card>

        <BigActionButton type="submit" icon={<Save />} disabled={saving} aria-busy={saving || undefined} fullWidth className="md:w-auto md:self-start">
          {t('kidsplay.me.save')}
        </BigActionButton>
      </form>

      <Card as="section" aria-label={t('kidsplay.me.settings.title')}>
        <h2 className="mb-3 text-xl font-bold text-ink">{t('kidsplay.me.settings.title')}</h2>
        <div className="flex flex-col gap-3">
          <SettingToggle
            icon={Wind}
            label={t('kidsplay.me.toggle.motion')}
            on={reduceMotion}
            onChange={(v) => {
              setPref('reduceMotion', v);
              announce(t(v ? 'profile.a11y.reduceMotion.on' : 'profile.a11y.reduceMotion.off'));
            }}
          />
          <SettingToggle
            icon={Type}
            label={t('kidsplay.me.toggle.text')}
            on={largeText}
            onChange={(v) => {
              setPref('largeText', v);
              announce(t(v ? 'profile.a11y.largeText.on' : 'profile.a11y.largeText.off'));
            }}
          />
          <SettingToggle
            icon={PartyPopper}
            label={t('kidsplay.me.toggle.party')}
            on={party.enabled}
            onChange={(v) => {
              party.setEnabled(v);
              announce(t(v ? 'kidsplay.me.party.on' : 'kidsplay.me.party.off'));
            }}
          />
          <SettingToggle
            icon={Volume2}
            label={t('games.me.sound')}
            on={sound}
            onChange={(v) => {
              setSound(v);
              announce(t(v ? 'games.me.sound.on' : 'games.me.sound.off'));
            }}
          />
        </div>
      </Card>

      <details className="group/gu rounded-lg border border-line bg-surface shadow-card">
        <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-3 rounded-lg p-4 text-xl font-bold text-ink outline-none focus-visible:shadow-focus [&::-webkit-details-marker]:hidden">
          <span>
            {t('kidsplay.me.grownups.title')}
            <span className="block text-base font-normal text-ink-soft">{t('kidsplay.me.grownups.note')}</span>
          </span>
          <ChevronDown aria-hidden className="h-6 w-6 shrink-0 transition-transform duration-base group-open/gu:rotate-180" />
        </summary>
        <div className="flex flex-col gap-6 border-t border-line p-4">
          <NotificationsCard profile={profile} />
          <PasswordCard userId={user.id} />
          <DataCard />
        </div>
      </details>

      <SignOutCard />
    </div>
  );
}
