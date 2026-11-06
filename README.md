# EduNova Sahayaka

A responsive learning platform for Sri Lankan students, teachers and administrators.
React 19 + TypeScript + Tailwind 3 + React Router + Zustand + i18next (English, Sinhala, Tamil) + Recharts.
All data is currently **mock data behind service interfaces**; see "Swapping mocks for Express + Supabase".

> **Status.** The Figma file (`EU3cIhqiO4m9oYgCmOapLW`) could not be read during the build (rate-limited) and
> `docs/DESIGN_BRIEF.md` does not exist, so **no screen has been compared with the design** and the colour
> tokens below are placeholders. Sinhala and Tamil text has had **no native-speaker review**.
> See "Known gaps".

## Setup

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and production build |
| `npm run typecheck` | Type-check only |
| `npm run lint` | ESLint (includes a rule rejecting bare hex-colour string literals) |
| `npm run i18n:check` | Verifies en/si/ta have identical keys and no empty values |
| `npm run format` | Prettier |

**Demo logins** (mock, no password is checked): `student@edunova.lk`, `teacher@edunova.lk`, `admin@edunova.lk`.
Choose the matching role on `/login`.

**Mock toggles** (add to the URL; they persist for the browser session):
`?fail=1` makes every service call fail (to see error states), `?empty=1` returns empty lists.
`?fail=0` / `?empty=0` clear them.

## Route map

Routes are assembled in `src/app/routes.tsx`. Each feature exports its own `RouteObject[]`.
Signed-out visitors are redirected to `/login`; a user visiting another role's area is sent to their own home.

| Layout | Route | Page | Folder |
|---|---|---|---|
| `AuthLayout` | `/login`, `/onboarding` | Sign in, first-run setup | `features/student/onboarding` |
| `StudentLayout` | `/student` | Dashboard | `features/student/dashboard` |
| | `/student/diagnostic` | Diagnostic | `features/student/diagnostic` |
| | `/student/path` | Learning path | `features/student/path` |
| | `/student/tutor` | AI tutor (answers always show sources) | `features/student/tutor` |
| | `/student/exams`, `/student/exams/:id` | Exam reports (readiness bands) | `features/student/exams` |
| | `/student/quests` | Quests and missions | `features/student/quests` |
| | `/student/revision` | Spaced revision | `features/student/revision` |
| `TeacherLayout` | `/teacher` | Class overview | `features/teacher` |
| | `/teacher/classes/:id` | Class student table | `features/teacher` |
| | `/teacher/students/:id` | Student detail | `features/teacher` |
| `AdminLayout` | `/admin` | Overview | `features/admin` |
| | `/admin/users`, `/admin/curriculum`, `/admin/audit` | Users, curriculum, audit log | `features/admin` |

Layouts show a sidebar at 834px and wider and a bottom navigation (with a "More" menu) below that.

## Design tokens

Defined **only** in `tailwind.config.ts`; use the classes (`bg-brand-600`, `text-ink-soft`, `rounded-lg`, `shadow-card`).
No hex/rgb values anywhere else. Values below are **placeholders pending Figma**; names are the contract.

