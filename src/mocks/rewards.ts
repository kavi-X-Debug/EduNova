import type { RewardsService } from '@/services/rewards';
import type { BadgeMetric, BadgeProgress, RewardEvent, RewardSummary } from '@/types';
import { BADGES, XP, levelFromXp, xpForLevel } from '@/lib/rewards';
import { clone, orEmpty, simulate } from './config';

/**
 * Mock reward engine (in memory + localStorage). Rules that keep it educationally safe:
 *  - state is per student; nothing here compares or ranks students;
 *  - a missed day never removes anything: a streak just starts again ("welcome back"), the best streak is kept,
 *    and one streak freeze quietly covers a single missed day;
 *  - XP and badges are never tied to wellbeing, and mastery stays a band (this file never sees a mark).
 */
const KEY = 'edunova.mock.rewards.';

interface State {
  xp: number;
  streak: number;
  bestStreak: number;
  /** Local calendar day (YYYY-MM-DD) of the last activity. */
  lastDay: string | null;
  freezes: number;
  metrics: Record<Exclude<BadgeMetric, 'best_streak_days'>, number>;
  earned: Record<string, string>;
  recallRun: number;
  seen: string[];
}

const METRIC_KEYS: State['metrics'] = {
  lessons_completed: 0, practice_completed: 0, units_completed: 0, terms_completed: 0, strong_quizzes: 0,
  revision_recall_streak: 0, reviews_completed: 0, tutor_questions: 0, sources_checked: 0, quests_completed: 0, comebacks: 0,
};

const dayKey = (d: Date): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dayNumber = (key: string): number => {
  const [y, m, d] = key.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
};
const daysBetween = (from: string, to: string): number => dayNumber(to) - dayNumber(from);
const today = (): string => dayKey(new Date());
const hash = (s: string): number => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

const states = new Map<string, State>();

function seed(userId: string): State {
  const DAY = 86_400_000;
  // A small, varied head start so the demo has something to show. Metrics always match the seeded badges.
  const order = ['first-lesson', 'practice-pal', 'first-review', 'first-question'];
  const count = 1 + (hash(userId) % order.length);
  const earnedIds = order.slice(0, count);
  const metrics = { ...METRIC_KEYS };
  if (earnedIds.includes('first-lesson')) metrics.lessons_completed = 3;
  if (earnedIds.includes('practice-pal')) metrics.practice_completed = 3;
  if (earnedIds.includes('first-review')) { metrics.reviews_completed = 2; }
  if (earnedIds.includes('first-question')) metrics.tutor_questions = 1;
  return {
    xp: 40 + count * 30,
    streak: 2,
    bestStreak: 2,
    lastDay: dayKey(new Date(Date.now() - DAY)),
    freezes: 1,
    metrics,
    earned: Object.fromEntries(earnedIds.map((id, i) => [id, new Date(Date.now() - (count - i + 1) * DAY).toISOString()])),
    recallRun: 0,
    seen: [],
  };
}

function load(userId: string): State {
  const mem = states.get(userId);
  if (mem) return mem;
  let s: State | null = null;
  try {
    const raw = window.localStorage.getItem(KEY + userId);
    if (raw) {
      const p = JSON.parse(raw) as Partial<State>;
      const base = seed(userId);
      s = { ...base, ...p, metrics: { ...METRIC_KEYS, ...p.metrics }, earned: p.earned ?? {}, seen: p.seen ?? [] };
    }
  } catch {
    s = null;
  }
  const state = s ?? seed(userId);
  states.set(userId, state);
  return state;
}

function save(userId: string, s: State): void {
  try {
    window.localStorage.setItem(KEY + userId, JSON.stringify(s));
  } catch {
    /* storage unavailable: progress lasts for this session only */
  }
}

function metricValue(s: State, m: BadgeMetric): number {
  return m === 'best_streak_days' ? s.bestStreak : s.metrics[m];
}

function progressFor(s: State): BadgeProgress[] {
  return BADGES.map((badge) => {
    const earnedAt = s.earned[badge.id];
    const value = metricValue(s, badge.criteria.metric);
    return { badge, earned: Boolean(earnedAt), earnedAt, progress: Math.min(value, badge.criteria.target), target: badge.criteria.target };
  });
}

/** Effective streak at read time: kept through today, yesterday, or a single freeze-covered day; otherwise "welcome back". */
function effectiveStreak(s: State): { current: number; welcomeBack: boolean } {
  if (!s.lastDay) return { current: 0, welcomeBack: false };
  const gap = daysBetween(s.lastDay, today());
  if (gap <= 1 || (gap === 2 && s.freezes > 0)) return { current: s.streak, welcomeBack: false };
  return { current: 0, welcomeBack: true };
}

