// PURE generator: see docs/GAMES-AUTHORING.md.
import { buildChoices, type RoundContext } from '../engine/generate';
import type { Rng } from '../engine/rng';

export type FolderType = 'pictures' | 'music' | 'documents' | 'videos';
export const TYPES: FolderType[] = ['pictures', 'music', 'documents', 'videos'];
/** File names are plain data (not translated): the ending (.png, .mp3...) tells the type. */
export const FILES: Record<FolderType, string[]> = {
  pictures: ['cat.png', 'beach.jpg', 'family.jpg', 'sunset.png', 'mango-tree.jpg'],
  music: ['lullaby.mp3', 'drums.mp3', 'sing-along.mp3', 'rain-song.mp3', 'flute.mp3'],
  documents: ['story.docx', 'shopping-list.txt', 'homework.docx', 'poem.txt', 'diary.docx'],
  videos: ['school-trip.mp4', 'birthday.mp4', 'cartoon.mp4', 'garden.mp4', 'sports-day.mp4'],
};
/** Two sub-folders for every folder (names in the locale files: games.ict.folderSorter.sub.<id>). */
export const SUBS: Record<FolderType, [string, string]> = {
  pictures: ['holiday', 'pets'],
  music: ['dance', 'calm'],
  documents: ['school', 'home'],
  videos: ['cartoons', 'nature'],
};
export const typeOfFile = (name: string): FolderType => TYPES.find((t) => FILES[t].includes(name)) as FolderType;

export interface PathStep { type: FolderType; sub: string }
export type FolderRound =
  | { mode: 'sort'; folders: FolderType[]; files: string[] }
  | { mode: 'path'; /** three folders, each with two sub-folders, each holding one file */ tree: { type: FolderType; subs: { sub: string; file: string }[] }[]; file: string; answer: PathStep; options: PathStep[] };

export const SORT_SPEC: Record<1 | 2, { folders: number; perFolder: number }> = { 1: { folders: 2, perFolder: 2 }, 2: { folders: 3, perFolder: 2 } };
export const samePath = (a: PathStep, b: PathStep) => a.type === b.type && a.sub === b.sub;

export function makeFolderRound(rng: Rng, { level }: RoundContext): FolderRound {
  if (level === 3) {
    const tree = rng.sample(TYPES, 3).map((type) => {
      const names = rng.sample(FILES[type], 2);
      return { type, subs: SUBS[type].map((sub, i) => ({ sub, file: names[i] })) };
    });
    const all: PathStep[] = tree.flatMap((n) => n.subs.map((s) => ({ type: n.type, sub: s.sub })));
    const answer = rng.pick(all);
    const file = tree.find((n) => n.type === answer.type)!.subs.find((s) => s.sub === answer.sub)!.file;
    const { options } = buildChoices(rng, answer, all, 4, samePath);
    return { mode: 'path', tree, file, answer, options };
  }
  const spec = SORT_SPEC[level];
  const folders = rng.sample(TYPES, spec.folders);
  const files = rng.shuffle(folders.flatMap((t) => rng.sample(FILES[t], spec.perFolder)));
  return { mode: 'sort', folders, files };
}

export const ROUNDS_PER_PLAY = 6;
