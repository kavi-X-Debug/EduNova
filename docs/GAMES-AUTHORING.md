# How to add a game

Spec: `docs/GAMES-BRIEF.md` (safety and UX rules), `docs/A11Y.md`, `docs/I18N-GLOSSARY.md`. Reference game to copy: `src/features/student/games/maths/` (`NumberLineJump.tsx`, `numberLineJump.generator.ts`, its tests). The engine is `src/features/student/games/engine/` (import everything from `'../engine'`, except generators, see below).

## Step by step (own subject folder only; never edit `registry.ts`)

1. Pick a kebab-case `id` (`factor-fishing`), the subject folder (`games/<subject>/`) and real Grade 6 concept ids from `curriculum/grade6/<subject>/path.json` (e.g. `m6-factors-multiples`).
2. **Generator** `games/<subject>/<camelId>.generator.ts`: a PURE `makeRound(rng, { index, level })` returning a plain object (question data, options, the right answer, a language-neutral working such as `"5 + 3 = 8"`). Import only `../engine/generate` and `../engine/rng` (no React, no services), never `Math.random()`/`Date`. Must give 3 clearly different levels (range, number of steps, kind of question). Export `ROUNDS_PER_PLAY` (6-10).
3. **Component** `games/<subject>/<PascalId>.tsx`, default export `(props: GameComponentProps) => JSX`. Call `useGameSession({ rounds, makeRound })` (`makeRound` must be a module-level function). Render the question, the answer controls (BigChoiceButton in a ChoiceGroup, NumberPad, DragDropZone), then `<RoundFeedback session={session} />`. Keep per-round state (typed text, picked option) in a child remounted with `key={session.index}`. On an answer call `session.answer(isCorrect, explanationSentence)`; the explanation is one short kid sentence shown after a wrong answer. The shell does the rest (How to play, Pause, Quit, progress dots, stars, finish screen, `recordGamePlay`).
4. **Register** in `games/<subject>/index.ts`: add a `GameDefinition` to the exported array (`load: () => import('./PascalId')`).
5. **i18n** in `en.json`, `si.json`, `ta.json`, one contiguous block, keys `games.<subject>.<camelId>.<field>` (`title`, `howTo` are required; `howTo` is also the one-line card text, keep it under about 25 words). Interpolation only (`{{n}}`), no concatenated fragments, no case suffix glued to a placeholder in si/ta. Add the new si/ta strings to `docs/I18N-REVIEW.md` for native review.
6. **Tests** next to the generator: determinism, every round valid (exactly one right answer, values inside range, each level), no duplicates among options. `npm test` also runs `registry.test.ts`, which checks your game: unique id, concept ids exist and belong to the subject, 3 levels, `title`/`howTo` keys exist in en/si/ta.
7. Run `npm run typecheck && npm run lint && npm run i18n:check && npm test && npm run build`, then play it in the browser at 1440 and 390 in en, si and ta.

## GameDefinition fields (`src/types`)
`id`, `subject` (`maths|science|sinhala|english|ict|mixed`), `grade: 6`, `conceptIds`, `titleKey`, `howToKey`, `levels: [1,2,3]`, `estimatedMinutes`, `kind` (`tap|numpad|drag|sort|sequence|match|adventure|mixed`), `thumbnail: { tone: 'brand'|'leaf'|'sun'|'bloom'|'sky', image? }`, `load`.
Thumbnails are always a token-coloured SVG plus the subject icon; `image` (a new file under `public/games/`, never an existing public file) is optional and only shown if it loads. Do not claim art that does not exist.

## Engine API
- `createRng(seed)` -> `{ next, int(min,max), pick, shuffle, sample, chance }`; `generateRounds(seed, level, count, makeRound)`; `buildChoices(rng, correct, distractors, count)` (one right option, no duplicates, returns `{ options, correctIndex }`); `numericDistractors(rng, correct, n, { spread, min, max })`.
- `useGameSession({ rounds, makeRound })` -> `{ round, index, total, isLast, level, extraChallenge, paused, status: 'asking'|'right'|'wrong', correct, answer(ok, explanation?), next() }`. One attempt per round, no lives, no penalties.
- `computeStars(correct, total)`: 1-3 (never 0, never a rank): 3 at >= 85%, 2 at >= 60%, else 1.
- UI: `BigChoiceButton` + `ChoiceGroup` (arrow keys), `NumberPad` (on-screen + keyboard, `allowNegative`, `allowDecimal`), `DragDropZone` (drag, tap-to-pick then "Put here", keyboard, announces moves; controlled `placements`), `TimerBar` (only when `session.extraChallenge`, off by default; call `session.answer(false, why)` on elapsed), `StarsMeter`, `RoundFeedback`, `playSound('tap'|'right'|'wrong'|'finish')` (silent unless the child turned Sound on in Me).
- Fully custom mechanics (sequence, matching, adventure) are plain React inside your component; reuse `RoundFeedback`/`session` so scoring and the finish screen stay identical.

## i18n key naming
`games.<subject>.<camelId>.title|howTo|question|explain|...` (subject folder name; `mixed` for mixed). Shared strings already exist under `games.shell.*`, `games.feedback.*`, `games.pad.*`, `games.drag.*`, `games.stars.*`; reuse them. Word-based games keep per-language word banks in the three locale files (not in code) and flag them for native review. Tamil/Sinhala words must be real script, no English.

## Accessibility checklist (per game)
- Fully playable by keyboard (Tab/arrows/Enter/Space; number keys for the pad); visible focus ring (`focusRing` from `@/components/ui/cn`).
- 56px+ primary targets, text >= 18px (`text-lg`+), one clear action per screen.
- Right/wrong never by colour alone (BigChoiceButton adds an icon and hidden text); feedback sits in the polite live region (`RoundFeedback`).
- Drag always has the tap alternative; no hover-only actions; no timers unless `extraChallenge`.
- Pictures/SVG are decorative (`aria-hidden`) or have a real `aria-label`; the question text carries the meaning.
- No flashing, no sudden loud sound, motion only behind `motion-ok:`; no horizontal scroll at 1440/834/390.
- Sinhala/Tamil: `lang` on mixed-language fragments, no truncation, line-height from global CSS.
- Colours only from Tailwind tokens (`fill-brand-500`, `stroke-ink-soft`...); no hex.
- No leaderboards, rank, comparison or shame wording; the only score is stars.
