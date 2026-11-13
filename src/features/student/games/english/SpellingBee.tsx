import { useState, type KeyboardEvent } from 'react';
import { Check, Undo2 } from 'lucide-react';
import { BigActionButton, cn, SpeakButton } from '@/components/ui';
import { focusRing } from '@/components/ui/cn';
import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { RoundFeedback, useGameSession, type GameSession } from '../engine';
import { makeSpellingRound, ROUNDS_PER_PLAY, type SpellingRound } from './spellingBee.generator';

const tileCls = cn(
  'flex h-16 min-w-16 items-center justify-center rounded-xl border-2 text-3xl font-bold transition duration-fast ease-standard motion-ok:active:scale-95 motion-reduce:transition-none',
  focusRing,
);

function RoundView({ session }: { session: GameSession<SpellingRound> }) {
  const t = useT();
  const { round, status } = session;
  const asking = status === 'asking';
  const [chosen, setChosen] = useState<number[]>([]); // indexes into round.letters, in the order tapped
  const [typed, setTyped] = useState('');
  const why = t('games.english.spellingBee.explain', { spelled: round.spelled });
  const size = round.word.length;
  const built = chosen.map((i) => round.letters[i]).join('');
  const answerText = round.mode === 'tap' ? built : typed.trim().toLowerCase();
  const ready = round.mode === 'tap' ? chosen.length === size : answerText.length > 0;

  const check = () => {
    if (asking && ready) session.answer(answerText === round.word, why);
  };
  const tap = (i: number) => asking && !chosen.includes(i) && chosen.length < size && setChosen([...chosen, i]);
  const undo = () => asking && setChosen(chosen.slice(0, -1));

  // Typing on a real keyboard picks the matching tile; Backspace undoes. Buttons keep their own Enter/Space.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (round.mode !== 'tap' || !asking || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Backspace') {
      e.preventDefault();
      undo();
    } else if (/^[a-z]$/i.test(e.key)) {
      const at = round.letters.findIndex((l, i) => l === e.key.toLowerCase() && !chosen.includes(i));
      if (at >= 0) tap(at);
    }
  };

  return (
    <div className="flex flex-col gap-5" onKeyDown={onKeyDown}>
      <div className="flex items-start gap-3 rounded-xl border-2 border-brand-100 bg-brand-50 p-4">
        <div className="flex-1">
          <p className="text-lg font-bold text-ink-soft">{t('games.english.spellingBee.clue')}</p>
          <p lang="en" className="text-xl font-bold text-ink">
            {round.clue}
          </p>
        </div>
        <SpeakButton text={round.word} locale="en" />
      </div>
      <p className="text-xl font-bold text-ink">{t(round.mode === 'tap' ? 'games.english.spellingBee.promptTap' : 'games.english.spellingBee.promptType')}</p>

      {round.mode === 'tap' ? (
        <>
          <div role="group" aria-label={t('games.english.spellingBee.yourWord')} lang="en" className="flex flex-wrap gap-2">
            {Array.from({ length: size }, (_, i) => (
              <span key={i} aria-hidden className="flex h-16 min-w-12 items-center justify-center border-b-4 border-brand-500 text-3xl font-bold text-ink">
                {built[i] ?? ' '}
              </span>
            ))}
          </div>
          <p role="status" aria-live="polite" className="sr-only">
            {built ? t('games.english.spellingBee.soFar', { word: built.split('').join(' ') }) : ''}
          </p>
          <div role="group" aria-label={t('games.english.spellingBee.tiles')} lang="en" className="flex flex-wrap gap-3">
            {round.letters.map((l, i) => {
              const used = chosen.includes(i);
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!asking || used}
                  onClick={() => tap(i)}
                  className={cn(tileCls, used ? 'border-line bg-surface-sunken text-ink-faint' : 'border-brand-100 bg-surface text-ink hover:border-brand-500 hover:bg-brand-50')}
                >
                  {l}
                </button>
              );
            })}
          </div>
          <div>
            <BigActionButton variant="secondary" icon={<Undo2 />} disabled={!asking || chosen.length === 0} onClick={undo}>
              {t('games.english.spellingBee.undo')}
            </BigActionButton>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-2">
          <label htmlFor={`spell-${session.index}`} className="text-lg font-bold text-ink">
            {t('games.english.spellingBee.inputLabel')}
          </label>
          <input
            id={`spell-${session.index}`}
            lang="en"
            value={typed}
            disabled={!asking}
            maxLength={16}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-describedby={`spell-hint-${session.index}`}
            onChange={(e) => setTyped(e.target.value.replace(/[^a-zA-Z]/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && check()}
            className={cn('min-h-14 w-full max-w-sm rounded-xl border-2 border-brand-100 bg-surface px-4 text-2xl font-bold text-ink', focusRing, !asking && 'opacity-60')}
          />
          <p id={`spell-hint-${session.index}`} className="text-lg text-ink-soft">
            {t('games.english.spellingBee.typeHint', { n: size, letter: round.word[0] })}
          </p>
        </div>
      )}

      {asking && (
        <div>
          <BigActionButton icon={<Check />} disabled={!ready} onClick={check}>
            {t('games.english.common.check')}
          </BigActionButton>
        </div>
      )}
      <RoundFeedback session={session} />
    </div>
  );
}

export default function SpellingBee(props: GameComponentProps) {
  void props;
  const session = useGameSession<SpellingRound>({ rounds: ROUNDS_PER_PLAY, makeRound: makeSpellingRound });
  return <RoundView key={session.index} session={session} />;
}
