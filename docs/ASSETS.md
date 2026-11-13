# Shipped image assets

Every raster image in `public/` and where it is used. The PNGs below were **AI-generated with Google Flow** (Nano Banana 2.1) and had their backgrounds removed (transparent PNG). **Before any public release, check Google Flow's current terms for commercial and school use**; this file does not state any licence terms.

All images are decorative (`alt=""`): names and meaning live in the text next to them (badge and subject names stay in the existing aria-labels). Each has a built-in fallback if the file fails to load, so a missing or renamed file never leaves a hole.

## Mascot Nova: `public/mascot/` (400 x 400 PNG, about 40 KB each)

Rendered by `Mascot` (`src/components/ui/Mascot.tsx`) at 48, 80 or 128 px. Fallback: the built-in SVG Nova. The six poses are preloaded on Home and the Learn hub (`preloadMascots`).

| File | Pose | Used for |
| --- | --- | --- |
| `nova-happy.png` | happy | Default greeting, Me page, check-up intro, test results, Learn path |
| `nova-wave.png` | wave | Home greeting, tour step 1, Ask Nova hello, Adventures hello, sign-in |
| `nova-thinking.png` | thinking | Tutor "thinking" bubble, loading states, tour step 3, revision question |
| `nova-cheer.png` | cheer | Done / success: plan done, check-up result, reward celebration, onboarding done, all steps done |
| `nova-oops.png` | oops | Error states and retry cards |
| `nova-sleepy.png` | sleepy | Empty states (no badges yet, no adventures, empty plan) |

Motion (all behind `motion-ok:`, none with reduced motion): gentle idle bob (`fx-float`), a small pop when Nova appears or the mood changes (`fx-pop-in`), one wave tilt for the wave pose (`fx-wave`), one wiggle for cheer (`fx-wiggle`).

## Subject icons: `public/subjects/` (256 x 256 PNG, about 20 to 26 KB each)

Rendered by `SubjectIcon` (`src/features/student/learnKit/SubjectIcon.tsx`) via `subjectImage()` in `learnKit/subjects.ts`, lazy loaded. Fallback: the lucide icon on a colour tile (`subjectStyle`). Hover wiggle is `fx-wiggle` behind `motion-ok:` when the parent has `group`.

| File | What it is | Where used |
| --- | --- | --- |
| `maths.png` | Maths icon | Subject picker (learning trail), check-up results cards, Home plan rows, test result topics, onboarding and Me subject choices |
| `sinhala.png` | Sinhala icon | same |
| `science.png` | Science icon | same |
| `english.png` | English icon | same |
| `ict.png` | ICT icon | same |
| `trail.png` | Learning trail icon | Learn hub "My learning trail" card (`BigLinkCard image`) |
| `atom.png` | Atom icon | Available through `subjectImage('atom')` for future science-style tiles; not placed on a page yet |

## Badges: `public/badges/` (384 x 384 PNG, 16 files, about 40 KB each)

Named `<badgeId>.png`: `first-lesson`, `first-question`, `first-review`, `practice-pal`, `quest-finisher`, `quest-trio`, `revision-streak`, `source-checker`, `streak-3`, `streak-7`, `strong-quiz`, `strong-quiz-3`, `term-complete`, `unit-complete`, `unit-trio`, `welcome-back`.

Rendered by `BadgeImage` (`src/components/ui/BadgeImage.tsx`) on Badges, Home "My badges", the reward celebration and the profile rewards card, with glow ring, sparkles, hover shine and pop for earned badges; locked ones are soft grey and still. Fallback: the vector medal `BadgeArt`. See docs/BADGES.md for how to replace them.

## Older SVG art (not AI raster)

`public/animations/*.svg`, `public/images/hero-learning-companion.svg` and `public/favicon.svg` are hand-made vector files used by the teacher and admin pages and the app shell; they are not part of the Flow set.

## Games (`/student/games`)
No new raster art was added. Game thumbnails are a token-coloured SVG (`GameThumb`) with the existing subject icon on top. A game may set `thumbnail.image` (e.g. `public/games/<id>.png`, a NEW subfolder; none exist yet) and it is only used if it loads. New badges `first-game`, `game-five`, `new-subject`, `every-subject` have no Flow PNG yet (the vector medal `BadgeArt` shows; add `public/badges/<id>.png` to override). Sounds are generated with Web Audio (no audio files), off by default.