function summaryOf(s: State): RewardSummary {
  const level = levelFromXp(s.xp);
  const floor = xpForLevel(level);
  const { current, welcomeBack } = effectiveStreak(s);
  return {
    xp: s.xp,
    level,
    xpIntoLevel: s.xp - floor,
    xpForNextLevel: xpForLevel(level + 1) - floor,
    currentStreak: current,
    bestStreak: s.bestStreak,
    freezes: s.freezes,
    welcomeBack,
    badgesEarned: Object.keys(s.earned).length,
    badgesTotal: BADGES.length,
  };
}

/** Counts today as an active day. Returns true when the student is coming back after a break. */
function touchDay(s: State): boolean {
  const now = today();
  if (s.lastDay === now) return false;
  let comeback = false;
  if (!s.lastDay) s.streak = 1;
  else {
    const gap = daysBetween(s.lastDay, now);
    if (gap === 1) s.streak += 1;
    else if (gap === 2 && s.freezes > 0) {
      s.freezes -= 1; // a freeze quietly covers one missed day
      s.streak += 1;
    } else {
      s.streak = 1; // fresh start, no penalty: best streak and badges are untouched
      s.metrics.comebacks += 1;
      comeback = true;
    }
  }
  s.lastDay = now;
  s.bestStreak = Math.max(s.bestStreak, s.streak);
  if (s.streak > 0 && s.streak % 7 === 0) s.freezes = Math.min(2, s.freezes + 1);
  return comeback;
}

function applyEvent(s: State, e: RewardEvent): number {
  const once = (id: string): boolean => {
    if (s.seen.includes(id)) return false;
    s.seen.push(id);
    return true;
  };
  switch (e.type) {
    case 'path_step_done': {
      if (!once(`step:${e.stepId}`)) return 0;
      const xp: number = e.kind === 'lesson' ? XP.lesson : e.kind === 'practice' ? XP.practice : e.kind === 'quiz' ? XP.quiz : XP.revision;
      if (e.kind === 'lesson') s.metrics.lessons_completed += 1;
      if (e.kind === 'practice') s.metrics.practice_completed += 1;
      if (e.unitComplete) s.metrics.units_completed += 1;
      if (e.termComplete) s.metrics.terms_completed += 1;
      return xp;
    }
    case 'quiz_submitted': {
      if (e.quizId === 'diagnostic') return 10; // a starting point, not a result to reward
      let xp: number = XP.quiz;
      if (e.band === 'strong') { s.metrics.strong_quizzes += 1; xp += XP.strongQuizBonus; }
      return xp;
    }
    case 'review_done':
      s.metrics.reviews_completed += 1;
      s.recallRun = e.recalled ? s.recallRun + 1 : 0;
      s.metrics.revision_recall_streak = Math.max(s.metrics.revision_recall_streak, s.recallRun);
      return XP.review;
    case 'mission_done': {
      if (!once(`mission:${e.missionId}`)) return 0;
      let xp: number = XP.mission;
      if (e.questComplete && e.questId && once(`quest:${e.questId}`)) {
        s.metrics.quests_completed += 1;
        xp += e.questXp;
      }
      return xp;
    }
    case 'tutor_asked':
      s.metrics.tutor_questions += 1;
      return XP.tutor;
    case 'sources_checked':
      if (!once(`source:${e.messageId}`)) return 0;
      s.metrics.sources_checked += 1;
      return XP.source;
  }
}

export const mockRewardsService: RewardsService = {
  getSummary: (userId) => simulate(() => summaryOf(load(userId))),

  listBadges: (userId) => simulate(() => clone(orEmpty(progressFor(load(userId))))),

  listRecentBadges: (userId, limit = 3) =>
    simulate(() =>
      clone(
        orEmpty(
          progressFor(load(userId))
            .filter((b) => b.earned)
            .sort((a, b) => (b.earnedAt ?? '').localeCompare(a.earnedAt ?? ''))
            .slice(0, limit),
        ),
      ),
    ),

  getBadgeCount: (studentId) =>
    simulate(() => ({ earned: Object.keys(load(studentId).earned).length, total: BADGES.length })),

  recordEvent: (userId, event) =>
    simulate(() => {
      const s = load(userId);
      const levelBefore = levelFromXp(s.xp);
      touchDay(s);
      const gained = applyEvent(s, event);
      s.xp += gained;
      const now = new Date().toISOString();
      const newly: string[] = [];
      for (const b of BADGES) {
        if (!s.earned[b.id] && metricValue(s, b.criteria.metric) >= b.criteria.target) {
          s.earned[b.id] = now;
          newly.push(b.id);
        }
      }
      save(userId, s);
      const level = levelFromXp(s.xp);
      return clone({
        xpGained: gained,
        leveledUp: level > levelBefore,
        level,
        newBadges: progressFor(s).filter((p) => newly.includes(p.badge.id)),
        summary: summaryOf(s),
      });
    }),
};
