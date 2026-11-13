import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CircleHelp, Dices, Pause, Play, RotateCcw, Star, X } from 'lucide-react';
import { BigActionButton, Button, MascotMessage, Modal, cn } from '@/components/ui';
import { focusRing } from '@/components/ui/cn';
import { useGt as useT } from '@/features/student/games/useGt';
import { announce } from '@/lib/a11y';
import { studentService } from '@/services';
import { useSessionStore } from '@/store';
import type { GameComponentProps, GameDefinition, GameLevel } from '@/types';
import { KidLoading } from '../../learnKit/KidState';
import { GameThumb } from '../GameThumb';
import { GameContext, type GameCtx } from './GameContext';
import { FloatingStars, RoundStars, ScenePicture, StarsCountUp } from './GameFx';
import { crossedMilestone } from './milestone';
import { newSeed } from './rng';
import { computeStars } from './scoring';
import { playSound } from './sound';
import { StarsMeter } from './StarsMeter';

type Phase = 'ready' | 'playing' | 'done';
const BREAK_PIC = '/games/take-a-break.webp';
const FINISH_PIC = '/games/finish-star.webp';
const ROCKET_PIC = '/games/level-up-rocket.webp';
interface Result { correct: number; total: number; stars: 1 | 2 | 3 }

export interface GameShellProps {
  game: GameDefinition;
  /** The loaded game component (the player page resolves `game.load()` with React.lazy). */
  Game: ComponentType<GameComponentProps>;
  /** Suggested next game for "Try another game" (none = the button is hidden). */
  nextGame?: GameDefinition;
}

const LEVEL_NAMES = { 1: 'games.level.1', 2: 'games.level.2', 3: 'games.level.3' } as const;

/**
 * The stage around every game: start screen (how to play, level, optional gentle timer), the playing screen
 * (Pause, Quit and How to play always reachable, progress dots, aria-live feedback), and the finish screen
 * (Nova cheer, stars, Play again / Try another game / Back to games). Records the play via studentService.
 * Games render INSIDE it and talk to it through `useGameSession` (see games/engine/useGameSession.ts).
 */
