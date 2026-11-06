import type { ExamReport, LearningPathStep, Mastery, Quest, ReadinessBand, RevisionItem } from '@/types';
import { bandFromMastery, makeMastery } from '@/lib/mastery';
import { CONCEPTS } from './concepts';
import { EXAMS, QUEST_TEMPLATES } from './content';
import { daysAgo, daysFromNow, rngFor } from './rng';

export const INTERVALS = [1, 3, 7, 14, 30];

/** Concepts relevant to a grade: this grade and earlier, up to 2 grades back. */
export function conceptsForGrade(grade: number) {
  return CONCEPTS.filter((c) => c.grade <= grade && c.grade >= grade - 3);
}

export function buildMastery(userId: string, grade = 8): Mastery[] {
  const rnd = rngFor(`mastery-${userId}`);
  const ability = 0.25 + rnd() * 0.6; // per-student baseline
  return conceptsForGrade(grade).map((c) => {
    const older = (grade - c.grade) * 0.05; // earlier-grade concepts tend to be firmer
    const level = Math.min(1, Math.max(0.05, ability + older + (rnd() - 0.5) * 0.4));
    return makeMastery(c.id, Math.round(level * 100) / 100, daysAgo(Math.floor(rnd() * 20)));
  });
}

export function buildPath(userId: string, mastery: Mastery[]): LearningPathStep[] {
  const rnd = rngFor(`path-${userId}`);
  // Weakest concepts first, but never before their prerequisites are at least developing.
  const byLevel = new Map(mastery.map((m) => [m.conceptId, m.level]));
  const ordered = [...mastery]
    .filter((m) => m.level < 0.82)
    .sort((a, b) => a.level - b.level)
    .filter((m) => {
      const c = CONCEPTS.find((x) => x.id === m.conceptId)!;
      return c.prerequisiteIds.every((p) => (byLevel.get(p) ?? 1) >= 0.35) || c.prerequisiteIds.length === 0;
    })
    .slice(0, 3);
  const kinds: LearningPathStep['kind'][] = ['lesson', 'practice', 'quiz'];
  const steps: LearningPathStep[] = [];
  ordered.forEach((m) => kinds.forEach((kind) => steps.push({ id: `step-${steps.length + 1}`, conceptId: m.conceptId, kind, status: 'locked', estimatedMinutes: kind === 'lesson' ? 12 : kind === 'practice' ? 15 : 10 })));
  if (ordered.length) steps.push({ id: `step-${steps.length + 1}`, conceptId: ordered[0].conceptId, kind: 'revision', status: 'locked', estimatedMinutes: 8 });
  const done = Math.min(steps.length, Math.floor(rnd() * 3));
  steps.forEach((s, i) => {
    s.status = i < done ? 'done' : i === done ? 'in_progress' : i === done + 1 ? 'next' : 'locked';
  });
  return steps;
}

const NEXT_BY_BAND: Record<ReadinessBand, string[]> = {
  building: ['exam.next.reviewPrereq', 'exam.next.practiceMore', 'exam.next.askTutor'],
  developing: ['exam.next.practiceMore', 'exam.next.askTutor'],
  secure: ['exam.next.keepGoing', 'exam.next.challenge'],
  strong: ['exam.next.challenge', 'exam.next.keepGoing'],
};

/** Reports carry a readiness BAND only. Never a predicted mark. */
export function buildExamReports(userId: string, mastery: Mastery[]): ExamReport[] {
  const rnd = rngFor(`exam-${userId}`);
  return EXAMS.map((e, idx) => {
    // earlier exams slightly lower so progress is visible
    const shift = (idx - EXAMS.length + 1) * 0.06;
    const breakdown = mastery.map((m) =>
      makeMastery(m.conceptId, Math.max(0.05, Math.min(1, m.level + shift + (rnd() - 0.5) * 0.12)), daysAgo(e.daysAgo)),
    );
    const band = bandFromMastery(breakdown);
    return { id: e.id, userId, examId: e.id, date: daysAgo(e.daysAgo), band, conceptBreakdown: breakdown, nextSteps: NEXT_BY_BAND[band] };
  }).sort((a, b) => b.date.localeCompare(a.date));
}

export function buildQuests(userId: string): Quest[] {
  const rnd = rngFor(`quests-${userId}`);
  return QUEST_TEMPLATES.map((t) => {
    const missions = t.missions.map((m) => {
      const progress = Math.floor(rnd() * (m.target + 1) * 0.7);
      return { id: `${userId}:${m.id}`, titleKey: m.titleKey, progress, target: m.target, done: progress >= m.target };
    });
    return { id: t.id, titleKey: t.titleKey, xp: t.xp, missions, status: missions.every((m) => m.done) ? ('complete' as const) : ('open' as const) };
  });
}

export function buildRevisionQueue(userId: string, mastery: Mastery[]): RevisionItem[] {
  const rnd = rngFor(`rev-${userId}`);
  return [...mastery]
    .sort((a, b) => a.level - b.level)
    .slice(0, 7)
    .map((m, i) => {
      // lower mastery => shorter spaced interval
      const intervalDays = INTERVALS[Math.min(INTERVALS.length - 1, Math.floor(m.level * INTERVALS.length))];
      const offset = Math.floor(rnd() * 6) - 2 + (i > 3 ? 2 : 0); // some overdue/today, some upcoming
      return { id: `rev-${userId}-${m.conceptId}`, conceptId: m.conceptId, intervalDays, dueAt: daysFromNow(offset) };
    })
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
}
