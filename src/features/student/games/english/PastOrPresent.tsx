import { useState } from 'react';
import { Check } from 'lucide-react';
import { BigActionButton } from '@/components/ui';
import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { DragDropZone, RoundFeedback, useGameSession, type DragItem, type DropZone, type GameSession } from '../engine';
import { makeTenseRound, ROUNDS_PER_PLAY, type TenseRound } from './pastOrPresent.generator';

function RoundView({ session }: { session: GameSession<TenseRound> }) {
  const t = useT();
  const { round, status } = session;
  const asking = status === 'asking';
  const [placements, setPlacements] = useState<Record<string, string | null>>({});
  const items: DragItem[] = round.items.map((s, i) => ({ id: `s${i}`, label: s.text, text: s.text, lang: 'en' }));
  const zones: DropZone[] = [
    { id: 'past', label: t('games.english.pastOrPresent.zone.past') },
    { id: 'present', label: t('games.english.pastOrPresent.zone.present') },
  ];
  const allPlaced = items.every((i) => placements[i.id]);

  const check = () => {
    if (!asking || !allPlaced) return;
    const wrongAt = round.items.findIndex((s, i) => placements[`s${i}`] !== s.tense);
    if (wrongAt < 0) return session.answer(true);
    const s = round.items[wrongAt];
    session.answer(false, t(`games.english.pastOrPresent.explain.${s.tense}`, { cue: s.cue }));
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xl font-bold text-ink">{t('games.english.pastOrPresent.question')}</p>
      <DragDropZone
        label={t('games.english.pastOrPresent.label')}
        items={items}
        zones={zones}
        placements={placements}
        disabled={!asking}
        onPlace={(id, zone) => setPlacements((p) => ({ ...p, [id]: zone }))}
      />
      {asking && (
        <div>
          <BigActionButton icon={<Check />} disabled={!allPlaced} onClick={check}>
            {t('games.english.common.check')}
          </BigActionButton>
        </div>
      )}
      <RoundFeedback session={session} />
    </div>
  );
}

export default function PastOrPresent(props: GameComponentProps) {
  void props;
  const session = useGameSession<TenseRound>({ rounds: ROUNDS_PER_PLAY, makeRound: makeTenseRound });
  return <RoundView key={session.index} session={session} />;
}
