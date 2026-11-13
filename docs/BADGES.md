# Badge artwork

## How badges are drawn

Every badge works with **no image files at all**. `BadgeImage` (src/components/ui/BadgeImage.tsx) shows the built-in **vector medal** `BadgeArt` (src/components/ui/BadgeArt.tsx), drawn in code with SVG:

- **Shape by category:** learning = shield, mastery = scalloped rosette, habits = hexagon, curiosity = round medal, quests = 8-point star.
- **Colour by rarity tier:** common "Everyday" = sky blue, uncommon "Growing" = leaf green, rare "Bright" = sunny orange (with ribbon tails), epic "Shining" = bloom purple (ribbon tails and a small star on top). Colours are the `badge.*` tokens in tailwind.config.ts (no hex in components).
- **Glyph per badge** (lucide icon): first-lesson sprout, practice-pal pen, unit-complete layers, unit-trio blocks, term-complete graduation cap, strong-quiz target, strong-quiz-3 award, streak-3 flame, streak-7 calendar tick, first-review light bulb, revision-streak brain, welcome-back sunrise, first-question speech bubble with question mark, source-checker magnifier with tick, quest-finisher flag, quest-trio mountain.
- **Not earned yet:** a soft grey silhouette (no padlock, no text, no animation).
- **Animation (earned only):** slow glow-ring pulse (4 s), a few small twinkling sparkles (3.6 s), a one-off shine sweep on hover or keyboard focus, and a one-time "pop" when a badge is newly earned (celebration card). Keyframes are tokens in tailwind.config.ts (`badge-glow`, `badge-twinkle`, `badge-shine`, `badge-pop`) used behind the `motion-ok:` variant, so with reduced motion (OS setting or `html[data-motion="reduced"]`) the medal is completely static.

## Google Flow images override the built-in badges

If a real image exists, it is used instead of the vector medal: put `public/badges/<badgeId>.png` (or `.webp`) in place and `BadgeImage` picks it up automatically (PNG is tried first, then WebP; each id is probed once per page session). Missing or broken files silently fall back to the vector medal, so a partial set is safe to ship. Images are plain pictures, so they do not get the glow, sparkle or pop animation (the greyed look for locked badges still applies). **No badge images are included in the repository.** Google Flow is an external tool and was not used to create the built-in art.

## Specification (every Flow image)

- Format: PNG (preferred) or WebP, **512 x 512 px, transparent background**, square, subject centred with about 8% padding.
- No text, letters or numbers inside the image (names and numbers are shown by the app and are translated).
- Match the built-in look so the set feels consistent: bright, friendly, flat-gradient medal with a thick darker outline, a lighter inner highlight and a white glyph on a deeper-coloured face. Same shape per category and same colour per rarity as listed above.
- Keep each file under about 150 KB.
- Filename = badge id exactly, lower case: `public/badges/<id>.png`.
- Rarity is shown by colour and ribbon only; do not add words like "rare".
- Avoid anything that implies ranking, competition or other students (no podiums, crowns for "best", leaderboards).

## Shared style prompt

Paste the per-badge prompt below. It already includes the shared style text:

> Children's educational app badge, bright cheerful colourful medal, soft rounded shapes, thick darker outline in the same hue, smooth two-tone gradient (light top to deeper bottom), a lighter glossy highlight arc along the top edge, a deeper-coloured inner face holding one simple white glyph, centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of 16 badges. Colour by tier: Everyday = sky blue (#38BDF8 to #0284C7, outline #0C4A6E), Growing = leaf green (#34D399 to #059669, outline #064E3B), Bright = sunny orange-yellow (#FBBF24 to #EA580C, outline #7C2D12) with two ribbon tails, Shining = bloom purple (#C084FC to #9333EA, outline #581C87) with two ribbon tails and a tiny star on top. Subject: <subject>.

## Badges

