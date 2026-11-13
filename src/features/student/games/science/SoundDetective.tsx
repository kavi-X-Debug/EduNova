import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { useGameSession, type GameSession } from '../engine';
import { Named } from './art';
import { ChoiceRoundView } from './ChoiceRound';
import { OwlPicture, SoundItemPicture } from './ScienceFx';
import { makeSoundRound, ROUNDS_PER_PLAY, type SoundRound } from './soundDetective.generator';

const P = 'games.science.soundDetective';

function RoundView({ session }: { session: GameSession<SoundRound> }) {
  const t = useT();
  const { round } = session;
  if (round.kind === 'statement') {
    return (
      <ChoiceRoundView
        session={session}
        question={t(`${P}.statement.${round.id}`)}
        picture={<OwlPicture />}
        options={[
          { id: 'true', content: t(`${P}.true`) },
          { id: 'false', content: t(`${P}.false`) },
        ]}
        answerId={String(round.truth)}
        explanation={t(`${P}.statement.${round.id}.why`)}
      />
    );
  }
  if (round.kind === 'either') {
    const name = t(`${P}.item.${round.item}`);
    return (
      <ChoiceRoundView
        session={session}
        question={t(`${P}.${round.pair[0]}Or${round.pair[1] === 'soft' ? 'Soft' : 'Low'}`, { item: name })}
        picture={
          <div className="flex items-center gap-4 rounded-xl border-2 border-brand-100 bg-brand-50 px-6 py-4 text-ink">
            <SoundItemPicture item={round.item} status={session.status} />
            <span className="text-2xl font-bold">{name}</span>
          </div>
        }
        options={round.pair.map((trait) => ({ id: trait, content: t(`${P}.trait.${trait}`) }))}
        answerId={round.answer}
        explanation={t(`${P}.explain.${round.answer}`, { item: name })}
      />
    );
  }
  return (
    <ChoiceRoundView
      session={session}
      question={t(`${P}.ask.${round.ask}`)}
      picture={<OwlPicture size={80} />}
      options={round.options.map((id) => ({ id, content: <Named id={id} text={t(`${P}.item.${id}`)} /> }))}
      answerId={round.answer}
      explanation={t(`${P}.explainOne.${round.ask}`, { item: t(`${P}.item.${round.answer}`) })}
      columns={1}
    />
  );
}

export default function SoundDetective(props: GameComponentProps) {
  void props;
  const session = useGameSession<SoundRound>({ rounds: ROUNDS_PER_PLAY, makeRound: makeSoundRound });
  return <RoundView key={session.index} session={session} />;
}
