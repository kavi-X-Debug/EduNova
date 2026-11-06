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
