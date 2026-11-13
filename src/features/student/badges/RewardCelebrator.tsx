import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, BadgeImage, cn } from '@/components/ui';
import { announce, usePrefersReducedMotion } from '@/lib/a11y';
import { onRewardOutcome } from '@/services';
import { useSessionStore } from '@/store';
import type { BadgeProgress, RewardOutcome } from '@/types';

/**
 * Calm, non-modal celebration shown when a student earns a badge or reaches a new level. It never takes focus
 * (the result is announced through the shared aria-live helper), stays until dismissed, and only fades in
 * when motion is allowed. Mounted once in the app root; renders nothing for non-students.
 */
export function RewardCelebrator() {
  const { t } = useTranslation();
  const role = useSessionStore((s) => s.user?.role);
  const reduced = usePrefersReducedMotion();
  const [outcomes, setOutcomes] = useState<RewardOutcome[]>([]);
  const [shown, setShown] = useState(false);
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(() => {
    if (role !== 'student') return;
    return onRewardOutcome((outcome) => {
      const tt = tRef.current;
      setOutcomes((prev) => [...prev, outcome]);
      if (outcome.newBadges.length > 0) {
        announce(tt('rewards.celebrate.announce', { names: outcome.newBadges.map((b) => tt(b.badge.titleKey)).join(', ') }));
      }
      if (outcome.leveledUp) announce(tt('rewards.celebrate.level', { level: outcome.level }));
    });
  }, [role]);

  const has = outcomes.length > 0;
  useEffect(() => {
    if (!has) return;
    const id = window.requestAnimationFrame(() => setShown(true));
    return () => window.cancelAnimationFrame(id);
  }, [has]);

  if (role !== 'student' || outcomes.length === 0) return null;

  const badges: BadgeProgress[] = [];
  for (const o of outcomes) for (const b of o.newBadges) if (!badges.some((x) => x.badge.id === b.badge.id)) badges.push(b);
  const level = outcomes.some((o) => o.leveledUp) ? outcomes[outcomes.length - 1].level : null;
  const dismiss = () => {
    setOutcomes([]);
    setShown(false);
  };

  return (
    <section
      aria-label={t('rewards.celebrate.region')}
      className={cn(
        'fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-md rounded-lg border border-brand-100 bg-surface p-4 shadow-raised md:bottom-6 md:left-auto md:right-6 md:mx-0',
        !reduced && 'transition-opacity duration-300',
        shown || reduced ? 'opacity-100' : 'opacity-0',
      )}
    >
      <h2 className="text-base font-bold text-ink">{badges.length > 0 ? t('rewards.celebrate.title', { count: badges.length }) : t('rewards.celebrate.levelTitle')}</h2>
      {badges.length > 0 && (
        <ul className="mt-3 flex flex-col gap-3">
          {badges.map(({ badge }) => (
            <li key={badge.id} className="flex items-center gap-3">
              <BadgeImage badgeId={badge.id} rarity={badge.rarity} size="md" />
              <div>
                <p className="font-semibold text-ink">{t(badge.titleKey)}</p>
                <p className="text-sm text-ink-soft">{t(badge.descriptionKey)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {level !== null && <p className="mt-3 text-sm font-semibold text-brand-700">{t('rewards.celebrate.level', { level })}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to="/student/badges"
          onClick={dismiss}
          className="inline-flex min-h-[44px] items-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-surface outline-none hover:bg-brand-700 focus-visible:shadow-focus"
        >
          {t('rewards.celebrate.view')}
        </Link>
        <Button variant="secondary" onClick={dismiss}>
          {t('rewards.celebrate.dismiss')}
        </Button>
      </div>
    </section>
  );
}
