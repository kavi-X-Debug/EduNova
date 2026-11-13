import { useState } from 'react';
import { Check, Heart } from 'lucide-react';
import { BigActionButton } from '@/components/ui';
import { useGt as useT } from '@/features/student/games/useGt';
import { DragDropZone, RoundFeedback, type GameSession } from '../engine';
import { Named } from './art';
import { wrongItems, type SortRound } from './sortHelpers';

/**
 * "Sort into bins" for the science games. Keys under `prefix` (e.g. `games.science.magnetLab`):
 * `item.<id>`, `bin.<binId>`, `rule.<binId>` (one kind sentence about why things go in that bin).
 * The child drags (or taps, or uses the keyboard) every item into a bin, presses Check, and gets ONE attempt.
 */
export function SortRoundView({ session, round, prefix, question }: { session: GameSession<unknown>; round: SortRound; prefix: string; question: string }) {
  const t = useT();
  const [placements, setPlacements] = useState<Record<string, string | null>>({});
  const asking = session.status === 'asking';
  const allPlaced = round.items.every((id) => placements[id]);
  const name = (id: string) => t(`${prefix}.item.${id}`);
  const binName = (b: string) => t(`${prefix}.bin.${b}`);

  const check = () => {
    const wrong = wrongItems(round, placements);
    const first = wrong[0];
    session.answer(
      wrong.length === 0,
      first ? t('games.science.common.sortWhy', { item: name(first), bin: binName(round.truth[first]), rule: t(`${prefix}.rule.${round.truth[first]}`) }) : undefined,
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xl font-bold text-ink">{question}</p>
      <DragDropZone
        label={question}
        disabled={!asking}
        items={round.items.map((id) => ({ id, text: name(id), label: <Named id={id} text={name(id)} /> }))}
        zones={round.bins.map((b) => ({ id: b, label: binName(b) }))}
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
      {!asking && (
        <ul aria-label={t('games.science.common.answers')} className="grid gap-2 sm:grid-cols-2">
          {round.items.map((id) => {
            const ok = placements[id] === round.truth[id];
            return (
              <li key={id} className="flex min-h-12 items-center gap-2 rounded-xl border-2 border-line bg-surface px-3 py-2 text-lg text-ink">
                {ok ? <Check aria-hidden className="h-6 w-6 shrink-0 text-success-700" /> : <Heart aria-hidden className="h-6 w-6 shrink-0 text-warning-700" />}
                <span className="min-w-0 break-words">{t('games.science.common.itemIn', { item: name(id), bin: binName(round.truth[id]) })}</span>
                <span className="sr-only">{ok ? t('games.choice.right') : t('games.choice.wrong')}</span>
              </li>
            );
          })}
        </ul>
      )}
      <RoundFeedback session={session} />
    </div>
  );
}
