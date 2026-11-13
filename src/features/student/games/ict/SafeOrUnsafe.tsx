import { useState } from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { BigChoiceButton, ChoiceGroup, RoundFeedback, useGameSession, type GameSession } from '../engine';
import { BEHAVIOURS, makeSafeRound, ROUNDS_PER_PLAY, type SafeRound } from './safeOrUnsafe.generator';
import { SafeStage } from './ictSprites';
import { SortBoard } from './SortBoard';

const P = 'games.ict.safeOrUnsafe';

function OneView({ session, round }: { session: GameSession<SafeRound>; round: Extract<SafeRound, { mode: 'one' }> }) {
  const t = useT();
  const [picked, setPicked] = useState<boolean | null>(null);
  const asking = session.status === 'asking';
  const why = t(`${P}.why.${round.item}`);
  return (
    <div className="flex flex-col gap-4">
      <SafeStage status={session.status} safe={round.safe} />
      <p className="text-xl font-bold text-ink">{t(`${P}.qOne`)}</p>
      <p className="rounded-xl border-2 border-brand-600 bg-surface px-4 py-5 text-center text-2xl font-bold text-ink">{t(`${P}.item.${round.item}`)}</p>
      <ChoiceGroup label={t(`${P}.qOne`)} columns={1}>
        {[true, false].map((safe) => (
          <BigChoiceButton
            key={String(safe)}
            disabled={!asking}
            state={asking ? 'idle' : safe === round.safe ? 'right' : safe === picked ? 'wrong' : 'dim'}
            onClick={() => {
              setPicked(safe);
              session.answer(safe === round.safe, why);
            }}
          >
            <span className="flex items-center gap-2">
              {safe ? <ShieldCheck aria-hidden className="h-7 w-7" /> : <ShieldAlert aria-hidden className="h-7 w-7" />}
              {t(`${P}.${safe ? 'safe' : 'unsafe'}`)}
            </span>
          </BigChoiceButton>
        ))}
      </ChoiceGroup>
    </div>
  );
}

function PasswordView({ session, round }: { session: GameSession<SafeRound>; round: Extract<SafeRound, { mode: 'password' }> }) {
  const t = useT();
  const [picked, setPicked] = useState<string | null>(null);
  const asking = session.status === 'asking';
  return (
    <div className="flex flex-col gap-4">
      <SafeStage status={session.status} safe />
      <p className="text-xl font-bold text-ink">{t(`${P}.qPass`)}</p>
      <ChoiceGroup label={t(`${P}.qPass`)} columns={1}>
        {round.options.map((o) => (
          <BigChoiceButton
            key={o}
            lang="en"
            disabled={!asking}
            state={asking ? 'idle' : o === round.answer ? 'right' : o === picked ? 'wrong' : 'dim'}
            onClick={() => {
              setPicked(o);
              session.answer(o === round.answer, t(`${P}.explainPass`));
            }}
          >
            <span className="font-mono tracking-wide">{o}</span>
          </BigChoiceButton>
        ))}
      </ChoiceGroup>
    </div>
  );
}

function RoundView({ session }: { session: GameSession<SafeRound> }) {
  const t = useT();
  const round = session.round;
  const zones = [
    { id: 'safe', label: t(`${P}.safe`) },
    { id: 'unsafe', label: t(`${P}.unsafe`) },
  ];
  return (
    <div className="flex flex-col gap-5">
      {round.mode === 'one' && <OneView session={session} round={round} />}
      {round.mode === 'password' && <PasswordView session={session} round={round} />}
      {round.mode === 'sort' && (
        <SortBoard
          session={session}
          label={t(`${P}.qSort`)}
          items={round.items.map((id) => ({ id, text: t(`${P}.item.${id}`), label: t(`${P}.item.${id}`) }))}
          zones={zones}
          answers={Object.fromEntries(round.items.map((id) => [id, BEHAVIOURS[id] ? 'safe' : 'unsafe']))}
          checkLabel={t(`${P}.check`)}
          zoneSprites={{ safe: 'shield-check', unsafe: 'warning-sign' }}
          explain={(id) => t(`${P}.why.${id}`)}
        />
      )}
      <RoundFeedback session={session} />
    </div>
  );
}

/** Safe or Unsafe?: tap, sort into bins, strongest password. No real accounts, nothing typed. See docs/GAMES-AUTHORING.md. */
export default function SafeOrUnsafe(props: GameComponentProps) {
  void props;
  const session = useGameSession<SafeRound>({ rounds: ROUNDS_PER_PLAY, makeRound: makeSafeRound });
  return <RoundView key={session.index} session={session} />;
}
