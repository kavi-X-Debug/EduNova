import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { useGameSession, type GameSession } from '../engine';
import { WaterCycleScene } from './ScienceFx';
import { SequenceRoundView } from './SequenceRound';
import { makeWaterRound, ROUNDS_PER_PLAY, type WaterRound } from './waterCycleOrder.generator';

const P = 'games.science.waterCycleOrder';

function RoundView({ session }: { session: GameSession<WaterRound> }) {
  const t = useT();
  const { round } = session;
  return (
    <SequenceRoundView
      session={session}
      round={round}
      question={t(`${P}.question`)}
      itemKey={(id) => `${P}.stage.${id}`}
      explainKey={`${P}.explain`}
      intro={
        <div className="flex flex-col items-center gap-2">
          <WaterCycleScene status={session.status} />
          <h2 className="text-xl font-bold text-ink">{t(`${P}.theme.${round.theme}`)}</h2>
        </div>
      }
    />
  );
}

export default function WaterCycleOrder(props: GameComponentProps) {
  void props;
  const session = useGameSession<WaterRound>({ rounds: ROUNDS_PER_PLAY, makeRound: makeWaterRound });
  return <RoundView key={session.index} session={session} />;
}
