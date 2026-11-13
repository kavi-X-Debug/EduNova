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

### ICT and Mixed games (agent/games-ict)
No raster art. In-game pictures are token-coloured SVG components in `src/features/student/games/ict/ictArt.tsx` (key caps and a mini keyboard, six shapes, eight computer parts, four flowchart symbols, file and folder icons), all decorative (`aria-hidden`) with the meaning in the text beside them. Thumbnails stay the generic `GameThumb` SVG plus the subject icon; none of these games sets `thumbnail.image`.
English games: no new raster art. The Pick the Little Word picture is an inline token-coloured SVG (`english/PrepositionScene.tsx`: floor, box, table, ball; decorative, with an `aria-label` that gives the sentence). English game thumbnails use the token-coloured `GameThumb` plus the existing English subject icon; no `public/games/` image was added.
## Sinhala games pictures
`src/features/student/games/sinhala/pictures.tsx` draws 19 simple original pictures (tree, flower, book, sun, moon, star, cat, bird, house, ball, mango, umbrella, cup, fish, river, mountains, grass, ladder, bell) as inline SVG with Tailwind colour tokens only (no hex, no files, no public/ assets). They are hand-made and plain, not Flow art; they carry a translated `aria-label` (`games.sinhala.pic.*`) where the picture matters.
### Science games art (code-drawn, no files)
All pictures in `src/features/student/games/science/art.tsx` are code: token-coloured SVG (`fill-badge-*`, `stroke-ink-*`, no hex) and lucide icons. Nothing is loaded from `public/`, nothing can fail to load.
- `MagnetPair`: two bar magnets, poles printed as the letters N and S (colour is never the only clue). Magnet Lab.
- `CircuitSvg`: battery, switch, bulb and wire loop; missing parts are dashed gaps; the bulb glows (rays, not flashing) only after the answer. Electric Circuit Builder. Small battery only; the game shows a safety line.
- `ShadowScene` (Light and Shadows) and `WaterScene` (Water Cycle Order): small decorative scenes (`aria-hidden`).
- `Glyph`: one lucide icon per item (nail, drum, deer, ...), always shown with the item's name. Some are approximate (a deer uses the rabbit icon, an elephant a generic shape, most birds the same bird), so the written name is what carries the meaning. These are placeholders until real illustrations exist.
- Game thumbnails stay the shared `GameThumb` SVG plus the Science subject icon; no `public/games/*.png` was added.

## Game scenes and profile avatars: `public/games/` and `public/avatars/` (agent/game-art)
Made with Google Flow (AI-generated). **Check Flow's terms of use before any public release; no licence claim is made here.** All are decorative (`alt=""`), lazy-loaded with width and height, and fall back when a file fails.

`public/games/` (WebP, 640 x 400, 8:5, 15-30 KB each, 30 files):
- `<gameId>.webp` for all 26 games (number-line-jump, magnet-lab, light-shadows, sound-detective, water-cycle-order, food-chain-builder, circuit-builder, word-builder, match-word-picture, sentence-order, fix-the-spelling, reading-race, word-match, spelling-bee, sentence-scramble, pick-the-preposition, past-or-present, story-sequence, fill-the-gap, keyboard-explorer, mouse-maze, flowchart-builder, safe-or-unsafe, parts-of-a-computer, folder-sorter, mixed-challenge). Set as `thumbnail.image` in each subject's `index.ts`. Used by `GameCard` / `GameThumb` (library cards; the picture is scaled 1.08 to hide a thin baked-in white frame), the game page header (small, from 834px) and the "How to play" screen (faint, slowly zooming backdrop). `story-sequence` has the word "SCHOOL" baked into the picture; accepted, the picture is decorative. Fallback: the token-coloured SVG plus the subject icon.
- `games-hero.webp`: hero banner at the top of the games library, behind Nova's speech bubble (`GamesPage`). Fallback: nothing is drawn, the bubble stays.
- `finish-star.webp`: finish screen (`GameShell`, with floating stars and the star count-up).
- `level-up-rocket.webp`: shown in the star-milestone card on the finish screen (flies up once; still when motion is reduced).
- `take-a-break.webp`: the Pause dialog.

`public/avatars/` (PNG, 256 x 256, transparent, about 27 KB each, 5 files): `cat.png`, `dog.png`, `rabbit.png`, `turtle.png`, `bird.png`. The only picture choices on the student Me page (radio group); `ProfileAvatar` shows them wherever a preset animal avatar is shown, with the chosen colour as a thin rim. Fallback: the lucide icon of the same preset id. Older preset ids (fish, rocket, ...) keep their icon.

### ICT game sprites (agent/gameart-ict)
The six ICT games now use the Flow sprites in `public/game-sprites/` (transparent 256px PNGs, never edited): `robot`, `monitor`, `laptop`, `mouse`, `cheese`, `cursor`, `flow-diamond`, `shield-check`, `padlock`, `warning-sign`, `folder`, `doc-file`, `image-file`, `music-file`. There is no keyboard or video-file sprite, so the key caps and video files keep their SVG. All are decorative (`alt=""`, `aria-hidden`) through `engine/Sprite.tsx` (`<Sprite name size className eager />`; a missing file draws nothing, so a game never breaks). The ICT pieces live in `games/ict/ictSprites.tsx`; the sort bins get their pictures from `SortBoard` (`zoneSprites`).
