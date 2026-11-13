import { useState, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { BigActionButton } from '@/components/ui';
import { useGt as useT } from '@/features/student/games/useGt';
import { DragDropZone, type DragItem, type DropZone, type GameSession } from '../engine';

export interface SortBoardProps<R> {
  session: GameSession<R>;
  /** Accessible name of the whole activity (the question). */
  label: string;
  /** Chip content for an item id; `text` is its plain translated name. */
  items: { id: string; label: ReactNode; text: string; lang?: string }[];
  zones: DropZone[];
  /** Item id -> the right zone id. */
  answers: Record<string, string>;
  /** One kid sentence for the first item that was in the wrong place. */
  explain: (itemId: string, rightZoneId: string) => string;
  /** Translated label of the check button. */
  checkLabel: string;
}

/**
 * Drag (or tap / keyboard) every item into a bin, then press the check button. Shared by the sort levels of Safe or Unsafe?,
 * Parts of a Computer and Folder Sorter. Keep it inside a child remounted per round (it holds the placements).
 */
export function SortBoard<R>({ session, label, items, zones, answers, explain, checkLabel }: SortBoardProps<R>) {
  const t = useT();
  const [placements, setPlacements] = useState<Record<string, string | null>>({});
  const asking = session.status === 'asking';
  const allPlaced = items.every((i) => placements[i.id]);
  const placeFor = (id: string, zone: string | null) => setPlacements((p) => ({ ...p, [id]: zone }));
  const dragItems: DragItem[] = items;

  const check = () => {
    const wrong = items.find((i) => placements[i.id] !== answers[i.id]);
    session.answer(!wrong, wrong ? explain(wrong.id, answers[wrong.id]) : undefined);
  };

  return (
    <div className="flex flex-col gap-4">
      <DragDropZone label={label} items={dragItems} zones={zones} placements={placements} onPlace={placeFor} disabled={!asking} />
      {asking && (
        <div className="flex flex-col items-center gap-2">
          <BigActionButton icon={<Check />} onClick={check} disabled={!allPlaced}>
            {checkLabel}
          </BigActionButton>
          {!allPlaced && <p className="text-base text-ink-soft">{t('games.ict.sortLeft', { count: items.filter((i) => !placements[i.id]).length })}</p>}
        </div>
      )}
    </div>
  );
}
