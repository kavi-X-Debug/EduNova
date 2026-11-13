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
Badge catalogue: `BADGES` in `src/lib/rewards.ts`; built-in vector badges (`BadgeArt`) are the default; an optional `public/badges/<id>.png` overrides them (see docs/BADGES.md).
Local display prefs (reduce motion, larger text): `useA11yPrefsStore` in `src/store`; `usePrefersReducedMotion()` honours them.
Educational safety for rewards: no leaderboards or rankings, rewards visible only to the student (teacher sees a count), no loss-aversion or streak-shame wording, wellbeing never tied to rewards, mastery remains a band.

## Language and user-visible text from services (en / si / ta)
Rule: **a service never returns pre-rendered English for display.** Anything the user reads must reach the UI as one of:
1. an i18n key (plus params), rendered with `t()` in the feature (`titleKey`, `promptKey`, `wellbeingPromptKey`, `nextSteps`, audit `action` codes, concept `titleKey`); or
2. text already written in the requested language, because the service was given `locale` (free text such as AI answers).

Rules of thumb:
- Names with structure are returned as parts, e.g. `ClassSummary { grade, section }` -> `classLabel(c, t)`; `CurriculumDoc.titleKey` -> `docTitle(d, t)` (`src/lib/displayNames.ts`). The plain `name`/`title` field is an English fallback for backends that only have one string.
- Person names are data and are shown as stored.
- Dates/numbers go through `src/lib/date.ts` (`Intl`, `si-LK`/`ta-LK`), never `toLocaleString()` without a locale.
- New keys go in en, si and ta in the same change; `npm run i18n:check` fails on untranslated (identical-to-English) si/ta values and leftover English words unless listed in `scripts/i18n-allowlist.json`.
- Terminology follows `docs/I18N-GLOSSARY.md`; strings awaiting native-speaker review are tracked in `docs/I18N-REVIEW.md`.

### AI tutor and language
`studentService.askTutor(userId, text, locale)` receives the UI language. The returned `TutorMessage.text` **and every `sources[].title`** must be written in `locale` (`TutorMessage.locale` echoes it; the UI sets `lang` on the bubble). `sources` must never be empty. The mock keeps per-locale answers in `src/mocks/tutorContent.ts`.
For a real LLM: send `locale` to the server; the server's system prompt must say, for example, "Answer in Sinhala (si) / Tamil (ta) / English (en) as requested, using the Sri Lankan school curriculum terms; keep formulas and numerals as-is; cite the retrieved sources; if no source supports the answer say so and do not invent one." Source titles come from the retrieval index: store a title per locale (fall back to English only if none exists, and then still return it). Questions may be typed in any language regardless of `locale`; reply in `locale`.
Messages already on screen keep the language they were written in when the user switches language (each bubble carries its own `lang`).


## Kids UX components (student side, Grade 6)
Brief: `docs/KIDS-UX-BRIEF.md`. All live in `src/components/ui` (import from `@/components/ui`), use tokens only, honour reduced motion (`motion-ok:`), and every visible string is an i18n key (`kids.*`, `nav.kids.*`). **Keep these APIs stable**: phase 2 pages build on them.

### Mascot "Nova" and SpeechBubble
```tsx
<Mascot mood="happy|thinking|cheer|oops|sleepy" size="sm|md|lg" label?={t('kids.mascot.label')} animate?={true} />
<SpeechBubble speakText?="plain text to read aloud" speakLocale?="si" tail?="auto|start|top|none">Hi Kavi!</SpeechBubble>
<MascotMessage mood size speakText>Hi {{name}}! Ready for a 5 minute lesson?</MascotMessage>   // Nova + bubble, stacks on phones
```
- Mascot is decorative (`aria-hidden`) unless you pass `label`; the message must always be in the text next to it. Sizes 48 / 80 / 128px. Idle animation is a finite soft float (wiggle for `cheer`, none for `oops`), only with `motion-ok:`.
- Moods: `happy` (default, greetings), `thinking` (waiting, "let me check"), `cheer` (finished something, done state), `oops` (errors: "Oops, let's try again"), `sleepy` (nothing to do right now / empty).
- SpeechBubble text is 18px bold; with `speakText` it shows a SpeakButton (hidden when the device has no voice).

### SpeakButton (read aloud)
```tsx
<SpeakButton text={string} locale?={Locale} label?={string} size?="sm|md" whenUnavailable?="hide|disable" />
const { supported, available, speaking, speak, stop } = useSpeech(locale?)   // src/lib/speech.ts
```
- Uses `window.speechSynthesis`, language tag from the UI language (`en-US`, `si-LK`, `ta-LK`); a voice for the same primary language (e.g. `ta-IN`) also counts. Voices are re-read on `voiceschanged`.
- **Honesty rule: we never claim Sinhala or Tamil read-aloud.** Most devices have no si/ta voice; then `available` is false and the button is hidden (default) or disabled with the text "This device has no voice for this language" (`whenUnavailable="disable"`). English is allowed while the voice list is still loading. Do not add copy that promises read-aloud in si/ta; do not rely on it for instructions (everything must also be readable).
- One voice at a time across the app; pressing again stops; it stops on route change and on unmount. Accessible name is `kids.speak.label` / `kids.speak.stop`. Pass plain text (no markup) and `locale` if the text is not in the UI language.

### HelpBubble ("What is this?")
```tsx
<HelpBubble textKey="kids.home.help" titleKey?="kids.help.title" icon?={Lightbulb} align?="start|end" />
```
Small 44px "?" button (`aria-haspopup="dialog"`, `aria-expanded`) opening a non-modal popover: icon, heading, 1-2 short sentences (add your own `kids.<page>.help` key in en/si/ta), close button and a SpeakButton. Escape or the close button closes and returns focus to the "?"; clicking elsewhere closes; focus moves to the close button on open; the panel is nudged to stay inside a 390px screen. Static text, no aria-live. Put it in `PageHeader actions` with `align="end"`.

