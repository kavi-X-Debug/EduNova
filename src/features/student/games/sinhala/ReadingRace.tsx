import { useState } from 'react';
import { ArrowRight, BookOpen, X } from 'lucide-react';
import { BigActionButton, SpeakButton, cn } from '@/components/ui';
import { useGt as useT } from '@/features/student/games/useGt';
import { announce } from '@/lib/a11y';
import type { GameComponentProps } from '@/types';
import { BigChoiceButton, ChoiceGroup, RoundFeedback, useGameSession, type GameSession } from '../engine';
import { makeReadingRound, ROUNDS_PER_PLAY, type ReadingRound } from './readingRace.generator';

function RoundView({ session }: { session: GameSession<ReadingRound> }) {
  const t = useT();
  const { round, status } = session;
  const asking = status === 'asking';
  const [picked, setPicked] = useState<string | null>(null);
  /** Read-along: index of the highlighted line, or null when it is off. */
  const [line, setLine] = useState<number | null>(null);
  const total = round.sentences.length;
  const why = t('games.sinhala.readingRace.explain', { answer: round.answer });

  const go = (to: number | null) => {
    setLine(to);
    if (to !== null) announce(t('games.sinhala.readingRace.lineOf', { n: to + 1, total }));
  };

  return (
    <div className="flex flex-col gap-5">
      <section aria-label={t('games.sinhala.readingRace.story')} className="rounded-xl border-2 border-brand-100 bg-surface p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-ink">{t('games.sinhala.readingRace.story')}</h3>
          <SpeakButton text={round.sentences.join(' ')} locale="si" />
        </div>
        <p lang="si" className="text-2xl text-ink">
          {round.sentences.map((s, i) => (
            <span key={i} aria-current={line === i ? 'true' : undefined} className={cn('rounded px-1', line === i && 'bg-brand-100 font-bold underline decoration-brand-600 decoration-2 underline-offset-4')}>
              {s}{' '}
            </span>
          ))}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {line === null ? (
            <BigActionButton variant="secondary" icon={<BookOpen />} onClick={() => go(0)}>
              {t('games.sinhala.readingRace.readAlong')}
            </BigActionButton>
          ) : (
            <>
              {line < total - 1 && (
                <BigActionButton variant="secondary" icon={<ArrowRight />} onClick={() => go(line + 1)}>
                  {t('games.sinhala.readingRace.nextLine')}
                </BigActionButton>
              )}
              <BigActionButton variant="secondary" icon={<X />} onClick={() => setLine(null)}>
                {t('games.sinhala.readingRace.stopAlong')}
              </BigActionButton>
              <p className="text-base text-ink-soft">{t('games.sinhala.readingRace.lineOf', { n: line + 1, total })}</p>
            </>
          )}
        </div>
      </section>
      <p lang="si" className="text-xl font-bold text-ink">
        <span className="sr-only">{t('games.sinhala.readingRace.question')}: </span>
        {round.question}
      </p>
      <ChoiceGroup label={t('games.sinhala.readingRace.question')} columns={1}>
        {round.options.map((o) => (
          <BigChoiceButton
            key={o}
            lang="si"
            disabled={!asking}
            state={asking ? 'idle' : o === round.answer ? 'right' : o === picked ? 'wrong' : 'dim'}
            onClick={() => {
              setPicked(o);
              session.answer(o === round.answer, why);
            }}
          >
            {o}
          </BigChoiceButton>
        ))}
      </ChoiceGroup>
      <RoundFeedback session={session} />
    </div>
  );
}

export default function ReadingRace(props: GameComponentProps) {
  void props;
  const session = useGameSession<ReadingRound>({ rounds: ROUNDS_PER_PLAY, makeRound: makeReadingRound });
  return <RoundView key={session.index} session={session} />;
}