| # | Badge id | Title | Rarity (tier) | Expected file | Size |
|---|---|---|---|---|---|
| 1 | `first-lesson` | First lesson | common | `public/badges/first-lesson.png` | 512x512, transparent |
| 2 | `practice-pal` | Practice pal | common | `public/badges/practice-pal.png` | 512x512, transparent |
| 3 | `unit-complete` | Unit complete | uncommon | `public/badges/unit-complete.png` | 512x512, transparent |
| 4 | `unit-trio` | Unit trio | rare | `public/badges/unit-trio.png` | 512x512, transparent |
| 5 | `term-complete` | Term complete | epic | `public/badges/term-complete.png` | 512x512, transparent |
| 6 | `strong-quiz` | Strong quiz | uncommon | `public/badges/strong-quiz.png` | 512x512, transparent |
| 7 | `strong-quiz-3` | Strong three | rare | `public/badges/strong-quiz-3.png` | 512x512, transparent |
| 8 | `streak-3` | 3 days in a row | common | `public/badges/streak-3.png` | 512x512, transparent |
| 9 | `streak-7` | 7 days in a row | uncommon | `public/badges/streak-7.png` | 512x512, transparent |
| 10 | `first-review` | First recall | common | `public/badges/first-review.png` | 512x512, transparent |
| 11 | `revision-streak` | Memory keeper | uncommon | `public/badges/revision-streak.png` | 512x512, transparent |
| 12 | `welcome-back` | Welcome back | uncommon | `public/badges/welcome-back.png` | 512x512, transparent |
| 13 | `first-question` | First question | common | `public/badges/first-question.png` | 512x512, transparent |
| 14 | `source-checker` | Source checker | uncommon | `public/badges/source-checker.png` | 512x512, transparent |
| 15 | `quest-finisher` | Quest finisher | common | `public/badges/quest-finisher.png` | 512x512, transparent |
| 16 | `quest-trio` | Quest trio | rare | `public/badges/quest-trio.png` | 512x512, transparent |

## Ready-to-paste Google Flow prompts (optional)

### First lesson (`first-lesson`)

File: `public/badges/first-lesson.png`

```text
Children's educational app badge, bright cheerful colourful medal, soft rounded shapes, thick darker outline in the same hue, smooth two-tone gradient (light top to deeper bottom), a lighter glossy highlight arc along the top edge, a deeper-coloured inner face holding one simple white glyph, centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of 16 badges. Colour by tier: Everyday = sky blue (#38BDF8 to #0284C7, outline #0C4A6E), Growing = leaf green (#34D399 to #059669, outline #064E3B), Bright = sunny orange-yellow (#FBBF24 to #EA580C, outline #7C2D12) with two ribbon tails, Shining = bloom purple (#C084FC to #9333EA, outline #581C87) with two ribbon tails and a tiny star on top. Medal shape: shield. Tier: Everyday sky-blue. Subject: a small green sprout growing from the ground.
```

### Practice pal (`practice-pal`)

File: `public/badges/practice-pal.png`

```text
Children's educational app badge, bright cheerful colourful medal, soft rounded shapes, thick darker outline in the same hue, smooth two-tone gradient (light top to deeper bottom), a lighter glossy highlight arc along the top edge, a deeper-coloured inner face holding one simple white glyph, centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of 16 badges. Colour by tier: Everyday = sky blue (#38BDF8 to #0284C7, outline #0C4A6E), Growing = leaf green (#34D399 to #059669, outline #064E3B), Bright = sunny orange-yellow (#FBBF24 to #EA580C, outline #7C2D12) with two ribbon tails, Shining = bloom purple (#C084FC to #9333EA, outline #581C87) with two ribbon tails and a tiny star on top. Medal shape: shield. Tier: Everyday sky-blue. Subject: a friendly pen drawing a short line.
```

### Unit complete (`unit-complete`)

File: `public/badges/unit-complete.png`

```text
Children's educational app badge, bright cheerful colourful medal, soft rounded shapes, thick darker outline in the same hue, smooth two-tone gradient (light top to deeper bottom), a lighter glossy highlight arc along the top edge, a deeper-coloured inner face holding one simple white glyph, centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of 16 badges. Colour by tier: Everyday = sky blue (#38BDF8 to #0284C7, outline #0C4A6E), Growing = leaf green (#34D399 to #059669, outline #064E3B), Bright = sunny orange-yellow (#FBBF24 to #EA580C, outline #7C2D12) with two ribbon tails, Shining = bloom purple (#C084FC to #9333EA, outline #581C87) with two ribbon tails and a tiny star on top. Medal shape: shield. Tier: Growing leaf-green. Subject: a neat stack of three flat layers.
```

### Unit trio (`unit-trio`)

