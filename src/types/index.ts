export type Role = 'student' | 'teacher' | 'admin';
export type Locale = 'en' | 'si' | 'ta';
export type ISODate = string;

export interface User {
  id: string; name: string; email: string; role: Role; locale: Locale;
  grade?: number; classIds?: string[]; avatarUrl?: string;
}

export interface Concept {
  id: string; subject: string; grade: number; titleKey: string; prerequisiteIds: string[];
}

/** Mastery is 0-1 per concept. UI shows a band; never a predicted exam mark. */
export type ReadinessBand = 'building' | 'developing' | 'secure' | 'strong';
export interface Mastery {
  conceptId: string; level: number; band: ReadinessBand; updatedAt: ISODate;
}

export interface LearningPathStep {
  id: string; conceptId: string; kind: 'lesson' | 'practice' | 'quiz' | 'revision';
  status: 'locked' | 'next' | 'in_progress' | 'done'; estimatedMinutes: number;
}

export interface Question {
  id: string; conceptId: string; type: 'mcq' | 'short' | 'numeric';
  promptKey: string; options?: string[]; difficulty: 1 | 2 | 3;
}

export interface QuizAttempt {
  id: string; userId: string; quizId: string; startedAt: ISODate; submittedAt?: ISODate;
  answers: { questionId: string; response: string; correct?: boolean }[];
}

export interface ExamReport {
  id: string; userId: string; examId: string; date: ISODate;
  band: ReadinessBand; // never a predicted mark
  conceptBreakdown: Mastery[]; nextSteps: string[];
}

export interface Quest {
  id: string; titleKey: string; missions: Mission[]; xp: number; status: 'open' | 'complete';
}
export interface Mission {
  id: string; titleKey: string; progress: number; target: number; done: boolean;
}

export interface RevisionItem {
  id: string; conceptId: string; dueAt: ISODate; intervalDays: number;
}

export interface ClassSummary {
  id: string; name: string; /** class letter, e.g. "A"; with grade it forms a localised label (see lib/displayNames) */ section?: string; grade: number; studentCount: number;
  bandCounts: Record<ReadinessBand, number>; weakConceptIds: string[];
}

export interface StudentRow {
  id: string; name: string; classId: string; band: ReadinessBand; lastActive: ISODate;
  /** Private prompt for teacher, never a diagnosis. */
  wellbeingPromptKey?: string;
}

export interface CurriculumDoc {
  id: string; /** English fallback; UI shows t(titleKey) when present */ title: string; titleKey?: string; subject: string; grade: number;
  status: 'draft' | 'in_review' | 'published'; updatedAt: ISODate;
}

export interface AuditEvent {
  id: string; actorId: string; action: string; target: string; at: ISODate;
}

/** AI answers must always carry sources. */
export interface TutorMessage {
  id: string; from: 'student' | 'tutor'; text: string; sources: { title: string; ref: string }[];
  /** language the text and source titles are written in (set by the service from the requested locale) */
  locale?: Locale;
}