| Group | Tokens (value) |
|---|---|
| `brand` | 50 `#EEF2FF`, 100 `#E0E7FF`, 500 `#4F46E5`, 600 `#4338CA`, 700 `#3730A3` |
| `accent` | 500 `#F59E0B`, 600 `#D97706` |
| `success` | 50 `#ECFDF5`, 500 `#10B981`, 700 `#047857` |
| `warning` | 50 `#FFFBEB`, 500 `#F59E0B`, 700 `#B45309` |
| `danger` | 50 `#FEF2F2`, 500 `#EF4444`, 700 `#B91C1C` |
| `surface` | DEFAULT `#FFFFFF`, muted `#F8FAFC`, sunken `#F1F5F9` |
| `ink` | DEFAULT `#0F172A`, soft `#475569`, faint `#94A3B8` |
| `line` | DEFAULT `#E2E8F0`, strong `#CBD5E1` |
| radius | sm 6px, md 10px, lg 16px, xl 24px |
| shadow | `card`, `raised`, `focus` (2px white gap + 2px `brand-600` ring) |
| font | Inter, Noto Sans Sinhala, Noto Sans Tamil, system-ui (loaded from Google Fonts in `index.html`) |
| breakpoints | `sm` 390px, `md` 834px, `lg` 1440px (these replace Tailwind's defaults) |

## Project layout and ownership

```
src/types            shared domain types (User, Concept, Mastery, ExamReport, ...)
src/services         service INTERFACES + the single wiring file (index.ts)
src/mocks            mock implementations and data (delete when going live)
src/store            Zustand: session, UI (locale, toasts)
src/lib              mastery->band mapping, date formatting, useAsync, a11y helpers
src/components/ui    design-system components (the only components features may use)
src/layouts          Auth/Student/Teacher/Admin layouts and shell
src/i18n             i18next setup and locales (en, si, ta)
src/features/*       one folder per feature area, each exporting its routes
src/app              router, guards, header, route focus/titles
docs/                CONTRACT, A11Y, PROGRESS, REQUESTS, QA
```

Conventions: i18n keys are `feature.section.key`; no user-visible text hard-coded in components;
components come from `src/components/ui`; data only through `@/services`.
See `docs/CONTRACT.md` and `docs/A11Y.md`.

## Educational safety rules (enforced in the UI)

- Readiness is shown as a **band** (building / developing / secure / strong), never a predicted mark or score.
- No public leaderboards or ranking of students; teacher tables default to name order.
- Wellbeing signals are visible only to the teacher, labelled private, and worded as gentle prompts, not diagnoses.
- Every AI tutor answer shows its sources.

## Swapping mocks for Express + Supabase

Features import services from one file. Going live means changing `src/services/index.ts`:

```ts
// before
export const studentService: StudentService = mockStudentService;
// after
import { httpStudentService } from '@/api/studentService'; // you write this
export const studentService: StudentService = httpStudentService;
```

Do the same for `authService`, `teacherService`, `adminService`, then delete `src/mocks`, and remove the two
mock-only exports at the bottom of `src/services/index.ts` (`mockControls`, `mockEn`) and their usages.
Interfaces in `src/services/*.ts` are the contract; the implementations must return the types in `src/types`.

Suggested mapping (adjust to your schema):

| Service method | Express route (example) | Supabase side |
|---|---|---|
| `authService.signIn/signOut/currentUser` | use Supabase Auth directly in the client wrapper (or `/auth/*`) | `auth.users` + a `profiles` table (role, locale, grade) |
| `studentService.getMastery`, `listConcepts` | `GET /students/:id/mastery`, `GET /concepts` | `concepts`, `mastery` tables |
| `getDiagnosticQuestions`, `submitQuiz` | `GET /students/:id/diagnostic`, `POST /quiz-attempts` | `questions`, `quiz_attempts`; mark answers on the server |
| `getLearningPath`, `getRevisionQueue`, `recordReview` | `GET /students/:id/path`, `.../revision`, `POST .../revision/:itemId/review` | `path_steps`, `revision_items` |
| `askTutor` | `POST /tutor/messages` | LLM call server-side; **must return non-empty `sources`** |
| `listExamReports` | `GET /students/:id/exam-reports` | store bands only, never a predicted mark |
| `listQuests`, `completeMission` | `GET /students/:id/quests`, `POST /missions/:id/complete` | `quests`, `missions` |
| `getProfile`, `saveProfile` | `GET/PUT /students/:id/profile` | `profiles` |
| `teacherService.*` | `GET /teachers/:id/classes`, `/classes/:id/students`, `/students/:id` | `classes`, `enrolments` |
| `adminService.*` | `/admin/users`, `/admin/curriculum`, `/admin/audit` | `curriculum_docs`, `audit_events` |

Things the front end cannot enforce, so the backend must:

1. **Authorisation.** Use Supabase Row Level Security (or Express middleware) so students read only their own data,
   teachers only their classes, admins no per-child wellbeing data. The route guards in `src/app/guards.tsx` are a UX
   convenience, not security.
2. **Wellbeing prompts** must be teacher-only at the data layer.
3. **Errors.** Services should reject with an `Error`; pages already show error states with retry via `useAsync`.
4. **Audit events** should be written server-side; the audit page maps dotted `action` codes (e.g. `curriculum.publish`) to labels.
5. Keep secrets (Supabase service key, LLM key) on the Express server, never in the Vite bundle.
   Only the Supabase URL and anon key belong in `VITE_*` variables.

## Known gaps

- **Not compared with Figma**; colour tokens are placeholders. Fixing this means updating `tailwind.config.ts` (names stay).
- **Sinhala/Tamil text unreviewed** by native speakers (wellbeing prompts and readiness-band labels matter most).
- Not tested: screen reader, 200% zoom, text contrast measured with a tool, Sinhala at 834/1440px.
- The animation SVGs in `public/` hard-code hex colours (outside the token system).
- Mock data lives in memory and resets on reload (quest progress, revision results, curriculum status changes). Only the signed-in user, language choice and onboarding profile are kept in the browser.
- QA findings and their status: `docs/QA.md`. Per-agent notes: `docs/PROGRESS.md`.