File: `public/badges/unit-trio.png`

```text
Children's educational app badge, bright cheerful colourful medal, soft rounded shapes, thick darker outline in the same hue, smooth two-tone gradient (light top to deeper bottom), a lighter glossy highlight arc along the top edge, a deeper-coloured inner face holding one simple white glyph, centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of 16 badges. Colour by tier: Everyday = sky blue (#38BDF8 to #0284C7, outline #0C4A6E), Growing = leaf green (#34D399 to #059669, outline #064E3B), Bright = sunny orange-yellow (#FBBF24 to #EA580C, outline #7C2D12) with two ribbon tails, Shining = bloom purple (#C084FC to #9333EA, outline #581C87) with two ribbon tails and a tiny star on top. Medal shape: shield. Tier: Bright orange-yellow with ribbon tails. Subject: a cluster of three little blocks.
```

### Term complete (`term-complete`)

File: `public/badges/term-complete.png`

```text
Children's educational app badge, bright cheerful colourful medal, soft rounded shapes, thick darker outline in the same hue, smooth two-tone gradient (light top to deeper bottom), a lighter glossy highlight arc along the top edge, a deeper-coloured inner face holding one simple white glyph, centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of 16 badges. Colour by tier: Everyday = sky blue (#38BDF8 to #0284C7, outline #0C4A6E), Growing = leaf green (#34D399 to #059669, outline #064E3B), Bright = sunny orange-yellow (#FBBF24 to #EA580C, outline #7C2D12) with two ribbon tails, Shining = bloom purple (#C084FC to #9333EA, outline #581C87) with two ribbon tails and a tiny star on top. Medal shape: shield. Tier: Shining purple with ribbon tails and a tiny star on top. Subject: a graduation cap.
```

### Strong quiz (`strong-quiz`)

File: `public/badges/strong-quiz.png`

```text
Children's educational app badge, bright cheerful colourful medal, soft rounded shapes, thick darker outline in the same hue, smooth two-tone gradient (light top to deeper bottom), a lighter glossy highlight arc along the top edge, a deeper-coloured inner face holding one simple white glyph, centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of 16 badges. Colour by tier: Everyday = sky blue (#38BDF8 to #0284C7, outline #0C4A6E), Growing = leaf green (#34D399 to #059669, outline #064E3B), Bright = sunny orange-yellow (#FBBF24 to #EA580C, outline #7C2D12) with two ribbon tails, Shining = bloom purple (#C084FC to #9333EA, outline #581C87) with two ribbon tails and a tiny star on top. Medal shape: scalloped rosette (wavy circular edge). Tier: Growing leaf-green. Subject: a target with a centred bullseye.
```

### Strong three (`strong-quiz-3`)

File: `public/badges/strong-quiz-3.png`

```text
Children's educational app badge, bright cheerful colourful medal, soft rounded shapes, thick darker outline in the same hue, smooth two-tone gradient (light top to deeper bottom), a lighter glossy highlight arc along the top edge, a deeper-coloured inner face holding one simple white glyph, centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of 16 badges. Colour by tier: Everyday = sky blue (#38BDF8 to #0284C7, outline #0C4A6E), Growing = leaf green (#34D399 to #059669, outline #064E3B), Bright = sunny orange-yellow (#FBBF24 to #EA580C, outline #7C2D12) with two ribbon tails, Shining = bloom purple (#C084FC to #9333EA, outline #581C87) with two ribbon tails and a tiny star on top. Medal shape: scalloped rosette (wavy circular edge). Tier: Bright orange-yellow with ribbon tails. Subject: an award rosette with two short ribbons.
```

### 3 days in a row (`streak-3`)

File: `public/badges/streak-3.png`

```text
Children's educational app badge, bright cheerful colourful medal, soft rounded shapes, thick darker outline in the same hue, smooth two-tone gradient (light top to deeper bottom), a lighter glossy highlight arc along the top edge, a deeper-coloured inner face holding one simple white glyph, centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of 16 badges. Colour by tier: Everyday = sky blue (#38BDF8 to #0284C7, outline #0C4A6E), Growing = leaf green (#34D399 to #059669, outline #064E3B), Bright = sunny orange-yellow (#FBBF24 to #EA580C, outline #7C2D12) with two ribbon tails, Shining = bloom purple (#C084FC to #9333EA, outline #581C87) with two ribbon tails and a tiny star on top. Medal shape: hexagon. Tier: Everyday sky-blue. Subject: a small friendly flame.
```

