# Badge artwork (Google Flow)

The app already works without any artwork: `BadgeImage` (src/components/ui/BadgeImage.tsx) tries `/badges/<badgeId>.png`, then `/badges/<badgeId>.webp`, and falls back to a token-coloured icon in a ring when neither file exists. **No badge images are included in the repository yet.** Generate them with Google Flow (an external tool) and drop the files into `public/badges/`.

## Specification (every badge)

- Format: PNG (preferred) or WebP, **512 x 512 px, transparent background**, square, subject centred with about 8% padding.
- No text, letters or numbers inside the image (names and numbers are shown by the app and are translated).
- One consistent style: flat illustrated medal or shield, same palette, same outline weight, friendly and calm (no flames that look aggressive, no sad or shaming imagery).
- Keep each file under about 150 KB.
- Filename = badge id exactly, lower case: `public/badges/<id>.png`.
- Rarity is shown by the ring/ribbon detail only; do not add words like "rare".
- Avoid anything that implies ranking, competition or other students (no podiums, crowns for "best", leaderboards).

## Shared style prompt

Paste the per-badge prompt below. It already includes the shared style text:

> Flat vector illustration, children's educational app badge, round medal or shield, soft rounded shapes, thick clean outlines, limited palette: indigo (#4F46E5 and #3730A3), warm amber (#F59E0B), emerald green (#10B981), soft off-white (#F8FAFC) and slate (#0F172A) for outlines, subtle flat shading only (no gradients, no glow, no photo textures), centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of badges. Subject: <subject>.

## Badges

| # | Badge id | Title | Rarity | Expected file | Size |
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

## Ready-to-paste Google Flow prompts

### First lesson (`first-lesson`)

File: `public/badges/first-lesson.png`

```text
Flat vector illustration, children's educational app badge, round medal, soft rounded shapes, thick clean outlines, limited palette: indigo (#4F46E5 and #3730A3), warm amber (#F59E0B), emerald green (#10B981), soft off-white (#F8FAFC) and slate (#0F172A) for outlines, subtle flat shading only (no gradients, no glow, no photo textures), centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of badges. Subject: an open book with a small bright sprout growing from its pages.
```

### Practice pal (`practice-pal`)

File: `public/badges/practice-pal.png`

```text
Flat vector illustration, children's educational app badge, round medal, soft rounded shapes, thick clean outlines, limited palette: indigo (#4F46E5 and #3730A3), warm amber (#F59E0B), emerald green (#10B981), soft off-white (#F8FAFC) and slate (#0F172A) for outlines, subtle flat shading only (no gradients, no glow, no photo textures), centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of badges. Subject: a friendly pencil beside three small check marks.
```

### Unit complete (`unit-complete`)

File: `public/badges/unit-complete.png`

```text
Flat vector illustration, children's educational app badge, shield, soft rounded shapes, thick clean outlines, limited palette: indigo (#4F46E5 and #3730A3), warm amber (#F59E0B), emerald green (#10B981), soft off-white (#F8FAFC) and slate (#0F172A) for outlines, subtle flat shading only (no gradients, no glow, no photo textures), centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of badges. Subject: a neat stack of three colourful blocks with a tiny flag on top.
```

### Unit trio (`unit-trio`)

File: `public/badges/unit-trio.png`

```text
Flat vector illustration, children's educational app badge, shield, soft rounded shapes, thick clean outlines, limited palette: indigo (#4F46E5 and #3730A3), warm amber (#F59E0B), emerald green (#10B981), soft off-white (#F8FAFC) and slate (#0F172A) for outlines, subtle flat shading only (no gradients, no glow, no photo textures), centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of badges. Subject: three stacked blocks in a row, each with a small star.
```

### Term complete (`term-complete`)

File: `public/badges/term-complete.png`

```text
Flat vector illustration, children's educational app badge, shield with ribbon, soft rounded shapes, thick clean outlines, limited palette: indigo (#4F46E5 and #3730A3), warm amber (#F59E0B), emerald green (#10B981), soft off-white (#F8FAFC) and slate (#0F172A) for outlines, subtle flat shading only (no gradients, no glow, no photo textures), centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of badges. Subject: a graduation cap above a rising sun, with a ribbon.
```

### Strong quiz (`strong-quiz`)

File: `public/badges/strong-quiz.png`

```text
Flat vector illustration, children's educational app badge, round medal, soft rounded shapes, thick clean outlines, limited palette: indigo (#4F46E5 and #3730A3), warm amber (#F59E0B), emerald green (#10B981), soft off-white (#F8FAFC) and slate (#0F172A) for outlines, subtle flat shading only (no gradients, no glow, no photo textures), centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of badges. Subject: a target with an arrow in the centre and small sparkles.
```

### Strong three (`strong-quiz-3`)

File: `public/badges/strong-quiz-3.png`

```text
Flat vector illustration, children's educational app badge, round medal with ribbon, soft rounded shapes, thick clean outlines, limited palette: indigo (#4F46E5 and #3730A3), warm amber (#F59E0B), emerald green (#10B981), soft off-white (#F8FAFC) and slate (#0F172A) for outlines, subtle flat shading only (no gradients, no glow, no photo textures), centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of badges. Subject: three small targets in a triangle, each with a centred arrow.
```

### 3 days in a row (`streak-3`)

File: `public/badges/streak-3.png`

```text
Flat vector illustration, children's educational app badge, round medal, soft rounded shapes, thick clean outlines, limited palette: indigo (#4F46E5 and #3730A3), warm amber (#F59E0B), emerald green (#10B981), soft off-white (#F8FAFC) and slate (#0F172A) for outlines, subtle flat shading only (no gradients, no glow, no photo textures), centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of badges. Subject: a small friendly flame with the number-free shape of three little sparks beneath.
```

