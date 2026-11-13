# Games section brief (Grade 6, age 10-11)

Source of truth for every agent working on Games. Also read: docs/KIDS-UX-BRIEF.md, docs/CONTRACT.md (Kids UX components), docs/A11Y.md, docs/I18N-GLOSSARY.md, docs/ASSETS.md, docs/PROGRESS.md, `curriculum/grade6/*/path.json`, `src/mocks/grade6.generated.ts`.

## Goal
A "Games" section where Grade 6 children learn Mathematics, Sinhala, Science, English and ICT by playing short, ORIGINAL games, in the spirit of a bright browsable library of quick games grouped by subject and topic, each opening full-screen in the page. Do NOT copy any game, artwork, text, name, layout detail or code from Math Playground or any other site. No ads, no external scripts, no tracking.

## Where it lives
- Routes `/student/games` (library) and `/student/games/:gameId` (player). Reachable from the Play hub (big "Games" card). No sixth nav item (Play's `alsoActiveFor` covers `/student/games`). Old routes keep working.
- Library: big game cards (thumbnail = token-coloured SVG fallback, short kid title, one-line how-to-play), big subject-icon filter (SubjectIcon), topic/unit filter tied to Grade 6 concept ids, "Games for what I am learning now" row (from the learning trail), "Play again" and "New" rows, Nova speech bubble. One action per card: Play.
- Game page: calm full-width stage, large "How to play" button (HelpBubble + read-aloud), Pause/Quit always reachable, score as stars (never a rank), gentle finish screen (Nova cheer, stars, "Play again", "Try another game", "Back to games").

## Architecture
- `GameDefinition` in `src/types` (and docs/CONTRACT.md): id, subject, grade, conceptIds (valid Grade 6 ids), titleKey, howToKey, difficulty levels, estimatedMinutes, kind, thumbnail, lazy component loader. Games are `React.lazy` code-split.
- Engine in `src/features/student/games/engine`: pure SEEDED round/question generators (unit-testable, no random UI logic), `GameShell` (stage, pause, how-to, finish, focus management, aria-live), `useGameSession`, shared UI: BigChoiceButton, NumberPad, DragDropZone (with tap alternative), optional TimerBar, StarsMeter.
- Registry: one file per subject folder `src/features/student/games/<subject>/index.ts` exporting `GameDefinition[]`, aggregated in `games/registry.ts`, so adding a game is cheap and subject agents never edit the same file.
- Progress via services only: `studentService`/`rewardsService` gain `recordGamePlay(userId, gameId, {stars, correct, total, durationSec, conceptIds})` and `listGameStats(userId)`. Mock in `src/mocks` (memory + localStorage). Results may nudge the mastery BAND of linked concepts (small, bounded, never a mark/percent) and feed rewards (new badges: first game, 5 games, game in each subject, tried a new subject; i18n in en/si/ta; art via BadgeImage fallback). Swapping mocks for Express/Supabase stays a one-file change; document the new methods in README's swap table.
- Sound OFF by default, a Sound toggle in Me; tiny original generated sounds or none.

## Safety and UX rules
- No leaderboards, ranking, comparison, public scores. No countdown pressure by default (optional gentle timer only in an "extra challenge" mode, off by default). No lives lost, no shaming. Wrong answers: kind hint ("Nice try! Look again") + the right answer explained in one short kid sentence. Rewards never tied to wellbeing. Mastery stays a band via GrowMeter. No flashing/strobing/sudden loud sounds; honour reduced motion (`motion-ok:` and `html[data-motion="reduced"]`).
- 56px+ primary targets, body text >= 18px, one clear action per screen, plain words, Nova as host (six poses), read-aloud on instructions/questions where a voice exists, big forgiving drag targets WITH tap alternatives.
- Accessibility: fully keyboard playable (arrows/Tab/Enter/Space, visible focus ring), screen-reader labels + aria-live feedback, no information by colour alone, no hover-only actions, no horizontal scroll at 1440/834/390.
- Languages: every string in en, si, ta at child reading level, consistent with docs/I18N-GLOSSARY.md; `npm run i18n:check` must pass; list new si/ta strings in docs/I18N-REVIEW.md for native review; never English in si/ta (except proper nouns). Word-based games need per-language word banks authored carefully and flagged for native review. Sinhala: proper Unicode, line-height >= 1.6.
- Art: use existing Nova, SubjectIcon, badges; token-coloured SVG for thumbnails/scenery; never claim art exists that does not; fall back gracefully. No hex outside tailwind.config.ts; reuse fx-* motion tokens; plain React/CSS/SVG, no heavy libraries.
- DO NOT touch `E:\EduNova\public` existing/untracked files (the user's own). New images only in new subfolders like `public/games/`. Never `git add -A`; add only your own paths.

## Starter games (>= 12, >= 2 per subject, 3 difficulty levels each, endless fresh rounds from seeded generators, linked to real concept ids in path.json)
Vary mechanics: drag and drop, tap to choose, number pad, sort into bins, sequence ordering, matching pairs, mini-adventure. Content original, matching the units in path.json (not textbook text/exercises).
- Maths: Fraction Pizza, Number Line Jump, Factor Fishing, Decimal Market, Angle Archer, Ratio Recipes, Area Builder, Clock Quest.
- Science: Magnet Lab, Light & Shadows, Sound Waves, Weather Station, Food Chain Builder, Water Cycle Order, States of Matter sorting.
- Sinhala: Word Builder, Match Word to Picture, Sentence Order, Fix the Spelling, Reading Race.
- English: Word Match, Spelling Bee, Sentence Scramble, Pick the Preposition, Past or Present?, Story Sequence.
- ICT: Keyboard Explorer, Mouse Maze, Flowchart Builder, Safe or Unsafe?, Parts of a Computer.
Pick the best feasible subset per subject.

## Agent split and ownership
1. Foundation (types, services/mocks, engine, GameShell, library, routes, Play card, rewards/badges, docs, Vitest). Merged first.
2. Maths + Science games: `games/maths/`, `games/science/`, i18n block `games.maths.*`, `games.science.*`.
3. Sinhala + English: `games/sinhala/`, `games/english/`, `games.sinhala.*`, `games.english.*`.
4. ICT + a "mixed challenge" game: `games/ict/`, `games/mixed/`.
5. QA last.
i18n JSON: each agent only ADDS its own key block (en/si/ta); resolve merge conflicts keeping both sides.

## Definition of done
`npm run typecheck`, `lint`, `i18n:check`, `build` pass; unit tests for seeded generators and scoring (Vitest, documented); each game browser-verified; docs/PROGRESS.md, CONTRACT.md, ASSETS.md and README route map updated; short report of games shipped, undone items, si/ta strings needing native review.
