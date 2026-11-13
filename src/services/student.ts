import type { Locale, Concept, ExamReport, LearningPathStep, Mastery, Mission, Question, QuizAttempt, Quest, RevisionItem, TutorMessage } from '@/types';
export interface StudentProfile { grade: number; subjects: string[]; locale: Locale }
export interface StudentService {
  listConcepts(subject?: string): Promise<Concept[]>;
  getMastery(userId: string): Promise<Mastery[]>;
  getDiagnosticQuestions(userId: string): Promise<Question[]>;
  submitQuiz(attempt: QuizAttempt): Promise<QuizAttempt>;
  getLearningPath(userId: string): Promise<LearningPathStep[]>;
  askTutor(userId: string, text: string): Promise<TutorMessage>;
  listExamReports(userId: string): Promise<ExamReport[]>;
  listQuests(userId: string): Promise<Quest[]>;
  completeMission(userId: string, missionId: string): Promise<Mission>;
  getRevisionQueue(userId: string): Promise<RevisionItem[]>;
  /** quality 0-5 (>=3 = recalled). Reschedules by spaced interval; returns the updated item. */
  recordReview(userId: string, revisionItemId: string, quality: number): Promise<RevisionItem>;
  /** Marks a learning-path step done and unlocks the next one. Awards XP/badges through the rewards service. */
  completePathStep(userId: string, stepId: string): Promise<LearningPathStep>;
  getProfile(userId: string): Promise<StudentProfile | null>;
  saveProfile(userId: string, profile: StudentProfile): Promise<StudentProfile>;
}