### 7 days in a row (`streak-7`)

File: `public/badges/streak-7.png`

```text
Flat vector illustration, children's educational app badge, round medal, soft rounded shapes, thick clean outlines, limited palette: indigo (#4F46E5 and #3730A3), warm amber (#F59E0B), emerald green (#10B981), soft off-white (#F8FAFC) and slate (#0F172A) for outlines, subtle flat shading only (no gradients, no glow, no photo textures), centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of badges. Subject: a larger warm flame circled by seven small dots (a week).
```

### First recall (`first-review`)

File: `public/badges/first-review.png`

```text
Flat vector illustration, children's educational app badge, round medal, soft rounded shapes, thick clean outlines, limited palette: indigo (#4F46E5 and #3730A3), warm amber (#F59E0B), emerald green (#10B981), soft off-white (#F8FAFC) and slate (#0F172A) for outlines, subtle flat shading only (no gradients, no glow, no photo textures), centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of badges. Subject: a card flipping over with a small lightbulb.
```

### Memory keeper (`revision-streak`)

File: `public/badges/revision-streak.png`

```text
Flat vector illustration, children's educational app badge, round medal, soft rounded shapes, thick clean outlines, limited palette: indigo (#4F46E5 and #3730A3), warm amber (#F59E0B), emerald green (#10B981), soft off-white (#F8FAFC) and slate (#0F172A) for outlines, subtle flat shading only (no gradients, no glow, no photo textures), centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of badges. Subject: a brain-shaped cloud holding five small linked circles.
```

### Welcome back (`welcome-back`)

File: `public/badges/welcome-back.png`

```text
Flat vector illustration, children's educational app badge, round medal, soft rounded shapes, thick clean outlines, limited palette: indigo (#4F46E5 and #3730A3), warm amber (#F59E0B), emerald green (#10B981), soft off-white (#F8FAFC) and slate (#0F172A) for outlines, subtle flat shading only (no gradients, no glow, no photo textures), centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of badges. Subject: a sunrise over a door that is open, warm and inviting.
```

### First question (`first-question`)

File: `public/badges/first-question.png`

```text
Flat vector illustration, children's educational app badge, round medal, soft rounded shapes, thick clean outlines, limited palette: indigo (#4F46E5 and #3730A3), warm amber (#F59E0B), emerald green (#10B981), soft off-white (#F8FAFC) and slate (#0F172A) for outlines, subtle flat shading only (no gradients, no glow, no photo textures), centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of badges. Subject: a speech bubble with a gentle question-mark shape made of dots.
```

### Source checker (`source-checker`)

File: `public/badges/source-checker.png`

```text
Flat vector illustration, children's educational app badge, round medal, soft rounded shapes, thick clean outlines, limited palette: indigo (#4F46E5 and #3730A3), warm amber (#F59E0B), emerald green (#10B981), soft off-white (#F8FAFC) and slate (#0F172A) for outlines, subtle flat shading only (no gradients, no glow, no photo textures), centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of badges. Subject: a magnifying glass over a small book, with a check mark in the lens.
```

### Quest finisher (`quest-finisher`)

File: `public/badges/quest-finisher.png`

```text
Flat vector illustration, children's educational app badge, shield, soft rounded shapes, thick clean outlines, limited palette: indigo (#4F46E5 and #3730A3), warm amber (#F59E0B), emerald green (#10B981), soft off-white (#F8FAFC) and slate (#0F172A) for outlines, subtle flat shading only (no gradients, no glow, no photo textures), centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of badges. Subject: a flag planted on a small hill with a winding path.
```

### Quest trio (`quest-trio`)

File: `public/badges/quest-trio.png`

```text
Flat vector illustration, children's educational app badge, shield, soft rounded shapes, thick clean outlines, limited palette: indigo (#4F46E5 and #3730A3), warm amber (#F59E0B), emerald green (#10B981), soft off-white (#F8FAFC) and slate (#0F172A) for outlines, subtle flat shading only (no gradients, no glow, no photo textures), centred on a transparent background, 1:1 square, generous padding, NO text, NO letters, NO numbers inside the image, friendly and calm mood, consistent style across a collection of badges. Subject: three flags on three hills joined by one path.
```

## Checklist

- [ ] Generate all 16 images in Google Flow with the prompts above (same session or same style reference so the set matches).
- [ ] Export each as PNG with a transparent background, 512 x 512 px (use a background remover if Flow adds one).
- [ ] Check there is no text, number or letter in any image.
- [ ] Name each file exactly as listed (`<badge id>.png`) and place it in `public/badges/`.
- [ ] Open `/student/badges` at 1440, 834 and 390 widths and check each badge at small (48 px), medium (80 px) and large (128 px) sizes.
- [ ] Check the locked (greyed, 40% opacity) look is still readable.
- [ ] Add a short alt/credit note here if the tool's terms require attribution.
- [ ] If a file is missing or broken, the app silently shows the icon fallback, so a partial set is safe to ship.

## Adding a new badge

1. Add an entry to `BADGES` in `src/lib/rewards.ts` (id, titleKey, descriptionKey, criteria, category, rarity).
2. Add `rewards.badge.<id>.title` and `rewards.badge.<id>.desc` to en.json, si.json and ta.json.
3. Optionally add a fallback icon for the id in `src/components/ui/BadgeImage.tsx`.
4. Add a row and prompt to this file and drop `public/badges/<id>.png`.