### BigActionButton and Button size="xl"
```tsx
<BigActionButton to="/student/path" icon={<Play />} fullWidth?>Start</BigActionButton>   // link
<BigActionButton onClick={...} variant?="primary|secondary">Next</BigActionButton>        // button
<Button size="xl" /> <ButtonLink size="xl" />                                              // same 56px look, existing variants
```
56px minimum height, 18px bold text, rounded-xl, icon (24px) plus a few words. Use ONE per screen as the primary action.

### BigLinkCard (hub cards)
```tsx
<BigLinkCard to="/student/path" icon={Route} title="My learning trail" description="Your lessons, one step at a time." aside?={node} />
```
Whole card is a link (88px+ tall): 56px icon tile, 20px title, one sentence, chevron. Used by the Learn and Play hubs.

### GrowMeter (readiness as a picture)
```tsx
<GrowMeter band="building|developing|secure|strong" size?="sm|md|lg" showHint? hideWord? label?={string} />
```
Seedling, sprout, plant, tree for the four `ReadinessBand` values, with the word (`kids.grow.<band>`: Seedling, Sprout, Plant, Tree) and an optional kind sentence (`kids.grow.hint.<band>`). **No numeric props: never a mark, rank or percent.** `role="img"` with the name "How strong am I? {band word}". The old `ReadinessBand` is untouched; pages should migrate to GrowMeter (heading text: `kids.grow.title`).

### Navigation, hubs, tour (foundation)
- `StudentLayout` passes `variant="kids"` to `AppShell` (56px sidebar rows, 28px icons, 64px bottom bar with 14px labels). `NavItem.alsoActiveFor?: string[]` highlights a parent item for sub-pages (Learn also covers `/student/path|diagnostic|revision|exams`, Play covers `/student/quests|badges`, Me covers `/student/profile`). Items use `<Link aria-current="page">`.
- New student routes: `/student/learn`, `/student/play`, `/student/me` (`src/features/student/hubs`). All older routes keep working.
- Welcome tour: `TourHost` (mounted beside `StudentLayout`) opens once on first visit to Home; "done" is stored per student in localStorage (`edunova.tour`, a real backend should keep a `tourDone` flag on the profile). Replay: `useTourStore.getState().openTour()` (Me > "Show me around"). Uses `Modal` (focus trap, Escape = skip) and `announce()` for each step.
- Home "Today's plan": `src/features/student/dashboard/todaysPlan.ts` freezes up to 3 steps per calendar day (localStorage `edunova.plan.<userId>`) so finished steps keep their checkmark; data still comes from `studentService.getLearningPath/getRevisionQueue` and `rewardsService.listRecentBadges`.

## Games (Grade 6): types, services, engine
Spec `docs/GAMES-BRIEF.md`; how to add one `docs/GAMES-AUTHORING.md`.
- Types (`src/types`): `GameDefinition`, `GameComponentProps`, `GameSubject`, `GameKind`, `GameLevel` (1|2|3), `GameTone`, `GamePlayInput`, `GameStat`; `RewardEvent` gains `game_played`; `BadgeMetric` gains `games_played`, `game_subjects`.
- Services: `studentService.recordGamePlay(userId, gameId, { stars, correct, total, durationSec, conceptIds, subject, level })` returns the private per-game `GameStat` (plays, bestStars, lastStars, lastPlayedAt); `studentService.listGameStats(userId)`. `recordGamePlay` may nudge the mastery BAND of `conceptIds` (mock: -0.02..+0.04 per play, capped at -0.05..+0.15 in total per concept, never creates mastery, never a mark) and, through `withRewards`, records a `game_played` reward event (+10 XP). No method lists or compares other students. A real backend must clamp the nudge server-side and award badges server-side.
- Badges (`BADGES` in `src/lib/rewards.ts`): `first-game` (1 game), `game-five` (5 games), `new-subject` (games in 2 subjects), `every-subject` (all 5; `mixed` does not count). i18n `rewards.badge.<id>.*` and `kidsplay.badge.<id>.how|why`; art falls back to the vector `BadgeArt` until `public/badges/<id>.png` exists.
- Prefs: `useGamePrefsStore` (`src/store`): `sound` (default false, localStorage `edunova.games`); toggle in Me.
- Registry: `src/features/student/games/registry.ts` aggregates `games/<subject>/index.ts`. Routes `/student/games`, `/student/games/:gameId`. Engine: `src/features/student/games/engine` (see GAMES-AUTHORING.md).
- Tests: Vitest (`npm test`), generators and scoring are pure and unit-tested.
- DragDropZone, browser-tested by the ICT games (agent/games-ict): drag, tap-then-"Put here" and keyboard (Tab to a chip, Enter/Space to pick it up, Tab to a zone's "Put here", Enter) all work, also with `capacity: 1` zones (sequence ordering) and several chips per zone (sorting). One backward-compatible change: while a chip is being dragged within 72px of the top or bottom of the window the page now auto-scrolls (up to 28px per pointer move), because chips use `touch-action: none` and a finger could not otherwise reach a zone that is off screen on a phone. Props are unchanged. Second engine fix: `RoundFeedback`'s "right" sentence now wraps (`min-w-0 break-words`); the long Tamil cheer "கண்டுபிடித்துவிட்டீர்கள்!" made the page scroll sideways at 390px. Shared ICT helper `games/ict/SortBoard.tsx` (DragDropZone plus a "Check" button and one explanation for the first wrong item) can be imported by other subject folders.
