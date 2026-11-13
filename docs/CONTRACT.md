# EduNova Sahayaka: Engineering Contract

Source of truth: `docs/DESIGN_BRIEF.md` + Figma `EU3cIhqiO4m9oYgCmOapLW`.
**STATUS: DESIGN_BRIEF.md was absent and Figma MCP was rate-limited in Phase 0. Tokens are placeholders; Agent A reconciles them first (see docs/REQUESTS.md).**

## Stack
Vite, React 19, TS strict, Tailwind 3, React Router, Zustand, i18next, Recharts, lucide-react. Path alias `@/` = `src/`.

## Tokens
Defined only in `tailwind.config.ts` (colours, radius, shadows, font, screens 390/834/1440). **No hex/rgb literals anywhere else** (ESLint enforces hex). Use classes like `bg-brand-500`, `text-ink-soft`, `rounded-lg`, `shadow-card`.

## Types and services
Types: `src/types/index.ts`. Service interfaces: `src/services/*.ts`. Agent B implements mocks in `src/mocks/` and exports instances from `src/services/index.ts`. Features call services only; never import mocks directly.

### Grade 6 curriculum data (MVP)
- Source of truth: `curriculum/grade6/<subject>/path.json` (+ `manifest.json`), subjects `maths`, `science`, `sinhala`, `english`, `ict`. Run `npm run gen:grade6` after changing them; it validates prerequisites/step kinds/terms and writes `src/mocks/grade6.generated.ts` (do not edit by hand).
- `Concept` has three optional reference fields, returned by `studentService.listConcepts()`: `term?: number` (1-3), `unit?: string` (textbook unit label as printed, not translated) and `textbookRef?: string` (e.g. "Part 1, pp. 112-134", not translated). UI shows them only as small secondary text; a real backend may omit them.
- Concept titles are i18n keys `concept.<id>` in en/si/ta. `getLearningPath()` returns every Grade 6 concept's steps in teaching order (subject in SUBJECTS order, then term, then textbook order); step ids are `step-<conceptId>-<n>`. Per subject: finished concepts are `done`, the first unfinished step is `next`, the rest `locked`.
- Admin curriculum docs (`listCurriculum()`) are the official documents obtained for the paths (`cur-<subject>-<n>`).

## Routes and layouts
| Layout | Route | Owner |
|---|---|---|
| AuthLayout | `/login`, `/onboarding` | D |
| StudentLayout (sidebar ≥834, bottom nav <834) | `/student` dashboard, `/student/diagnostic`, `/student/path`, `/student/tutor`, `/student/exams`, `/student/exams/:id`, `/student/quests`, `/student/revision` | D, E, F |
| TeacherLayout | `/teacher`, `/teacher/classes/:id`, `/teacher/students/:id` | G |
| AdminLayout | `/admin`, `/admin/users`, `/admin/curriculum`, `/admin/audit` | H |
Layouts live in `src/layouts/` (Agent A). Route table in `src/app/routes.tsx` (lead only).

## Folder ownership
- A: `src/components/ui`, `src/layouts`, `src/styles`, `tailwind.config.ts`
- B: `src/services`, `src/mocks`, `src/store`, `src/lib`
- C: `src/i18n` (en, si, ta), a11y utilities in `src/lib/a11y` (coordinate via REQUESTS)
- D/E/F: `src/features/student/{onboarding,diagnostic,dashboard}` / `{path,tutor,exams}` / `{quests,revision}`
- G: `src/features/teacher`; H: `src/features/admin`
- Lead: `src/app`, `src/main.tsx`, configs, docs/PROGRESS.md merges

## Naming
Components PascalCase files; hooks `useX`; services `xService`; no default exports except pages. i18n keys `feature.section.key` (e.g. `student.dashboard.greeting`); en, si, ta must all have every key.

## Educational safety rules
Readiness is a band, never a predicted mark. No public leaderboards. Wellbeing signals private and worded as prompts, not diagnoses. AI answers show sources.

## Definition of Done
Type-check, lint, build pass; no hex outside tokens; pages match Figma at 1440/834/390; keyboard and focus work; loading, empty, error states; note appended to docs/PROGRESS.md; only own folders edited, other needs go to docs/REQUESTS.md.

## Profile and rewards additions
Types (src/types): `UserProfile`, `AvatarChoice`, `NotificationPrefs`, `AccessibilityPrefs`, `PasswordChange`, `BadgeDef`, `BadgeProgress`, `BadgeCategory`, `BadgeRarity`, `BadgeMetric`, `RewardEvent`, `RewardSummary`, `RewardOutcome`.
Services (import from `@/services`):
- `profileService`: `getProfile(userId)`, `updateProfile(userId, patch)`, `changePassword(userId, {current, next})` (MOCK: validates only; rejects `Error('missing'|'weak'|'same')`). Grade/subjects/language for students remain `studentService.getProfile/saveProfile`.
- `rewardsService` (students only; never lists or compares other students): `getSummary`, `listBadges`, `listRecentBadges(userId, limit?)`, `getBadgeCount(studentId)` (count only, for teachers), `recordEvent(userId, RewardEvent)` returning `RewardOutcome`.
- `studentService.completePathStep(userId, stepId)` (new). Completion flows (`completePathStep`, `submitQuiz`, `recordReview`, `completeMission`, `askTutor`) record reward events in the background via `withRewards` in `src/services/rewardHooks.ts`; a real backend should award server-side and return/push `RewardOutcome`. `onRewardOutcome(listener)` is how the UI hears about new badges.
Badge catalogue: `BADGES` in `src/lib/rewards.ts`; artwork `public/badges/<id>.png` is optional (see docs/BADGES.md).
Local display prefs (reduce motion, larger text): `useA11yPrefsStore` in `src/store`; `usePrefersReducedMotion()` honours them.
Educational safety for rewards: no leaderboards or rankings, rewards visible only to the student (teacher sees a count), no loss-aversion or streak-shame wording, wellbeing never tied to rewards, mastery remains a band.
