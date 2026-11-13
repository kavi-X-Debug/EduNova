import { Circle, CircleCheck, Compass, Mountain, Rocket, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BigActionButton, Card, cn } from '@/components/ui';
import type { Quest } from '@/types';

export interface QuestCardProps {
  quest: Quest;
  /** The adventure to try first: its button is the big primary one. */
  featured?: boolean;
  /** Picks the picture and colour (stable per adventure). */
  index: number;
  pendingIds: ReadonlySet<string>;
  onComplete: (quest: Quest, missionId: string) => void;
}

const THEMES = [
  { icon: Rocket, tile: 'bg-brand-100 text-brand-700', top: 'border-t-brand-500' },
  { icon: Mountain, tile: 'bg-success-50 text-success-700', top: 'border-t-success-500' },
  { icon: Compass, tile: 'bg-warning-50 text-warning-700', top: 'border-t-accent-500' },
];

/**
 * One adventure as a big colourful card: a picture, a row of stars (one per step, no percent),
 * the steps with ONE clear "Do this" step and one big button.
 */
export function QuestCard({ quest, featured, index, pendingIds, onComplete }: QuestCardProps) {
  const { t } = useTranslation();
  const theme = THEMES[index % THEMES.length];
  const Icon = theme.icon;
  const title = t(quest.titleKey);
  const complete = quest.status === 'complete';
  const doneCount = quest.missions.filter((m) => m.done).length;
  const current = complete ? undefined : quest.missions.find((m) => !m.done);
  const headingId = `quest-${quest.id}`;

  return (
    <Card as="article" aria-labelledby={headingId} interactive className={cn('flex flex-col gap-4 border-t-8', theme.top)}>
      <div className="flex items-center gap-4">
        <span aria-hidden className={cn('flex h-20 w-20 shrink-0 items-center justify-center rounded-xl', theme.tile)}>
          <Icon aria-hidden className="fx-icon h-11 w-11" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 id={headingId} tabIndex={-1} className="text-xl font-bold text-ink outline-none focus-visible:shadow-focus md:text-2xl">
            {title}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-base font-semibold text-ink-soft">
            <Star aria-hidden className="h-5 w-5 shrink-0 fill-accent-500 text-accent-600" />
            {t('kidsplay.adv.stars', { count: quest.xp })}
          </p>
        </div>
      </div>

      {/* Progress as stars: one star per step. */}
      <div role="img" aria-label={t('kidsplay.adv.steps', { done: doneCount, total: quest.missions.length })} className="flex flex-wrap gap-1.5">
        {quest.missions.map((m) => (
          <Star
            key={m.id}
            aria-hidden
            className={cn('h-9 w-9', m.done ? 'fill-accent-500 text-accent-600 motion-ok:animate-fx-pop-in' : 'text-ink-faint')}
          />
        ))}
      </div>

      {complete && (
        <p className="flex items-center gap-2 rounded-lg bg-success-50 p-3 text-lg font-bold text-success-700">
          <CircleCheck aria-hidden className="h-7 w-7 shrink-0" />
          {t('kidsplay.adv.finished')}
        </p>
      )}

      <ol className="flex flex-col gap-3">
        {quest.missions.map((m) => {
          const missionTitle = t(m.titleKey);
          const isCurrent = current?.id === m.id;
          return (
            <li
              key={m.id}
              aria-current={isCurrent ? 'step' : undefined}
              className={cn('flex flex-col gap-3 rounded-lg border-2 p-3', isCurrent ? 'border-brand-500 bg-brand-50' : 'border-line bg-surface-muted')}
            >
              <p className="flex items-start gap-3 text-lg text-ink">
                {m.done ? <CircleCheck aria-hidden className="mt-0.5 h-6 w-6 shrink-0 text-success-700" /> : <Circle aria-hidden className="mt-0.5 h-6 w-6 shrink-0 text-ink-faint" />}
                <span className={cn('min-w-0 flex-1', isCurrent ? 'font-bold' : m.done ? 'text-ink-soft' : 'font-semibold')}>
                  {isCurrent && <span className="block text-sm font-bold text-brand-700">{t('kidsplay.adv.do')}</span>}
                  {missionTitle}
                  <span className="sr-only"> ({m.done ? t('kidsplay.adv.step.done') : t('kidsplay.adv.step.todo')})</span>
                </span>
              </p>
              {isCurrent && (
                <BigActionButton
                  variant={featured ? 'primary' : 'secondary'}
                  disabled={pendingIds.has(m.id)}
                  aria-busy={pendingIds.has(m.id) || undefined}
                  icon={<Star />}
                  aria-label={t('kidsplay.adv.didIt.label', { title: missionTitle })}
                  onClick={() => onComplete(quest, m.id)}
                  fullWidth
                  className="md:w-auto md:self-start"
                >
                  {t('kidsplay.adv.didIt')}
                </BigActionButton>
              )}
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
