import { useState, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { BigActionButton } from '@/components/ui';
import { useGt as useT } from '@/features/student/games/useGt';
import { DragDropZone, RoundFeedback, type GameSession } from '../engine';
import { Named } from './art';
import type { SequenceRound } from './sortHelpers';

/**
 * "Put in order" for the science games. `itemKey(id)` is the translation key of a step's text,
 * `explainKey` takes `{{order}}` (the right order, joined with arrows). Each place holds one step.
 */
export function SequenceRoundView({
  session,
  round,
  question,
  itemKey,
  explainKey,
  stepKey = 'games.science.common.step',
  intro,
}: {
  session: GameSession<unknown>;
  round: SequenceRound;
  question: string;
  itemKey: (id: string) => string;
  explainKey: string;
  stepKey?: string;
  intro?: ReactNode;
}) {
  const t = useT();
  const [placements, setPlacements] = useState<Record<string, string | null>>({});
  const asking = session.status === 'asking';
  const allPlaced = round.order.every((id) => placements[id]);
  const name = (id: string) => t(itemKey(id));

  const check = () => {
    const ok = round.order.every((id, i) => placements[id] === `s${i}`);
    session.answer(ok, t(explainKey, { order: round.order.map(name).join(' → ') }));
  };

  return (
    <div className="flex flex-col gap-5">
      {intro}
      <p className="text-xl font-bold text-ink">{question}</p>
      <DragDropZone
        label={question}
        disabled={!asking}
        items={round.shuffled.map((id) => ({ id, text: name(id), label: <Named id={id} text={name(id)} /> }))}
        zones={round.order.map((_, i) => ({ id: `s${i}`, label: t(stepKey, { n: i + 1 }), capacity: 1 }))}
        placements={placements}
        onPlace={(id, zone) => setPlacements((p) => ({ ...p, [id]: zone }))}
      />
      {asking && (
        <div className="flex flex-col items-center gap-2">
          <BigActionButton icon={<Check />} disabled={!allPlaced} onClick={check} aria-describedby={allPlaced ? undefined : 'science-place-all'}>
            {t('games.science.common.check')}
          </BigActionButton>
          {!allPlaced && (
            <p id="science-place-all" className="text-lg text-ink-soft">
              {t('games.science.common.placeAll')}
            </p>
          )}
        </div>
      )}
      <RoundFeedback session={session} />
    </div>
  );
}
