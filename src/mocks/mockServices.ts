import type { AdminService } from '@/services/admin';
import type { AuthService } from '@/services/auth';
import type { StudentProfile, StudentService } from '@/services/student';
import type { TeacherService } from '@/services/teacher';
import type { ExamReport, LearningPathStep, Mastery, Quest, RevisionItem, User } from '@/types';
import { makeMastery } from '@/lib/mastery';
import { INTERVALS } from './learning';
import { DAY } from './rng';
import { clone, orEmpty, simulate } from './config';
import { CONCEPTS } from './concepts';
import { CURRICULUM, QUESTIONS, TUTOR_FALLBACK, TUTOR_TOPICS, isCorrect } from './content';
import { buildExamReports, buildMastery, buildPath, buildQuests, buildRevisionQueue, conceptsForGrade } from './learning';
import { ALL_USERS, CLASS_DEFS, TEACHERS, buildAuditEvents, buildClassSummary, buildStudentRows, demoUserFor, findUser } from './people';

const AUTH_KEY = 'edunova.mock.user';

// ---------- in-memory state (resets on reload; swap for a real backend later) ----------
const masteryStore = new Map<string, Mastery[]>();
const pathStore = new Map<string, LearningPathStep[]>();
const questStore = new Map<string, Quest[]>();
const examStore = new Map<string, ExamReport[]>();
const revisionStore = new Map<string, RevisionItem[]>();
const PROFILE_KEY = 'edunova.mock.profile.';
const profileStore = new Map<string, StudentProfile>();
const curriculum = clone(CURRICULUM);
const audit = buildAuditEvents();

function gradeOf(userId: string): number {
  return findUser(userId)?.grade ?? 8;
}
function masteryOf(userId: string): Mastery[] {
  let m = masteryStore.get(userId);
  if (!m) masteryStore.set(userId, (m = buildMastery(userId, gradeOf(userId))));
  return m;
}
function memo<T>(store: Map<string, T>, userId: string, make: () => T): T {
  let v = store.get(userId);
  if (v === undefined) store.set(userId, (v = make()));
  return v;
}

function readStoredUser(): User | null {
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}
function writeStoredUser(u: User | null): void {
  try {
    if (u) window.localStorage.setItem(AUTH_KEY, JSON.stringify(u));
    else window.localStorage.removeItem(AUTH_KEY);
  } catch {
    /* storage unavailable */
  }
}

export const mockAuthService: AuthService = {
  signIn: (email, role) =>
    simulate(() => {
      const user = demoUserFor(email, role);
      writeStoredUser(user);
      return clone(user);
    }),
  signOut: () => simulate(() => writeStoredUser(null)),
  currentUser: () => simulate(() => readStoredUser()),
};

