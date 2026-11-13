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
