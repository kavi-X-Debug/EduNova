import type { ExamReport, LearningPathStep, Mastery, Quest, ReadinessBand, RevisionItem } from '@/types';
import { bandFromMastery, makeMastery } from '@/lib/mastery';
import { CONCEPTS, G6_ORDERED, MVP_GRADE, SUBJECTS } from './concepts';
import { EXAMS, QUEST_TEMPLATES } from './content';
import { daysAgo, daysFromNow, rngFor } from './rng';

export const INTERVALS = [1, 3, 7, 14, 30];

/** Concepts relevant to a grade. The MVP only has Grade 6. */
export function conceptsForGrade(grade: number = MVP_GRADE) {
  return CONCEPTS.filter((c) => c.grade === grade);
}

/**
 * Where a learner is in each subject's teaching order.
 * `covered`: concepts already finished (all steps done). `started`: steps done in the current concept.
 * The class (cohort) sets the pace, so classmates are at about the same unit; each learner varies a little.
 */
interface SubjectProgress {
  covered: number;
  started: number;
}
export function progressFor(userId: string, cohort: string = userId): Map<string, SubjectProgress> {
  const classRnd = rngFor(`pace-${cohort}`);
  const own = rngFor(`progress-${userId}`);
  const out = new Map<string, SubjectProgress>();
  for (const subject of SUBJECTS) {
    const n = G6_ORDERED.filter((c) => c.subject === subject).length;
    const pace = 0.35 + classRnd() * 0.25; // class is 35-60% through the year
    const jitter = Math.floor(own() * 3) - 1; // -1, 0 or +1 concept
    const covered = Math.max(1, Math.min(n - 1, Math.round(pace * n) + jitter));
    out.set(subject, { covered, started: Math.floor(own() * 3) });
  }
  return out;
}

/** Mastery exists for finished concepts (and the current one once started). */
export function buildMastery(userId: string, cohort?: string): Mastery[] {
  const rnd = rngFor(`mastery-${userId}`);
  const ability = 0.3 + rnd() * 0.55; // per-student baseline
  const progress = progressFor(userId, cohort);
  const out: Mastery[] = [];
  for (const subject of SUBJECTS) {
    const { covered, started } = progress.get(subject)!;
    const list = G6_ORDERED.filter((c) => c.subject === subject);
    list.forEach((c, i) => {
      let level: number;
      if (i < covered) {
        const settled = ((covered - i) / covered) * 0.1; // earlier units have had more practice
        level = ability + settled + (rnd() - 0.5) * 0.4;
      } else if (i === covered && started > 0) {
        level = ability * 0.6 + (rnd() - 0.5) * 0.2; // just started
      } else return;
      const l = Math.min(1, Math.max(0.05, level));
      out.push(makeMastery(c.id, Math.round(l * 100) / 100, daysAgo(Math.floor(rnd() * 20))));
    });
  }
  return out;
}

/**
 * The learner's path: every Grade 6 concept's steps in teaching order (subject, term, textbook order).
 * Finished concepts are done; in the current concept of each subject the first unfinished step is
 * 'next'; everything after it is locked.
 */
export function buildPath(userId: string, cohort?: string): LearningPathStep[] {
  const progress = progressFor(userId, cohort);
  const steps: LearningPathStep[] = [];
  for (const subject of SUBJECTS) {
    const { covered, started } = progress.get(subject)!;
    G6_ORDERED.filter((c) => c.subject === subject).forEach((c, i) => {
      const doneSteps = Math.min(started, c.steps.length - 1);
      c.steps.forEach((s, j) => {
        let status: LearningPathStep['status'] = 'locked';
        if (i < covered) status = 'done';
        else if (i === covered) status = j < doneSteps ? 'done' : j === doneSteps ? 'next' : 'locked';
        steps.push({ id: `step-${c.id}-${j + 1}`, conceptId: c.id, kind: s.kind, status, estimatedMinutes: s.estimatedMinutes });
      });
    });
  }
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
