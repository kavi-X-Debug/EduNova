import { useState } from 'react';
import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { BigChoiceButton, ChoiceGroup, RoundFeedback, useGameSession, type GameSession } from '../engine';
import { FileIcon, FolderIcon } from './ictArt';
import { makeFolderRound, ROUNDS_PER_PLAY, samePath, typeOfFile, type FolderRound, type PathStep } from './folderSorter.generator';
import { SortBoard } from './SortBoard';

const P = 'games.ict.folderSorter';
const SEP = ' › ';

function PathView({ session, round }: { session: GameSession<FolderRound>; round: Extract<FolderRound, { mode: 'path' }> }) {
  const t = useT();
  const [picked, setPicked] = useState<PathStep | null>(null);
  const asking = session.status === 'asking';
  const pathText = (p: PathStep) => [t(`${P}.folder.${p.type}`), t(`${P}.sub.${p.sub}`)].join(SEP);
  const question = t(`${P}.qPath`, { file: round.file });
  return (
    <div className="flex flex-col gap-4">
      <ul aria-label={t(`${P}.tree`)} className="flex flex-col gap-2 rounded-xl border-2 border-brand-100 bg-brand-50 p-4 text-lg text-ink">
        {round.tree.map((n) => (
          <li key={n.type}>
            <p className="flex items-center gap-2 font-bold"><FolderIcon />{t(`${P}.folder.${n.type}`)}</p>
            <ul className="ml-4 border-l-2 border-brand-100 pl-4">
              {n.subs.map((s) => (
                <li key={s.sub} className="mt-1">
                  <p className="flex items-center gap-2 font-bold"><FolderIcon className="h-6 w-6" />{t(`${P}.sub.${s.sub}`)}</p>
                  <p className="ml-8 flex items-center gap-2" lang="en"><FileIcon type={typeOfFile(s.file)} />{s.file}</p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <p className="text-xl font-bold text-ink">{question}</p>
      <ChoiceGroup label={question} columns={1}>
        {round.options.map((o) => (
          <BigChoiceButton
            key={`${o.type}/${o.sub}`}
            disabled={!asking}
            state={asking ? 'idle' : samePath(o, round.answer) ? 'right' : picked && samePath(o, picked) ? 'wrong' : 'dim'}
            onClick={() => {
              setPicked(o);
              session.answer(samePath(o, round.answer), t(`${P}.explainPath`, { file: round.file, path: pathText(round.answer) }));
            }}
          >
            {pathText(o)}
          </BigChoiceButton>
        ))}
      </ChoiceGroup>
    </div>
  );
}

function RoundView({ session }: { session: GameSession<FolderRound> }) {
  const t = useT();
  const round = session.round;
  return (
    <div className="flex flex-col gap-5">
      {round.mode === 'path' ? (
        <PathView session={session} round={round} />
      ) : (
        <SortBoard
          session={session}
          label={t(`${P}.qSort`)}
          items={round.files.map((f) => ({ id: f, text: f, lang: 'en', label: <span className="flex items-center gap-2"><FileIcon type={typeOfFile(f)} />{f}</span> }))}
          zones={round.folders.map((f) => ({ id: f, label: t(`${P}.folder.${f}`) }))}
          answers={Object.fromEntries(round.files.map((f) => [f, typeOfFile(f)]))}
          checkLabel={t(`${P}.check`)}
          explain={(f, folder) => t(`${P}.explainSort`, { file: f, folder: t(`${P}.folder.${folder}`) })}
        />
      )}
      <RoundFeedback session={session} />
    </div>
  );
}

/** Folder Sorter: put files in the right folder (levels 1-2), then follow a folder path (level 3). See docs/GAMES-AUTHORING.md. */
export default function FolderSorter(props: GameComponentProps) {
  void props;
  const session = useGameSession<FolderRound>({ rounds: ROUNDS_PER_PLAY, makeRound: makeFolderRound });
  return <RoundView key={session.index} session={session} />;
}
