import { useState } from 'react';
import { Check } from 'lucide-react';
import { BigActionButton } from '@/components/ui';
import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { DragDropZone, RoundFeedback, useGameSession, type GameSession } from '../engine';
import { SinhalaPicture } from './pictures';
import { isWordBuilt, makeWordBuilderRound, ROUNDS_PER_PLAY, type WordBuilderRound } from './wordBuilder.generator';

function RoundView({ session }: { session: GameSession<WordBuilderRound> }) {
  const t = useT();
  const { round, status } = session;
  const asking = status === 'asking';
  const [placements, setPlacements] = useState<Record<string, string | null>>({});

  const zones = round.answer.map((_, i) => ({ id: `z${i}`, label: t('games.sinhala.wordBuilder.slot', { n: i + 1 }), capacity: 1 }));
  const items = round.tiles.map((tile) => ({
    id: tile.id,
    text: tile.text,
    lang: 'si',
    label: (
      <span lang="si" className="text-2xl">
        {tile.text}
      </span>
    ),
  }));
  const placedTexts = zones.map((z) => round.tiles.find((tile) => placements[tile.id] === z.id)?.text);
  const full = placedTexts.every((x) => x !== undefined);
  const explain = t('games.sinhala.wordBuilder.explain', { word: round.word, pieces: round.answer.join(' · ') });

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xl font-bold text-ink">{t('games.sinhala.wordBuilder.question')}</p>
      <div className="flex items-center gap-4">
        <div className="w-28 shrink-0 rounded-xl border-2 border-brand-100 bg-surface p-2 sm:w-36">
          <SinhalaPicture id={round.picture} label={t(`games.sinhala.pic.${round.picture}`)} />
        </div>
        {!asking && (
          <p lang="si" className="text-3xl font-bold text-ink">
            {round.word}
          </p>
        )}
      </div>
      <DragDropZone
        label={t('games.sinhala.wordBuilder.activity')}
        items={items}
        zones={zones}
        placements={placements}
        disabled={!asking}
        onPlace={(id, zone) => setPlacements((p) => ({ ...p, [id]: zone }))}
      />
      {asking && (
        <div className="flex flex-col items-center gap-2">
          <BigActionButton icon={<Check />} disabled={!full} aria-describedby={full ? undefined : 'sinhala-wb-hint'} onClick={() => session.answer(isWordBuilt(round, placedTexts as string[]), explain)}>
            {t('games.sinhala.wordBuilder.check')}
          </BigActionButton>
          {!full && (
            <p id="sinhala-wb-hint" className="text-base text-ink-soft">
              {t('games.sinhala.wordBuilder.fillAll')}
            </p>
          )}
        </div>
      )}
      <RoundFeedback session={session} />
    </div>
  );
}

export default function WordBuilder(props: GameComponentProps) {
  void props;
  const session = useGameSession<WordBuilderRound>({ rounds: ROUNDS_PER_PLAY, makeRound: makeWordBuilderRound });
  return <RoundView key={session.index} session={session} />;
}
