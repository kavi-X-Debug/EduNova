import type { ComponentType } from 'react';

export type Role = 'student' | 'teacher' | 'admin';
export type Locale = 'en' | 'si' | 'ta';
export type ISODate = string;

export interface User {
  id: string; name: string; email: string; role: Role; locale: Locale;
  grade?: number; classIds?: string[]; avatarUrl?: string;
}

export interface Concept {
  id: string; subject: string; grade: number; titleKey: string; prerequisiteIds: string[];
  /** School term the concept is taught in (1-3). Optional: reference data only. */
  term?: number;
  /** Textbook unit/chapter label, as printed in the source (not translated). */
  unit?: string;
  /** Textbook page reference, e.g. "Part 1, pp. 112-134" (not translated). */
  textbookRef?: string;
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

// ---------------- Profile (all roles) ----------------
export interface AvatarChoice {
  kind: 'initials' | 'preset';
  /** Preset id (e.g. 'rocket') when kind is 'preset'. Never an uploaded file. */
  presetId?: string;
  /** Colour token key (e.g. 'brand', 'success'). Resolved to token classes in the UI. */
  colour: string;
}
export interface NotificationPrefs {
  reminders: boolean; weeklySummary: boolean; teacherMessages: boolean; productNews: boolean;
}
/** Display preferences, stored on this device only (not sent to any service). */
export interface AccessibilityPrefs { reduceMotion: boolean; largeText: boolean }
export interface UserProfile {
  userId: string; displayName: string; avatar: AvatarChoice; notifications: NotificationPrefs;
}
export interface PasswordChange { current: string; next: string }

// ---------------- Rewards (students only; private, never ranked) ----------------
export type BadgeCategory = 'learning' | 'mastery' | 'habits' | 'curiosity' | 'quests';
export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic';
/** Counters the reward engine keeps per student; badge criteria compare one counter to a target. */
export type BadgeMetric =
  | 'lessons_completed' | 'practice_completed' | 'units_completed' | 'terms_completed'
  | 'strong_quizzes' | 'best_streak_days' | 'revision_recall_streak' | 'reviews_completed'
  | 'tutor_questions' | 'sources_checked' | 'quests_completed' | 'comebacks'
  | 'games_played' | 'game_subjects';
export interface BadgeDef {
  id: string; titleKey: string; descriptionKey: string;
  criteria: { metric: BadgeMetric; target: number };
  category: BadgeCategory; rarity: BadgeRarity;
}
export interface BadgeProgress {
  badge: BadgeDef; earned: boolean; earnedAt?: ISODate; progress: number; target: number;
}
export type RewardEvent =
  | { type: 'path_step_done'; stepId: string; kind: LearningPathStep['kind']; unitComplete: boolean; termComplete: boolean }
  | { type: 'quiz_submitted'; quizId: string; band: ReadinessBand }
  | { type: 'review_done'; recalled: boolean }
  | { type: 'mission_done'; missionId: string; questId?: string; questComplete: boolean; questXp: number }
  | { type: 'tutor_asked' }
  | { type: 'sources_checked'; messageId: string }
  | { type: 'game_played'; gameId: string; subject: string; stars: number };
export interface RewardSummary {
  xp: number; level: number; xpIntoLevel: number; xpForNextLevel: number;
  /** Consecutive days with activity up to today/yesterday; 0 after a break (UI then shows "welcome back"). */
  currentStreak: number; bestStreak: number; freezes: number; welcomeBack: boolean;
  badgesEarned: number; badgesTotal: number;
}
export interface RewardOutcome {
  xpGained: number; leveledUp: boolean; level: number; newBadges: BadgeProgress[]; summary: RewardSummary;
}

/** AI answers must always carry sources. */
export interface TutorMessage {
  id: string; from: 'student' | 'tutor'; text: string; sources: { title: string; ref: string }[];
  /** language the text and source titles are written in (set by the service from the requested locale) */
  locale?: Locale;
}

// ---------------- Games (Grade 6, see docs/GAMES-BRIEF.md and docs/GAMES-AUTHORING.md) ----------------
/** The five Grade 6 subjects plus 'mixed' (challenges that cover several subjects). */
export type GameSubject = 'maths' | 'science' | 'sinhala' | 'english' | 'ict' | 'mixed';
/** Mechanic, shown as a tiny label and used for variety checks. */
export type GameKind = 'tap' | 'numpad' | 'drag' | 'sort' | 'sequence' | 'match' | 'adventure' | 'mixed';
/** 1 = easy, 2 = medium, 3 = challenge. Every game supports all three. */
export type GameLevel = 1 | 2 | 3;
/** Token colour family for the SVG thumbnail (see GameThumb). */
export type GameTone = 'brand' | 'leaf' | 'sun' | 'bloom' | 'sky';

/** What the player page hands to a game component. The game runs rounds with `useGameSession`. */
export interface GameComponentProps { level: GameLevel; seed: string }

export interface GameDefinition {
  /** kebab-case, unique across all subjects, also the URL segment: /student/games/<id>. */
  id: string;
  subject: GameSubject;
  grade: number;
  /** Real Grade 6 concept ids (curriculum/grade6/<subject>/path.json). Used for filters and the mastery nudge. */
  conceptIds: string[];
  /** i18n keys: `games.<subject>.<camelId>.title` / `.howTo` (one line on the card is `.howTo` too). */
  titleKey: string;
  howToKey: string;
  /** Levels offered (always [1, 2, 3] for starter games). */
  levels: GameLevel[];
  estimatedMinutes: number;
  kind: GameKind;
  /** Token-coloured SVG fallback is always drawn; `image` (e.g. /games/<id>.png) is optional and only used if it loads. */
  thumbnail: { tone: GameTone; image?: string };
  /** Code-split loader: `() => import('./NumberLineJump')` (default export = the game component). */
  load: () => Promise<{ default: ComponentType<GameComponentProps> }>;
}

/** What a finished game reports to `studentService.recordGamePlay`. Never a mark: stars are 1-3. */
export interface GamePlayInput {
  stars: number; correct: number; total: number; durationSec: number; conceptIds: string[];
  subject: GameSubject; level: GameLevel;
}
/** Private per-student summary for one game (never shown to or compared with other students). */
export interface GameStat {
  gameId: string; subject: GameSubject; plays: number; bestStars: number; lastStars: number; lastPlayedAt: ISODate;
}