### 7 days in a row (`streak-7`)

File: `public/badges/streak-7.png`

```text
Children's educational app badge, bright cheerful colourful medal, soft rounded shapes, thick darker outline in the same hue, smooth two-tone gradient (light top to deeper bottom), a lighter glossy highlight arc along the top edge, a deeper-coloured inner face holding one simple white glyph, centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of 16 badges. Colour by tier: Everyday = sky blue (#38BDF8 to #0284C7, outline #0C4A6E), Growing = leaf green (#34D399 to #059669, outline #064E3B), Bright = sunny orange-yellow (#FBBF24 to #EA580C, outline #7C2D12) with two ribbon tails, Shining = bloom purple (#C084FC to #9333EA, outline #581C87) with two ribbon tails and a tiny star on top. Medal shape: hexagon. Tier: Growing leaf-green. Subject: a calendar page with a check mark.
```

### First recall (`first-review`)

File: `public/badges/first-review.png`

```text
Children's educational app badge, bright cheerful colourful medal, soft rounded shapes, thick darker outline in the same hue, smooth two-tone gradient (light top to deeper bottom), a lighter glossy highlight arc along the top edge, a deeper-coloured inner face holding one simple white glyph, centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of 16 badges. Colour by tier: Everyday = sky blue (#38BDF8 to #0284C7, outline #0C4A6E), Growing = leaf green (#34D399 to #059669, outline #064E3B), Bright = sunny orange-yellow (#FBBF24 to #EA580C, outline #7C2D12) with two ribbon tails, Shining = bloom purple (#C084FC to #9333EA, outline #581C87) with two ribbon tails and a tiny star on top. Medal shape: hexagon. Tier: Everyday sky-blue. Subject: a glowing light bulb.
```

### Memory keeper (`revision-streak`)

File: `public/badges/revision-streak.png`

```text
Children's educational app badge, bright cheerful colourful medal, soft rounded shapes, thick darker outline in the same hue, smooth two-tone gradient (light top to deeper bottom), a lighter glossy highlight arc along the top edge, a deeper-coloured inner face holding one simple white glyph, centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of 16 badges. Colour by tier: Everyday = sky blue (#38BDF8 to #0284C7, outline #0C4A6E), Growing = leaf green (#34D399 to #059669, outline #064E3B), Bright = sunny orange-yellow (#FBBF24 to #EA580C, outline #7C2D12) with two ribbon tails, Shining = bloom purple (#C084FC to #9333EA, outline #581C87) with two ribbon tails and a tiny star on top. Medal shape: hexagon. Tier: Growing leaf-green. Subject: a brain with soft folds.
```

### Welcome back (`welcome-back`)

File: `public/badges/welcome-back.png`

```text
Children's educational app badge, bright cheerful colourful medal, soft rounded shapes, thick darker outline in the same hue, smooth two-tone gradient (light top to deeper bottom), a lighter glossy highlight arc along the top edge, a deeper-coloured inner face holding one simple white glyph, centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of 16 badges. Colour by tier: Everyday = sky blue (#38BDF8 to #0284C7, outline #0C4A6E), Growing = leaf green (#34D399 to #059669, outline #064E3B), Bright = sunny orange-yellow (#FBBF24 to #EA580C, outline #7C2D12) with two ribbon tails, Shining = bloom purple (#C084FC to #9333EA, outline #581C87) with two ribbon tails and a tiny star on top. Medal shape: hexagon. Tier: Growing leaf-green. Subject: a sun rising over the horizon with an up arrow.
```

### First question (`first-question`)

File: `public/badges/first-question.png`

```text
Children's educational app badge, bright cheerful colourful medal, soft rounded shapes, thick darker outline in the same hue, smooth two-tone gradient (light top to deeper bottom), a lighter glossy highlight arc along the top edge, a deeper-coloured inner face holding one simple white glyph, centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of 16 badges. Colour by tier: Everyday = sky blue (#38BDF8 to #0284C7, outline #0C4A6E), Growing = leaf green (#34D399 to #059669, outline #064E3B), Bright = sunny orange-yellow (#FBBF24 to #EA580C, outline #7C2D12) with two ribbon tails, Shining = bloom purple (#C084FC to #9333EA, outline #581C87) with two ribbon tails and a tiny star on top. Medal shape: round. Tier: Everyday sky-blue. Subject: a speech bubble with a question mark.
```

