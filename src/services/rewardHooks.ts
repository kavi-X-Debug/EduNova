import { bandFromLevel } from '@/lib/mastery';
import type { RewardEvent, RewardOutcome } from '@/types';
import type { RewardsService } from './rewards';
import type { StudentService } from './student';

// ---- Outcome notifications (UI subscribes; a real backend would push or return these) ----
type Listener = (outcome: RewardOutcome) => void;
const listeners = new Set<Listener>();
export function onRewardOutcome(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Wraps a RewardsService so every recorded event that earns something is announced to subscribers. */
export function withRewardNotifications(base: RewardsService): RewardsService {
  return {
    ...base,
    recordEvent: async (userId, event) => {
      const outcome = await base.recordEvent(userId, event);
      if (outcome.newBadges.length > 0 || outcome.leveledUp) listeners.forEach((l) => l(outcome));
      return outcome;
    },
  };
}

/**
 * Wraps a StudentService so the completion flows (path step, quiz, revision, mission, tutor) record reward events.
 * Awarding runs in the background and never blocks or fails the learning action itself.
 */
export function withRewards(base: StudentService, rewards: RewardsService): StudentService {
  const track = (userId: string, build: () => Promise<RewardEvent | null>): void => {
    void build()
      .then((event) => (event ? rewards.recordEvent(userId, event) : undefined))
      .catch(() => {
        /* rewards are a bonus: ignore failures */
      });
  };
  return {
    ...base,

    completePathStep: async (userId, stepId) => {
      const step = await base.completePathStep(userId, stepId);
      track(userId, async () => {
        const [steps, concepts] = await Promise.all([base.getLearningPath(userId), base.listConcepts()]);
        const subject = concepts.find((c) => c.id === step.conceptId)?.subject;
        const subjectOf = (conceptId: string) => concepts.find((c) => c.id === conceptId)?.subject;
        const unitComplete = steps.filter((s) => s.conceptId === step.conceptId).every((s) => s.status === 'done');
        const termComplete = Boolean(subject) && steps.filter((s) => subjectOf(s.conceptId) === subject).every((s) => s.status === 'done');
        return { type: 'path_step_done', stepId: step.id, kind: step.kind, unitComplete, termComplete };
      });
      return step;
    },

    submitQuiz: async (attempt) => {
      const result = await base.submitQuiz(attempt);
      track(attempt.userId, async () => {
        const answered = result.answers.length;
        const right = result.answers.filter((a) => a.correct).length;
        return { type: 'quiz_submitted', quizId: result.quizId, band: bandFromLevel(answered ? right / answered : 0) };
      });
      return result;
    },

    recordReview: async (userId, itemId, quality) => {
      const item = await base.recordReview(userId, itemId, quality);
      track(userId, async () => ({ type: 'review_done', recalled: quality >= 3 }));
      return item;
    },

    completeMission: async (userId, missionId) => {
      const mission = await base.completeMission(userId, missionId);
      track(userId, async () => {
        const quests = await base.listQuests(userId);
        const quest = quests.find((q) => q.missions.some((m) => m.id === mission.id));
        return { type: 'mission_done', missionId: mission.id, questId: quest?.id, questComplete: quest?.status === 'complete', questXp: quest?.xp ?? 0 };
      });
      return mission;
    },

    askTutor: async (userId, text) => {
      const reply = await base.askTutor(userId, text);
      track(userId, async () => ({ type: 'tutor_asked' }));
      return reply;
    },
  };
}
