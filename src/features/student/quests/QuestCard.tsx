import { CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Card, DrawCheck, ProgressBar } from '@/components/ui';
import type { Quest } from '@/types';

export interface QuestCardProps {
  quest: Quest;
  pendingIds: ReadonlySet<string>;
  onComplete: (quest: Quest, missionId: string) => void;
}

export function QuestCard({ quest, pendingIds, onComplete }: QuestCardProps) {
  const { t } = useTranslation();
  const title = t(quest.titleKey);
  const complete = quest.status === 'complete';
  const doneCount = quest.missions.filter((m) => m.done).length;
  const percent = quest.missions.length ? (doneCount / quest.missions.length) * 100 : 0;
  const headingId = `quest-${quest.id}`;

  return (
    <Card as="article" aria-labelledby={headingId} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 id={headingId} tabIndex={-1} className="text-lg font-semibold text-ink outline-none focus-visible:shadow-focus">
          {title}
        </h3>
        <div className="flex flex-wrap gap-2">
          <Badge tone="brand" icon={<Sparkles className="h-3 w-3" />}>
            {t('student.quests.xp', { xp: quest.xp })}
          </Badge>
          <Badge tone={complete ? 'success' : 'neutral'} icon={complete ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}>
            {complete ? t('student.quests.status.complete') : t('student.quests.status.open')}
          </Badge>
        </div>
      </div>

      <ProgressBar
        value={percent}
        tone={complete ? 'success' : 'brand'}
        label={t('student.quests.progress.label', { title })}
        showValue
      />

      {complete && <p className="text-sm font-medium text-success-700">{t('student.quests.complete')}</p>}

      <ul className="flex flex-col gap-3">
        {quest.missions.map((m) => {
          const missionTitle = t(m.titleKey);
          const pending = pendingIds.has(m.id);
          return (
            <li key={m.id} className="flex flex-col gap-2 rounded-md border border-line bg-surface-muted p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <p className="flex items-start gap-2 text-sm font-medium text-ink">
                  {m.done ? (
                    <DrawCheck className="mt-0.5 shrink-0 text-success-700" />
                  ) : (
                    <Circle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
                  )}
                  <span>{missionTitle}</span>
                </p>
                <p className="mt-1 pl-6 text-xs text-ink-soft">
                  {m.done ? t('student.quests.status.complete') : t('student.quests.mission.progress', { progress: m.progress, target: m.target })}
                </p>
              </div>
              {!m.done && (
                <Button
                  variant="secondary"
                  loading={pending}
                  loadingLabel={t('a11y.loading')}
                  onClick={() => onComplete(quest, m.id)}
                  aria-label={t('student.quests.mission.markDoneLabel', { title: missionTitle })}
                  className="w-full sm:w-auto"
                >
                  {t('student.quests.mission.markDone')}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
