import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { BigActionButton, cn, SpeakButton } from '@/components/ui';
import { focusRing } from '@/components/ui/cn';
import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { playSound, RoundFeedback, useGameSession, type GameSession } from '../engine';
import { makeScrambleRound, ROUNDS_PER_PLAY, type ScrambleRound } from './sentenceScramble.generator';

const wordCls = cn('min-h-14 min-w-14 rounded-xl border-2 px-4 py-2 text-xl font-bold transition duration-fast ease-standard motion-ok:active:scale-95 motion-reduce:transition-none', focusRing);

function RoundView({ session }: { session: GameSession<ScrambleRound> }) {
  const t = useT();
  const { round, status } = session;
  const asking = status === 'asking';
  const [placed, setPlaced] = useState<number[]>([]); // indexes into round.tiles, in sentence order
  const focusNext = useRef<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const built = placed.map((i) => round.tiles[i]).join(' ');
  const complete = placed.length === round.tiles.length;

  // Tapped tiles leave the place the finger was: send keyboard focus to the next useful button.
  useEffect(() => {
    if (!focusNext.current) return;
    const el = root.current?.querySelector<HTMLElement>(focusNext.current);
    focusNext.current = null;
    el?.focus();
  });

  const add = (i: number) => {
    if (!asking) return;
    playSound('tap');
    focusNext.current = placed.length + 1 === round.tiles.length ? '[data-check]' : '[data-bank] button:not([disabled])';
    setPlaced([...placed, i]);
  };
  const remove = (i: number) => {
    if (!asking) return;
    playSound('tap');
    focusNext.current = `[data-tile="${i}"]`;
    setPlaced(placed.filter((p) => p !== i));
  };
  const check = () => asking && complete && session.answer(built === round.sentence, t('games.english.sentenceScramble.explain', { sentence: round.sentence }));

  return (
    <div ref={root} className="flex flex-col gap-5">
      <p className="text-xl font-bold text-ink">{t('games.english.sentenceScramble.prompt')}</p>
      <div>
        <p className="mb-2 text-lg font-bold text-ink-soft">{t('games.english.sentenceScramble.yourSentence')}</p>
        <ol lang="en" aria-label={t('games.english.sentenceScramble.yourSentence')} className="flex min-h-20 flex-wrap items-center gap-2 rounded-xl border-2 border-dashed border-brand-500 bg-brand-50 p-3">
          {placed.map((i) => (
            <li key={i}>
              <button type="button" data-tile={i} disabled={!asking} aria-label={t('games.drag.takeBack', { item: round.tiles[i] })} onClick={() => remove(i)} className={cn(wordCls, 'border-brand-600 bg-surface text-brand-700')}>
                {round.tiles[i]}
              </button>
            </li>
          ))}
          {placed.length === 0 && <li className="text-lg text-ink-soft">{t('games.english.sentenceScramble.empty')}</li>}
        </ol>
      </div>
      <div>
        <p className="mb-2 text-lg font-bold text-ink-soft">{t('games.english.sentenceScramble.words')}</p>
        <ul data-bank lang="en" aria-label={t('games.english.sentenceScramble.words')} className="flex min-h-16 flex-wrap gap-3">
          {round.tiles.map((w, i) =>
            placed.includes(i) ? null : (
              <li key={i}>
                <button type="button" data-tile={i} disabled={!asking} onClick={() => add(i)} className={cn(wordCls, 'border-brand-100 bg-surface text-ink hover:border-brand-500 hover:bg-brand-50')}>
                  {w}
                </button>
              </li>
            ),
          )}
        </ul>
      </div>
      {asking && (
        <div>
          <BigActionButton data-check icon={<Check />} disabled={!complete} onClick={check}>
            {t('games.english.common.check')}
          </BigActionButton>
        </div>
      )}
      {!asking && (
        <div className="flex items-center gap-3">
          <p lang="en" className="text-xl font-bold text-ink">
            {round.sentence}
          </p>
          <SpeakButton text={round.sentence} locale="en" />
        </div>
      )}
      <RoundFeedback session={session} />
    </div>
  );
}

export default function SentenceScramble(props: GameComponentProps) {
  void props;
  const session = useGameSession<ScrambleRound>({ rounds: ROUNDS_PER_PLAY, makeRound: makeScrambleRound });
  return <RoundView key={session.index} session={session} />;
}
