import { lazy, useMemo, type ComponentType } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { BigActionButton } from '@/components/ui';
import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps, GameDefinition } from '@/types';
import { KidEmpty } from '../learnKit/KidState';
import { GameShell } from './engine/GameShell';
import { GAMES, gameById } from './registry';

/** One lazy component per game for the whole session (a stable identity, so a re-render never reloads the game). */
const lazyCache = new Map<string, ComponentType<GameComponentProps>>();
function lazyGame(game: GameDefinition): ComponentType<GameComponentProps> {
  let c = lazyCache.get(game.id);
  if (!c) {
    c = lazy(game.load);
    lazyCache.set(game.id, c);
  }
  return c;
}

/** Another game for "Try another game": same subject first, otherwise any other game; never the current one. */
function suggestNext(game: GameDefinition): GameDefinition | undefined {
  const others = GAMES.filter((g) => g.id !== game.id);
  const same = others.filter((g) => g.subject === game.subject);
  const pool = same.length > 0 ? same : others;
  if (pool.length === 0) return undefined;
  const at = GAMES.findIndex((g) => g.id === game.id);
  return pool.find((g) => GAMES.indexOf(g) > at) ?? pool[0];
}

/** /student/games/:gameId */
export default function GamePage() {
  const t = useT();
  const { gameId } = useParams();
  const game = gameById(gameId);
  const Game = useMemo(() => (game ? lazyGame(game) : undefined), [game]);
  if (!game || !Game) {
    return (
      <KidEmpty
        mood="oops"
        title={t('games.page.missing.title')}
        body={t('games.page.missing.body')}
        action={
          <BigActionButton to="/student/games" icon={<ArrowLeft />}>
            {t('games.finish.back')}
          </BigActionButton>
        }
      />
    );
  }
  return <GameShell key={game.id} game={game} Game={Game} nextGame={suggestNext(game)} />;
}