export function GameShell({ game, Game, nextGame }: GameShellProps) {
  const t = useT();
  const navigate = useNavigate();
  const userId = useSessionStore((s) => s.user?.id) ?? '';
  const [phase, setPhase] = useState<Phase>('ready');
  const [level, setLevel] = useState<GameLevel>(1);
  const [extra, setExtra] = useState(false);
  const [seed, setSeed] = useState(() => newSeed(game.id));
  const [showHow, setShowHow] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [quitOpen, setQuitOpen] = useState(false);
  const [progress, setProgress] = useState({ index: 0, total: 0 });
  const [result, setResult] = useState<Result | null>(null);
  const [milestone, setMilestone] = useState<number>();
  const startedAt = useRef(0);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  const reportProgress = useCallback((index: number, total: number) => setProgress({ index, total }), []);
  const complete = useCallback(
    ({ correct, total }: { correct: number; total: number }) => {
      const stars = computeStars(correct, total);
      setResult({ correct, total, stars });
      setPhase('done');
      announce(t('games.finish.announce', { stars }));
      // Progress and rewards are a bonus: never block or fail the game screen. The star total before and after decides the milestone.
      void (async () => {
        const before = await studentService.listGameStats(userId).catch(() => undefined);
        const saved = await studentService
          .recordGamePlay(userId, game.id, {
            stars,
            correct,
            total,
            durationSec: Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)),
            conceptIds: game.conceptIds,
            subject: game.subject,
            level,
          })
          .catch(() => undefined);
        if (!before || !saved) return;
        const prevBest = before.find((x) => x.gameId === game.id)?.bestStars ?? 0;
        const totalBefore = before.reduce((n, x) => n + x.bestStars, 0);
        const reached = crossedMilestone(totalBefore, totalBefore - prevBest + Math.max(prevBest, saved.bestStars));
        if (reached) {
          setMilestone(reached);
          announce(t('games.milestone.body', { count: reached }));
        }
      })();
    },
    [t, userId, game, level],
  );

  const start = (fresh: boolean) => {
    if (fresh) setSeed(newSeed(game.id));
    startedAt.current = Date.now();
    setResult(null);
    setMilestone(undefined);
    setProgress({ index: 0, total: 0 });
    setShowHow(false);
    setPhase('playing');
  };

  useEffect(() => {
    if (phase === 'playing') titleRef.current?.focus();
    if (phase === 'done') doneRef.current?.focus();
  }, [phase]);

  const paused = pauseOpen || quitOpen;
  const ctx: GameCtx = useMemo(() => ({ level, seed, extraChallenge: extra, paused, reportProgress, complete }), [level, seed, extra, paused, reportProgress, complete]);
  const how = t(game.howToKey);
  const title = t(game.titleKey);

  const howPanel = (
    <MascotMessage mood={phase === 'ready' ? 'wave' : 'happy'} size="md" speakText={how}>
      <span className="block text-lg font-bold">{t('games.shell.howTitle')}</span>
      <span className="mt-1 block text-lg font-normal text-ink">{how}</span>
    </MascotMessage>
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden w-28 shrink-0 md:block">
            <GameThumb game={game} />
          </div>
          <h1 ref={titleRef} tabIndex={-1} className="text-2xl font-bold text-ink outline-none md:text-3xl">
            {title}
          </h1>
        </div>
        {phase === 'playing' && (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="xl" aria-expanded={showHow} onClick={() => setShowHow((v) => !v)}>
              <CircleHelp aria-hidden className="h-6 w-6" />
              {t('games.shell.how')}
            </Button>
            <Button variant="secondary" size="xl" onClick={() => setPauseOpen(true)}>
              <Pause aria-hidden className="h-6 w-6" />
              {t('games.shell.pause')}
            </Button>
            <Button variant="ghost" size="xl" onClick={() => setQuitOpen(true)}>
              <X aria-hidden className="h-6 w-6" />
              {t('games.shell.quit')}
            </Button>
          </div>
        )}
      </header>

      {phase === 'ready' && (
        <section aria-label={t('games.shell.ready')} className="relative isolate flex flex-col gap-6 overflow-hidden rounded-xl border border-line bg-surface p-4 shadow-card md:p-6">
          {game.thumbnail.image && (
            <>
              <ScenePicture src={game.thumbnail.image} zoom className="absolute inset-0 -z-10 h-full w-full opacity-40" />
              <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-surface/40 via-surface/80 to-surface" />
            </>
          )}
          {howPanel}
          <div>
            <h2 className="mb-2 text-xl font-bold text-ink">{t('games.shell.levelTitle')}</h2>
            <div role="group" aria-label={t('games.shell.levelTitle')} className="grid gap-3 sm:grid-cols-3">
              {game.levels.map((l) => (
                <button
                  key={l}
                  type="button"
                  aria-pressed={level === l}
                  onClick={() => {
                    playSound('tap');
                    setLevel(l);
                  }}
                  className={cn(
                    'flex min-h-16 flex-col items-center justify-center rounded-xl border-2 px-4 py-2 text-xl font-bold',
                    focusRing,
                    level === l ? 'border-brand-600 bg-brand-100 text-brand-700' : 'border-brand-100 bg-surface text-ink hover:border-brand-500',
                  )}
                >
                  <span>{t(LEVEL_NAMES[l])}</span>
                  <StarsMeter stars={l} size="sm" className="mt-1" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <button
              type="button"
              role="switch"
              aria-checked={extra}
              onClick={() => setExtra((v) => !v)}
              className={cn('flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border-2 px-4 py-2 text-left text-lg font-bold', focusRing, extra ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-line bg-surface text-ink')}
            >
              <span>
                {t('games.shell.extra')}
                <span className="block text-base font-normal text-ink-soft">{t('games.shell.extraHint')}</span>
              </span>
              <span className="shrink-0 rounded-full bg-surface-sunken px-3 py-1 text-base">{t(extra ? 'games.shell.on' : 'games.shell.off')}</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            <BigActionButton icon={<Play />} onClick={() => start(false)}>
              {t('games.shell.play')}
            </BigActionButton>
            <BigActionButton variant="secondary" to="/student/games" icon={<ArrowLeft />}>
              {t('games.finish.back')}
            </BigActionButton>
          </div>
        </section>
      )}

      {phase === 'playing' && (
        <>
          {showHow && howPanel}
          {progress.total > 0 && <RoundStars current={progress.index + 1} total={progress.total} label={t('games.shell.progress', { current: progress.index + 1, total: progress.total })} />}
          <GameContext.Provider value={ctx}>
            <div inert={paused} className="rounded-xl border border-line bg-surface p-4 shadow-card md:p-6">
              <Suspense fallback={<KidLoading />}>
                <Game key={seed} level={level} seed={seed} />
              </Suspense>
            </div>
          </GameContext.Provider>
        </>
      )}

      {phase === 'done' && result && (
        <section aria-label={t('games.finish.title')} className="relative flex flex-col gap-6 overflow-hidden rounded-xl border border-line bg-surface p-4 shadow-card md:p-6">
          <div className="relative mx-auto w-full max-w-sm">
            <ScenePicture src={FINISH_PIC} className="aspect-[8/5] w-full rounded-xl" eager />
          </div>
          <FloatingStars />
          <MascotMessage mood="cheer" size="lg" speakText={t(`games.finish.msg.${result.stars}`)}>
            <h2 ref={doneRef} tabIndex={-1} className="text-2xl font-bold text-ink outline-none">
              {t('games.finish.title')}
            </h2>
            <span className="mt-1 block text-lg font-normal text-ink">{t(`games.finish.msg.${result.stars}`)}</span>
          </MascotMessage>
          <div className="flex flex-col items-center gap-2">
            <StarsCountUp stars={result.stars} />
            <p className="text-lg text-ink-soft">{t('games.finish.score', { correct: result.correct, total: result.total })}</p>
          </div>
          {milestone !== undefined && (
            <div className="flex items-center gap-4 rounded-xl border-2 border-brand-100 bg-brand-50 p-3 motion-ok:animate-gx-fade-up">
              <div className="relative flex h-[90px] w-36 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-100">
                <Star aria-hidden className="h-10 w-10 fill-accent-500 text-accent-600" />
                <ScenePicture src={ROCKET_PIC} width={144} height={90} className="absolute inset-0 motion-ok:animate-gx-fly-up" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-bold text-ink">{t('games.milestone.title')}</h3>
                <p className="text-lg text-ink-soft">{t('games.milestone.body', { count: milestone })}</p>
              </div>
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-3">
            <span className="motion-ok:animate-gx-rise" style={{ animationDelay: '300ms' }}>
              <BigActionButton icon={<RotateCcw />} onClick={() => start(true)}>
                {t('games.finish.again')}
              </BigActionButton>
            </span>
            {nextGame && (
              <span className="motion-ok:animate-gx-rise" style={{ animationDelay: '450ms' }}>
                <BigActionButton variant="secondary" to={`/student/games/${nextGame.id}`} icon={<Dices />}>
                  {t('games.finish.another')}
                </BigActionButton>
              </span>
            )}
            <span className="motion-ok:animate-gx-rise" style={{ animationDelay: '600ms' }}>
              <BigActionButton variant="secondary" to="/student/games" icon={<ArrowLeft />}>
                {t('games.finish.back')}
              </BigActionButton>
            </span>
          </div>
        </section>
      )}

      <Modal
        open={pauseOpen}
        onClose={() => setPauseOpen(false)}
        title={t('games.pause.title')}
        footer={
          <>
            <Button variant="ghost" size="xl" onClick={() => { setPauseOpen(false); setQuitOpen(true); }}>
              {t('games.shell.quit')}
            </Button>
            <Button size="xl" onClick={() => setPauseOpen(false)}>
              {t('games.pause.resume')}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <ScenePicture src={BREAK_PIC} className="mx-auto aspect-[8/5] w-full max-w-xs rounded-xl" />
          <MascotMessage mood="sleepy" size="sm">
            {t('games.pause.body')}
          </MascotMessage>
        </div>
      </Modal>
      <Modal
        open={quitOpen}
        onClose={() => setQuitOpen(false)}
        title={t('games.quit.title')}
        footer={
          <>
            <Button variant="ghost" size="xl" onClick={() => {
                setQuitOpen(false);
                navigate('/student/games');
              }}>
              {t('games.quit.leave')}
            </Button>
            <Button size="xl" onClick={() => setQuitOpen(false)}>
              {t('games.pause.resume')}
            </Button>
          </>
        }
      >
        <p className="text-lg text-ink">{t('games.quit.body')}</p>
      </Modal>
    </div>
  );
}
