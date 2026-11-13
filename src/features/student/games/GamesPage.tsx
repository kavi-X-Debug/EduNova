import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { HelpBubble, MascotMessage, PageHeader, Select, cn } from '@/components/ui';
import { focusRing } from '@/components/ui/cn';
import { useGt as useT } from '@/features/student/games/useGt';
import { useAsync } from '@/lib';
import { announce } from '@/lib/a11y';
import { studentService } from '@/services';
import { useSessionStore } from '@/store';
import type { GameDefinition, GameStat, GameSubject } from '@/types';
import { KidEmpty, KidError, KidLoading } from '../learnKit/KidState';
import { SubjectIcon } from '../learnKit/SubjectIcon';
import { ScenePicture } from './engine/GameFx';
import { GameCard } from './GameCard';
import { GAMES, GAME_SUBJECTS } from './registry';
import { subjectKey } from './labels';

const ROW_SIZE = 4;

function Row({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col gap-3">
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{children}</ul>
    </section>
  );
}

function Cards({ games, stats }: { games: GameDefinition[]; stats: Map<string, GameStat> }) {
  return (
    <>
      {games.map((g, i) => (
        <li key={g.id}>
          <GameCard game={g} stat={stats.get(g.id)} index={i} />
        </li>
      ))}
    </>
  );
}

/** Games library: subject icons, topic filter, "learning now", "Play again", "New". Nothing here ranks or compares children. */
export default function GamesPage() {
  const t = useT();
  const user = useSessionStore((s) => s.user);
  const userId = user?.id ?? '';
  const firstName = (user?.name ?? '').trim().split(/\s+/)[0] ?? '';
  const [subject, setSubject] = useState<GameSubject | 'all'>('all');
  const [topic, setTopic] = useState('all');
  const statsQ = useAsync(() => studentService.listGameStats(userId), [userId]);
  const pathQ = useAsync(() => studentService.getLearningPath(userId), [userId]);

  const stats = useMemo(() => new Map((statsQ.data ?? []).map((s) => [s.gameId, s])), [statsQ.data]);
  const nowConcepts = useMemo(() => new Set((pathQ.data ?? []).filter((s) => s.status === 'next' || s.status === 'in_progress').map((s) => s.conceptId)), [pathQ.data]);

  const subjects = GAME_SUBJECTS.filter((s) => s !== 'mixed' || GAMES.some((g) => g.subject === 'mixed'));
  const bySubject = subject === 'all' ? GAMES : GAMES.filter((g) => g.subject === subject);
  const topicIds = useMemo(() => [...new Set(bySubject.flatMap((g) => g.conceptIds))], [bySubject]);
  const activeTopic = topicIds.includes(topic) ? topic : 'all';
  const filtered = activeTopic === 'all' ? bySubject : bySubject.filter((g) => g.conceptIds.includes(activeTopic));
  const filtering = subject !== 'all' || activeTopic !== 'all';

  const loaded = statsQ.data !== undefined;
  useEffect(() => {
    if (loaded) announce(t('a11y.loaded'));
  }, [loaded, t]);

  const learningNow = GAMES.filter((g) => g.conceptIds.some((c) => nowConcepts.has(c))).slice(0, ROW_SIZE);
  const again = [...stats.values()]
    .sort((a, b) => b.lastPlayedAt.localeCompare(a.lastPlayedAt))
    .map((s) => GAMES.find((g) => g.id === s.gameId))
    .filter((g): g is GameDefinition => Boolean(g))
    .slice(0, ROW_SIZE);
  const fresh = GAMES.filter((g) => !stats.has(g.id)).slice(0, ROW_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader className="mb-0" title={t('games.lib.title')} description={t('games.lib.subtitle')} actions={<HelpBubble textKey="games.lib.help" align="end" />} />
      <section aria-label={t('games.lib.title')} className="relative isolate flex min-h-[220px] items-center overflow-hidden rounded-xl border border-line bg-brand-50 p-4 shadow-card md:min-h-[260px] md:p-8">
        <ScenePicture src="/games/games-hero.webp" zoom eager className="absolute inset-0 -z-10 h-full w-full" />
        <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-surface/70 via-surface/20 to-transparent" />
        <MascotMessage mood="wave" size="md" speakText={t('games.lib.nova', { name: firstName })} className="max-w-xl">
          {t('games.lib.nova', { name: firstName })}
        </MascotMessage>
      </section>

      {statsQ.error && <KidError onRetry={statsQ.reload} />}
      {GAMES.length === 0 && <KidEmpty title={t('games.lib.none.title')} body={t('games.lib.none.body')} />}

      {GAMES.length > 0 && (
        <>
          <div role="group" aria-label={t('games.lib.subjects')} className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-7">
            {(['all', ...subjects] as const).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={subject === s}
                onClick={() => {
                  setSubject(s);
                  setTopic('all');
                }}
                className={cn(
                  'group flex min-h-24 flex-col items-center justify-center gap-1 rounded-xl border-2 p-2 text-center text-base font-bold transition duration-fast ease-standard',
                  focusRing,
                  subject === s ? 'border-brand-600 bg-brand-100 text-brand-700' : 'border-line bg-surface text-ink hover:border-brand-500',
                )}
              >
                <SubjectIcon subject={s === 'all' ? 'trail' : s} size="md" />
                <span>{s === 'all' ? t('games.lib.all') : t(subjectKey(s))}</span>
              </button>
            ))}
          </div>

          {topicIds.length > 1 && (
            <Select
              label={t('games.lib.topic')}
              value={activeTopic}
              onChange={(e) => setTopic(e.target.value)}
              options={[{ value: 'all', label: t('games.lib.allTopics') }, ...topicIds.map((id) => ({ value: id, label: t(`concept.${id}`) }))]}
              wrapperClassName="max-w-md"
            />
          )}

          {(statsQ.loading || pathQ.loading) && !statsQ.data && <KidLoading />}

          {!filtering && (
            <>
              {learningNow.length > 0 && (
                <Row title={t('games.lib.learningNow')}>
                  <Cards games={learningNow} stats={stats} />
                </Row>
              )}
              {again.length > 0 && (
                <Row title={t('games.lib.again')}>
                  <Cards games={again} stats={stats} />
                </Row>
              )}
              {fresh.length > 0 && (
                <Row title={t('games.lib.new')}>
                  <Cards games={fresh} stats={stats} />
                </Row>
              )}
            </>
          )}

          {filtered.length === 0 ? (
            <KidEmpty title={t('games.lib.soon.title')} body={t('games.lib.soon.body')} />
          ) : (
            <Row title={filtering ? t('games.lib.found', { count: filtered.length }) : t('games.lib.all')}>
              <Cards games={filtered} stats={stats} />
            </Row>
          )}
        </>
      )}
    </div>
  );
}
