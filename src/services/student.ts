import type { Concept, ExamReport, LearningPathStep, Mastery, Mission, Question, QuizAttempt, Quest, RevisionItem, TutorMessage } from '@/types';
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
}