### Source checker (`source-checker`)

File: `public/badges/source-checker.png`

```text
Children's educational app badge, bright cheerful colourful medal, soft rounded shapes, thick darker outline in the same hue, smooth two-tone gradient (light top to deeper bottom), a lighter glossy highlight arc along the top edge, a deeper-coloured inner face holding one simple white glyph, centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of 16 badges. Colour by tier: Everyday = sky blue (#38BDF8 to #0284C7, outline #0C4A6E), Growing = leaf green (#34D399 to #059669, outline #064E3B), Bright = sunny orange-yellow (#FBBF24 to #EA580C, outline #7C2D12) with two ribbon tails, Shining = bloom purple (#C084FC to #9333EA, outline #581C87) with two ribbon tails and a tiny star on top. Medal shape: round. Tier: Growing leaf-green. Subject: a magnifying glass with a check mark in the lens.
```

### Quest finisher (`quest-finisher`)

File: `public/badges/quest-finisher.png`

```text
Children's educational app badge, bright cheerful colourful medal, soft rounded shapes, thick darker outline in the same hue, smooth two-tone gradient (light top to deeper bottom), a lighter glossy highlight arc along the top edge, a deeper-coloured inner face holding one simple white glyph, centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of 16 badges. Colour by tier: Everyday = sky blue (#38BDF8 to #0284C7, outline #0C4A6E), Growing = leaf green (#34D399 to #059669, outline #064E3B), Bright = sunny orange-yellow (#FBBF24 to #EA580C, outline #7C2D12) with two ribbon tails, Shining = bloom purple (#C084FC to #9333EA, outline #581C87) with two ribbon tails and a tiny star on top. Medal shape: 8-point star. Tier: Everyday sky-blue. Subject: a flag on a pole.
```

### Quest trio (`quest-trio`)

File: `public/badges/quest-trio.png`

```text
Children's educational app badge, bright cheerful colourful medal, soft rounded shapes, thick darker outline in the same hue, smooth two-tone gradient (light top to deeper bottom), a lighter glossy highlight arc along the top edge, a deeper-coloured inner face holding one simple white glyph, centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of 16 badges. Colour by tier: Everyday = sky blue (#38BDF8 to #0284C7, outline #0C4A6E), Growing = leaf green (#34D399 to #059669, outline #064E3B), Bright = sunny orange-yellow (#FBBF24 to #EA580C, outline #7C2D12) with two ribbon tails, Shining = bloom purple (#C084FC to #9333EA, outline #581C87) with two ribbon tails and a tiny star on top. Medal shape: 8-point star. Tier: Bright orange-yellow with ribbon tails. Subject: a mountain with three peaks.
```

## Checklist

- [ ] (Optional) Generate the 16 images in Google Flow with the prompts above (same session or same style reference so the set matches).
- [ ] Export each as PNG with a transparent background, 512 x 512 px (use a background remover if Flow adds one).
- [ ] Check there is no text, number or letter in any image.
- [ ] Name each file exactly as listed (`<badge id>.png`) and place it in `public/badges/`.
- [ ] Open `/student/badges` at 1440, 834 and 390 widths and check each badge at small (48 px), medium (80 px) and large (128 px) sizes.
- [ ] Check the locked (greyed, 40% opacity) look is still readable, and that images sit well next to the built-in vector badges for any id you have not replaced.
- [ ] Add a short alt/credit note here if the tool's terms require attribution.
- [ ] If a file is missing or broken, the app silently shows the built-in vector badge, so a partial set is safe to ship.

## Adding a new badge

1. Add an entry to `BADGES` in `src/lib/rewards.ts` (id, titleKey, descriptionKey, criteria, category, rarity).
2. Add `rewards.badge.<id>.title` and `rewards.badge.<id>.desc` to en.json, si.json and ta.json.
3. Add the badge's glyph to `GLYPHS` in `src/components/ui/BadgeArt.tsx` (shape and colour follow its category and rarity automatically).
4. Add a row and prompt to this file and drop `public/badges/<id>.png`.
