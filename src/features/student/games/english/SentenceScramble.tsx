import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { BigActionButton, cn, SpeakButton } from '@/components/ui';
import { focusRing } from '@/components/ui/cn';
import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { playSound, RoundFeedback, useGameSession, type GameSession } from '../engine';
import { Sprite } from '../engine/Sprite';
import { useIntro } from './useIntro';
import { makeScrambleRound, ROUNDS_PER_PLAY, type ScrambleRound } from './sentenceScramble.generator';

const wordCls = cn('min-h-14 min-w-14 rounded-xl border-2 px-4 py-2 text-xl font-bold transition duration-fast ease-standard motion-ok:active:scale-95 motion-reduce:transition-none', focusRing);

function RoundView({ session }: { session: GameSession<ScrambleRound> }) {
  const t = useT();
  const { round, status } = session;
  const asking = status === 'asking';
  const [placed, setPlaced] = useState<number[]>([]); // indexes into round.tiles, in sentence order
  const focusNext = useRef<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const intro = useIntro();
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
      <div className="flex items-center gap-3">
        <Sprite name="scissors" size={56} eager className={cn('h-14 w-14', intro && 'motion-ok:animate-gx-english-snip')} />
        <p className="text-xl font-bold text-ink">{t('games.english.sentenceScramble.prompt')}</p>
      </div>
      <div>
        <p className="mb-2 flex items-center gap-2 text-lg font-bold text-ink-soft">
          <Sprite name="pencil" size={28} className="h-7 w-7" />
          {t('games.english.sentenceScramble.yourSentence')}
        </p>
        <div className="relative">
          <span aria-hidden className="pointer-events-none absolute -right-2 -top-5 z-10 rotate-12">
            <Sprite name="ribbon" size={44} className="h-11 w-11" />
          </span>
        <ol lang="en" aria-label={t('games.english.sentenceScramble.yourSentence')} className="flex min-h-20 flex-wrap items-center gap-2 rounded-xl border-2 border-dashed border-brand-500 bg-brand-50 p-3">
          {placed.map((i, pos) => (
            <li key={i} className={status === 'right' ? 'motion-ok:animate-gx-hop' : 'motion-ok:animate-gx-english-glide'} style={status === 'right' ? { animationDelay: `${pos * 80}ms` } : undefined}>
              <button type="button" data-tile={i} disabled={!asking} aria-label={t('games.drag.takeBack', { item: round.tiles[i] })} onClick={() => remove(i)} className={cn(wordCls, 'border-brand-600 bg-surface text-brand-700')}>
                {round.tiles[i]}
              </button>
            </li>
          ))}
          {placed.length === 0 && <li className="text-lg text-ink-soft">{t('games.english.sentenceScramble.empty')}</li>}
        </ol>
        </div>
      </div>
      <div>
        <p className="mb-2 text-lg font-bold text-ink-soft">{t('games.english.sentenceScramble.words')}</p>
        <ul data-bank lang="en" aria-label={t('games.english.sentenceScramble.words')} className="flex min-h-16 flex-wrap gap-3">
          {round.tiles.map((w, i) =>
            placed.includes(i) ? null : (
              <li key={i} className={intro ? 'motion-ok:animate-gx-english-fall' : undefined} style={intro ? { animationDelay: `${i * 70}ms` } : undefined}>
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