export const mockStudentService: StudentService = {
  listConcepts: (subject) =>
    simulate(() => clone(CONCEPTS.filter((c) => !subject || c.subject === subject))),

  getMastery: (userId) => simulate(() => clone(orEmpty(masteryOf(userId)))),

  getDiagnosticQuestions: (userId) =>
    simulate(() => {
      const ids = new Set(conceptsForGrade(gradeOf(userId)).map((c) => c.id));
      return clone(QUESTIONS.filter((q) => ids.has(q.conceptId)).sort((a, b) => a.difficulty - b.difficulty).slice(0, 10));
    }),

  submitQuiz: (attempt) =>
    simulate(() => {
      const answers = attempt.answers.map((a) => ({ ...a, correct: isCorrect(a.questionId, a.response) }));
      // Nudge mastery for each answered concept (EMA), so dashboards reflect the attempt.
      const mastery = masteryOf(attempt.userId);
      const now = new Date().toISOString();
      for (const a of answers) {
        const q = QUESTIONS.find((x) => x.id === a.questionId);
        if (!q) continue;
        const i = mastery.findIndex((m) => m.conceptId === q.conceptId);
        const prev = i >= 0 ? mastery[i].level : 0.3;
        const next = makeMastery(q.conceptId, prev * 0.7 + (a.correct ? 1 : 0) * 0.3, now);
        if (i >= 0) mastery[i] = next;
        else mastery.push(next);
      }
      return clone({ ...attempt, answers, submittedAt: attempt.submittedAt ?? now });
    }),

  getLearningPath: (userId) =>
    simulate(() => clone(orEmpty(memo(pathStore, userId, () => buildPath(userId, masteryOf(userId)))))),

  askTutor: (_userId, text) =>
    simulate(() => {
      const topic = TUTOR_TOPICS.find((t) => t.match.test(text)) ?? TUTOR_FALLBACK;
      // Contract: AI answers ALWAYS carry sources.
      const sources = topic.sources.length ? topic.sources : TUTOR_FALLBACK.sources;
      return { id: `tm-${Date.now()}`, from: 'tutor' as const, text: topic.text, sources: clone(sources) };
    }),

  listExamReports: (userId) =>
    simulate(() => clone(orEmpty(memo(examStore, userId, () => buildExamReports(userId, masteryOf(userId)))))),

  listQuests: (userId) => simulate(() => clone(orEmpty(memo(questStore, userId, () => buildQuests(userId))))),

  completeMission: (userId, missionId) =>
    simulate(() => {
      const quests = memo(questStore, userId, () => buildQuests(userId));
      for (const q of quests) {
        const m = q.missions.find((x) => x.id === missionId || x.id.endsWith(`:${missionId}`));
        if (m) {
          m.progress = m.target;
          m.done = true;
          if (q.missions.every((x) => x.done)) q.status = 'complete';
          return clone(m);
        }
      }
      throw new Error(`Mission not found: ${missionId}`);
    }),

  getRevisionQueue: (userId) =>
    simulate(() => clone(orEmpty(memo(revisionStore, userId, () => buildRevisionQueue(userId, masteryOf(userId)))))),

  recordReview: (userId, revisionItemId, quality) =>
    simulate(() => {
      const queue = memo(revisionStore, userId, () => buildRevisionQueue(userId, masteryOf(userId)));
      const item = queue.find((r) => r.id === revisionItemId);
      if (!item) throw new Error(`Revision item not found: ${revisionItemId}`);
      const pos = INTERVALS.indexOf(item.intervalDays);
      const idx = quality >= 3 ? Math.min(INTERVALS.length - 1, Math.max(0, pos) + 1) : 0; // recalled: next interval; forgot: restart
      item.intervalDays = INTERVALS[idx];
      item.dueAt = new Date(Date.now() + item.intervalDays * DAY).toISOString();
      queue.sort((a, b) => a.dueAt.localeCompare(b.dueAt));
      return clone(item);
    }),

  getProfile: (userId) =>
    simulate(() => {
      const mem = profileStore.get(userId);
      if (mem) return clone(mem);
      try {
        const raw = window.localStorage.getItem(PROFILE_KEY + userId);
        return raw ? (JSON.parse(raw) as StudentProfile) : null;
      } catch {
        return null;
      }
    }),

  saveProfile: (userId, profile) =>
    simulate(() => {
      profileStore.set(userId, clone(profile));
      try {
        window.localStorage.setItem(PROFILE_KEY + userId, JSON.stringify(profile));
      } catch {
        /* storage unavailable */
      }
      return clone(profile);
    }),
};

export const mockTeacherService: TeacherService = {
  listClasses: (teacherId) =>
    simulate(() => {
      const teacher = TEACHERS.find((t) => t.id === teacherId);
      const ids = teacher?.classIds ?? CLASS_DEFS.map((c) => c.id); // unknown teacher: demo access to all
      return clone(orEmpty(CLASS_DEFS.filter((c) => ids.includes(c.id)).map((c) => buildClassSummary(c, masteryOf))));
    }),
  getStudent: (studentId) =>
    simulate(() => {
      const u = findUser(studentId);
      const row = u?.classIds && buildStudentRows(u.classIds[0], masteryOf).find((r) => r.id === studentId);
      if (!row) throw new Error(`Student not found: ${studentId}`);
      return clone(row);
    }),
  getClass: (classId) =>
    simulate(() => {
      const def = CLASS_DEFS.find((c) => c.id === classId);
      if (!def) throw new Error(`Class not found: ${classId}`);
      return clone(buildClassSummary(def, masteryOf));
    }),
  listStudents: (classId) => simulate(() => clone(orEmpty(buildStudentRows(classId, masteryOf)))),
};

export const mockAdminService: AdminService = {
  listUsers: () => simulate(() => clone(orEmpty(ALL_USERS))),
  listCurriculum: () => simulate(() => clone(orEmpty(curriculum))),
  updateCurriculumStatus: (id, status) =>
    simulate(() => {
      const doc = curriculum.find((d) => d.id === id);
      if (!doc) throw new Error(`Curriculum doc not found: ${id}`);
      doc.status = status;
      doc.updatedAt = new Date().toISOString();
      audit.unshift({ id: `aud-${Date.now()}`, actorId: 'adm-001', action: `curriculum.${status}`, target: id, at: doc.updatedAt });
      return clone(doc);
    }),
  listAuditEvents: () => simulate(() => clone(orEmpty(audit))),
};
