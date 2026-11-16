# EduNova Sahayaka: Animations and Images

Animated SVG assets for student-facing interactions. Each file is self-contained (CSS animations inside the SVG), needs no JavaScript, and respects `prefers-reduced-motion`.

## Assets

| File | Proposal feature | What it shows |
| --- | --- | --- |
| `public/images/hero-learning-companion.svg` | Overall platform | Hero illustration: student, AI companion, subject tiles, Learning Twin progress bar |
| `public/animations/learning-twin.svg` | Learning Twin (Sec. 3) | Concept nodes with mastery rings updating as evidence arrives |
| `public/animations/learning-path.svg` | Adaptive Learning Path (Sec. 5) | Path steps lighting up, with a "Your next step" marker |
| `public/animations/quest-map.svg` | AI Learning Quest (Sec. 13) | Learner moving along a quest trail toward a goal flag |
| `public/animations/mastery-celebration.svg` | Mastery feedback (Sec. 13) | Badge pop and confetti when a concept is mastered |
| `public/animations/revision-decay.svg` | Knowledge Decay Predictor (Sec. 14) | Forgetting curve vs. spaced-retrieval rebound |

## Interactive engagement demo

`public/engage/index.html` is a single-page, no-build demo of animations that react to what a student does. Open it directly in a browser or via `npm run dev` at `/engage/index.html`.

| Element | Behaviour |
| --- | --- |
| Companion | Hops on a correct answer, wobbles and offers a hint ("look at it another way") on a wrong one, cheers when tapped |
| XP bar and level | Fills smoothly, with a toast and confetti on level-up |
| Streak flame | Lights at 1, flickers at 3 correct in a row, resets on a mistake without penalty text |
| Mastery ring | Grows with correct answers; colour shifts as it fills |
| Quest map | One step per 3 correct answers; the avatar walks to the next mission |
| Badge toast | Appears on mastery, level-up and quest steps |

Progress is saved in `localStorage` (the demo still works if storage is blocked). "Reset demo" clears it. Animations are off under reduced-motion settings, and the quiz is keyboard-usable.

### Need a boost? and Learning games

- **Need a boost?** A student picks their energy (low, okay, ready). The platform shrinks the next step to fit (a 20-second "tiny start" for low energy) and awards a small starter bonus for beginning. After 25 seconds without interaction the companion offers help gently. There are no "lazy" labels or shaming; this follows the proposal's rule to avoid stigmatizing labels.
- **Learning games:** four games, all awarding XP and using the same celebration animations:
  - *Memory Match*: pair fractions with decimals.
  - *Order Up*: sort fractions smallest to largest.
  - *Pizza Slicer*: tap slices to shade a target fraction (for example 3/8) of a pizza.
  - *Number Line Hop*: hop a frog to a fraction on a 0 to 1 number line.
- "Reduce effects and animations" lets a student turn the gamified motion off, as the proposal requires.

## Google Flow assets (AI-generated)

Made in Google Flow (Nano Banana 2.1 for images, Omni 1.1 Flash for video) and downloaded at original size:

| File | What it shows | Used in |
| --- | --- | --- |
| `public/videos/student-learning-story.mp4` | 8-second, 720p video of a student solving fractions on a tablet | Welcome video at the top of the demo |
| `public/videos/boost-mission.mp4` | 8-second video: a tired student gets a small mission from the AI companion, then sits up and writes | "Need a boost?" section |
| `public/videos/learning-arcade-intro.mp4` | 8-second 3D "Learning Arcade" world with a cheering AI companion | "Learning games" section |
| `public/images/boost-mission-card.jpg` | Student at a desk, AI companion offering a small mission card | Poster for the boost video and top welcome video |
| `public/images/learning-games-banner.jpg` | "Learning Arcade" banner with fraction pizzas and trophy | Poster for the games video |
| `public/images/student-ai-celebrating.jpg` | Student and AI companion celebrating a level up | Quest section |

Images are 1376x768. The Flow project is in your Google Flow account ("Sunlit Student Math AI Le..."), which also holds three alternate image variants. AI output can contain odd details, so check faces, uniforms and any on-image text before publishing. The video has generated audio only if Flow added it, and the demo plays it muted.

## Usage

Reference them as plain images:

```tsx
<img src="/animations/learning-path.svg" alt="Your learning path: decimal conversion is next" />
```

To embed inline and control the SVG from the app (for example, to trigger the celebration only when a mission completes), use `<object>` or inline the SVG markup in a component.

## Accessibility and motion

- Every SVG has `role="img"` and an `aria-label`. Use a more specific `alt` in context where the meaning is different.
- All animations are disabled under `prefers-reduced-motion: reduce`, and the final state is shown.
- Feedback that matters (mastery, next step) should also appear as text in the UI. The animation is not the only signal.

## Design principles (from the proposal)

- Rewards focus on learning progress, not speed or public ranking. Students can pause or disable gamified elements, so provide a toggle when these components are built.
- The Learning Twin visuals show confidence and change over time. They do not label a student's ability.

## Not yet done

- These are hand-authored SVG and CSS. Google Flow generates AI video, and it needs a Google sign-in to use, so it was not used here. If you want video clips or richer illustrations, export prompts from this doc and generate them there, then place the outputs in `public/animations/`.
- Lottie versions (JSON) can be added later with the `lottie-animations` skill if you want timeline control in React.
