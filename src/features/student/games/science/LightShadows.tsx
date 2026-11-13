import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { useGameSession, type GameSession } from '../engine';
import { ShadowScene } from './art';
import { makeLightRound, ROUNDS_PER_PLAY, type LightRound } from './lightShadows.generator';
import { SortRoundView } from './SortRound';

const P = 'games.science.lightShadows';

function RoundView({ session }: { session: GameSession<LightRound> }) {
  const t = useT();
  const { round } = session;
  const isSource = round.bins.includes('source');
  return (
    <div className="flex flex-col gap-4">
      {!isSource && (
        <div className="flex justify-center">
          <ShadowScene />
        </div>
      )}
      <SortRoundView session={session} round={round} prefix={P} question={t(isSource ? `${P}.sourceQuestion` : `${P}.materialQuestion`)} />
    </div>
  );
}

export default function LightShadows(props: GameComponentProps) {
  void props;
  const session = useGameSession<LightRound>({ rounds: ROUNDS_PER_PLAY, makeRound: makeLightRound });
  return <RoundView key={session.index} session={session} />;
}
