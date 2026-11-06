# Code review (Agent J: Reviewer)

Reviewed `main` at `0cd9b6d` in E:\EduNova on 2026-11-06, plus the **uncommitted working tree** (see R-01). Nothing in `src` was edited; this file is the only change.

**No Figma comparison was made.** Figma `EU3cIhqiO4m9oYgCmOapLW` could not be read (rate-limited) and `docs/DESIGN_BRIEF.md` does not exist. Token values are placeholders, so this review makes no claims about visual fidelity or token values.

Method: I read every file in `src` and ran `npm run typecheck`, `npm run lint`, `npm run build` and `npm run i18n:check` (all pass: 0 lint warnings, 527 keys x 3 locales). I grepped for numbers and percentages, colour literals, raw elements, mock imports and storage use, and checked `git log --name-only` for each agent commit. I also spot-checked three behaviours in the built-in browser against http://localhost:5173 and reset the browser storage afterwards.

## Verdict: ship-with-fixes

As a **mock-data demo**, the committed `main` is in good shape. The build is clean. Readiness appears only as bands everywhere in `src`. There is no leaderboard. Wellbeing wording is gentle and labelled private in all three languages, and every tutor answer path renders a `SourceList`.

Do **not** release from this working copy as it stands:

1. **R-01 (blocker).** Untracked files in `public/` are copied into `dist/`. One of them is an engagement demo at `/engage/index.html` that shows a "Mastery" percentage, XP and levels. That breaks the readiness rule and bypasses i18n, tokens and the ui components.
2. **Major issues to fix before a pilot:**
   - R-02: a teacher can see wellbeing prompts for a class that is not theirs (confirmed in the browser).
   - R-04: sign-out fails silently when the service fails, which matters on shared school devices.
   - R-03: changing the language moves focus away from the switcher.
   - R-05: the app keeps the locale in three separate stores.
   - R-06: recharts is bundled into every page.

Going live also needs the backend work in "What must change when going live" below.

## Findings

Severity: blocker = must fix before any release; major = clear contract, safety-adjacent, a11y or robustness failure; minor = should fix; nit = polish.

| ID | Sev | Area | file:line | Description | Evidence | Owner | Suggested fix |
|---|---|---|---|---|---|---|---|
| R-01 | blocker | Educational safety / contract | `public/engage/index.html:225-226, 398-404, 348, 384-385`; `public/videos/*`, `public/images/*.jpg` (untracked); `dist/engage/index.html` | An unreviewed, untracked standalone demo sits in `public/`, so Vite copies it into `dist/` and serves it at `/engage/index.html`. It renders "Mastery: Fractions" as a ring labelled with a number (`$("ringLabel").textContent = pct + "%"`), plus "Level N" and "x / 100 XP". It is English-only, has hex colours in `<style>`, its own innerHTML/DOM code and a separate `localStorage` key, and adds about 11.7 MB of videos. `docs/animations-and-images.md` has an uncommitted change documenting it (and calls an asset a "Knowledge Decay Predictor"). | `git status`: `?? public/engage/`, `?? public/videos/`, 3 jpgs; `ls dist/engage dist/videos` shows they shipped in the last build; grep of line 403. | Lead | Remove it from `public/` (move it to a separate prototype folder outside the app) or rebuild it as a routed feature under the contract (bands, i18n, tokens). Rebuild `dist`. Don't commit the media without a size and licence decision. |
| R-02 | major | Wellbeing privacy | `src/features/teacher/pages/ClassPage.tsx:28-34, 64-67, 107, 137-153`; `src/mocks/mockServices.ts:175, 191` | The class page renders the roster **and the private wellbeing prompts** for any `:id`, even when the class is not one of the signed-in teacher's classes. `summary` is just `undefined` and the page carries on. `StudentPage` does check ownership; `ClassPage` does not. In the mock, `listStudents` has no access check, and `listClasses` gives an unknown teacher every class. | Browser: as `tch-002` (classIds `['class-9b']`), `/teacher/classes/class-8a` showed "Private check-in prompts … About Oshadi Amarasinghe … Consider offering a little extra support…". | G (page), B (mock authz) | If `classes.find(...)` is undefined, show not-found and render nothing else (or use `teacherService.getClass` with an ownership check). Mock: reject `listStudents` for classes not owned by the caller. Backend: RLS (see below). |
| R-03 | major | A11y focus | `src/app/Root.tsx:16-32` | The `RouteFocus` effect depends on `[pathname, t]`, and `t` changes identity whenever the language changes. Picking a language in the header therefore moves focus from the `<select>` to the `<h1>` and announces the page again, which is focus theft (A11Y.md:55). | Browser: focus on header select, change to `si`; after 600 ms `document.activeElement` = `H1`. | Lead | Focus and announce only on `pathname` change. Update `document.title` in a separate effect that may depend on `t`, or read `t` from a ref. |
| R-04 | major | Robustness / privacy | `src/app/HeaderSlot.tsx:27-30`; `src/store/useSessionStore.ts:29-32`; `src/mocks/mockServices.ts:66` | Sign-out awaits `authService.signOut()` and only clears the local session if that call succeeds. If it fails (offline, server error, `?fail=1`), the user stays signed in, there is no message, and the promise rejection is unhandled. On shared school devices this leaves a child's account open. | Browser with `edunova.mock.fail=1`: click Sign out → still on `/teacher/...`, persisted user still `tch-002`, `unhandledrejection: MockServiceError`. | Lead (HeaderSlot), B (store) | In `signOut`, clear the local state in `finally` (best-effort server call). Catch in `HeaderSlot` and always navigate to `/login`. |
| R-05 | major | State / i18n | `src/features/student/onboarding/OnboardingPage.tsx:37-38, 51, 98`; `src/app/HeaderSlot.tsx:10,19`; `src/i18n/index.ts:11, 66-68, 94-96, 114`; `src/store/useSessionStore.ts:10,26,33-36`; `src/store/useUiStore.ts:16,48` | The locale lives in three places: the i18n key `edunova.locale`, `useUiStore.locale` (`edunova.ui`) and `useSessionStore.locale` (`edunova.session`). The header switcher updates i18n and the UI store but not the session store. The onboarding wizard reads and saves `useSessionStore.locale`, so after a header change its language radio shows the old value and `saveProfile` stores the wrong locale. | Code path: `HeaderSlot` → `useLocale().setLocale` → `i18n.changeLanguage` → `bindLocaleStore` → `useUiStore.setLocale`. The session store is never touched. | B (stores), D (onboarding), C (i18n storage key) | Make `useUiStore` the only locale source. Drop `locale` from the session store and the i18n `localStorage` write. Onboarding should read `useLocale().locale`. |
| R-06 | major | Bundle size | `src/components/ui/index.ts:27`; `src/components/ui/Charts.tsx:2` | `Charts` (recharts) is re-exported from the ui barrel, so the shared `ui` chunk is **481 kB (143 kB gzip)** and every page loads it, including login. Only `TeacherOverviewPage`, `ClassPage` and admin `OverviewPage` use charts. The main `index` chunk is a further 450 kB, with all three locale JSON files loaded eagerly. | `npm run build`: `ui-CX1-oHba.js 481.31 kB`, `index-D1LKF9Uy.js 450.43 kB`. | A (barrel), Lead (vite config) | Export charts from `@/components/ui/charts` only (not the barrel), or lazy-load the chart component. Consider loading `si`/`ta` locales on demand. Add `build.chunkSizeWarningLimit` or `manualChunks` deliberately. |
| R-07 | minor | Contract / authz | `src/features/admin/auditData.ts:26-27`; `src/mocks/mockServices.ts:175` | The admin audit page gets class names by calling `teacherService.listClasses('')`, which only works because of a mock quirk ("unknown teacher: demo access to all"). It will break, or need a privileged path, once live. It also gives admin the per-class band counts. | Comment at line 26 states the reliance. | H, B | Add `adminService.listClasses()` (names only) or have the audit API return resolved target labels. Remove the "unknown teacher gets all" fallback from the mock. |
| R-08 | minor | Duplication | `src/features/student/dashboard/revisionDue.ts:3-15`; `src/features/student/revision/scheduling.ts:10-32`; `src/features/student/onboarding/destination.ts:4` vs `src/app/home.ts:3` | The "ready now" rule and `startOfDay` exist twice, held together only by a "keep in sync" comment. QA-07's fix asked for one helper in `src/lib`. The role-to-home map is also duplicated. The two revision rules are equivalent today (verified), but they can drift. | Both compare calendar days of `dueAt` with `<= today`. | D, F, B (lib) | Move `startOfDay`, `dayOffset` and `isReadyNow`/`splitQueue` into `src/lib/revision.ts` and use them from both pages. Import `homeFor` in `destination.ts`, or move it to `src/lib`. |
| R-09 | minor | A11y announcements | `src/app/Root.tsx:18-30`; `src/features/student/onboarding/usePageFocus.ts:7-14` (used by Dashboard, Diagnostic, Login, Onboarding); `src/features/student/quests/QuestsPage.tsx:35-41`; `src/features/student/revision/RevisionPage.tsx:52-58` | Focus-on-`h1` is implemented in three separate ways. On pages that use `usePageFocus`, the `h1` is announced twice (once on mount, once by `RouteFocus` after 150 ms), and the 150 ms timer can fire before a lazy page has rendered. | Code reading. | Lead, D, F | Keep only `RouteFocus`, triggered after the lazy route resolves (for example via `useNavigation().state === 'idle'`), and delete the per-page copies. |
| R-10 | minor | Tokens / README | `tailwind.config.ts:28`; `README.md` breakpoints row; `src/features/student/dashboard/DashboardPage.tsx:98,106,158`, `src/features/student/exams/ExamsPage.tsx:46`, `src/features/teacher/pages/ClassPage.tsx:163`, `src/features/teacher/pages/TeacherOverviewPage.tsx:27` | `screens` sits under `theme.extend`, so Tailwind's `xl` (1280) and `2xl` (1536) still exist. The README says "these replace Tailwind's defaults", which is false. Six classes use `xl:`, so their layouts change at 1280 px, not at the contract's 390/834/1440. | Built CSS contains `@media (width>=1280px)` between 834 and 1440. | A (config), Lead (README) | Move `screens` out of `extend` (a true replacement) and change `xl:` to `lg:`, or document `xl`. |
| R-11 | minor | Dead code | `src/store/useUiStore.ts:19,24-25,40-46`; `src/lib/a11y/index.ts:27-87,156-206`; `src/components/ui/Modal.tsx:26-62`; `src/services/teacher.ts:5-6`; `src/services/auth.ts:5`; `src/features/teacher/pages/StudentPage.tsx:22-31`; `src/features/student/revision/RevisionPage.tsx:18,26,66`; `src/i18n/locales/en.json:194-197,199,245-249`; `src/components/ui/Showcase.tsx` | Several pieces are unused or left over from earlier helpers: <ul><li>A second toast system (`pushToast`/`toasts`, never rendered).</li><li>`useFocusTrap`, `useRovingTabindex` and `useFocusReturn` are unused, while `Modal` re-implements a focus trap.</li><li>`getStudent`, `getClass` and `currentUser` are never called. `StudentPage` keeps a stale "No getStudent service exists" comment and still fetches every class roster (N+1).</li><li>`ItemRow.nextDays` is never passed, and `pending = ready` is an alias.</li><li>Unused locale keys (`teacher.wellbeing.prompt.*`, `teacher.wellbeing.none`, `a11y.landmark.*`).</li><li>`Showcase.tsx` is not routed and hard-codes English.</li></ul> | `grep` for each symbol: only defined, never used. | B, C, A, G, F | Delete them, or wire them in. In particular, use `teacherService.getStudent` in `StudentPage` and build `Modal` on `useFocusTrap`. |
| R-12 | minor | i18n | `src/features/student/dashboard/DashboardPage.tsx:111`; `src/features/student/onboarding/OnboardingPage.tsx:55,150`; `src/features/admin/auditData.ts:46`; `src/features/admin/CurriculumPage.tsx:90,111`; `src/features/student/revision/ReviewSession.tsx:77,89`; `src/features/student/revision/RevisionPage.tsx:24` | English `defaultValue` strings remain in the code although the keys now exist in all locales, against PROGRESS's claim that fallbacks were removed. The concept and subject fallbacks would show raw ids (`m8-eq`, `maths`) if a key went missing. | Keys present at `en.json:526-528`. | D, H, F | Drop the redundant `defaultValue`s. For data-driven keys, fall back to a translated "Unknown topic", not the id. |
| R-13 | minor | i18n concatenation | `src/features/student/onboarding/LoginPage.tsx:36`; `src/features/student/exams/ExamsPage.tsx:64`; `src/features/student/exams/ExamDetailPage.tsx:76,81`; `src/features/teacher/pages/ClassPage.tsx:193`; `src/features/student/revision/ReviewSession.tsx:55`; `src/features/student/quests/QuestsPage.tsx:58`; `src/features/student/path/PathPage.tsx:129,183,199` | Translated fragments are joined with `: `, ` · `, `, ` or `. `, which A11Y.md:67 forbids. Word order and punctuation can be wrong in si/ta. | Template literals at the cited lines. | D, E, F, G | Add interpolated keys, for example `student.exams.report.linkLabel: "Report: {{name}}"`. |
| R-14 | minor | A11y landmarks | `src/layouts/AppShell.tsx:34,45,70,88-97` | The sidebar and bottom nav share one `aria-label`. A11Y.md:79 asks for distinct labels, and `a11y.landmark.navigationMobile` exists but is unused. Impact is low because only one nav is displayed at a time. The "More" button gives no cue when the current page is one of the overflow items. | Code reading. | A | Use the mobile label key. Mark the More button (for example visually plus `aria-describedby`) when an overflow route is active. |
| R-15 | minor | A11y dialog | `src/components/ui/Modal.tsx:64-87` | The background is not made `inert`/`aria-hidden`, which A11Y.md:84 requires, so screen-reader virtual cursors can leave the dialog. The Tab trap only runs while focus is already inside the panel. | Code reading. | A | Set `inert` on `#root` while open (the portal goes to body), or use the shared `useFocusTrap`. |
| R-16 | minor | A11y forms | `src/components/ui/Radio.tsx:36-42`; `src/features/student/onboarding/OnboardingPage.tsx:66-68,115-127` | `RadioGroup` and checkbox group errors are `role="alert"` paragraphs that are not linked to the fieldset (no `aria-describedby`, no `aria-invalid`), and focus does not move to the invalid group on Next. | Code reading. | A (RadioGroup), D | Give the error an id, put `aria-describedby` on the fieldset, and focus the first input on error. |
| R-17 | minor | A11y focus | `src/features/student/diagnostic/DiagnosticPage.tsx:141-149, 107-140, 193` | Pressing Start, or Finish on the last question, unmounts the focused button, so focus falls to `<body>`. Only an announcement is made. | Code reading. | D | Focus the question legend or results heading after the state change (user-initiated). |
| R-18 | minor | A11y live regions | `src/features/student/tutor/TutorPage.tsx:80, 107-112, 39, 119` | The conversation is `role="log" aria-live="polite"` **and** the page also calls `announce(t('a11y.newMessage'))`, so screen readers hear every reply twice. Message headings are `h3` with no `h2` once the conversation starts (heading levels skip). | Code reading. | E | Keep one of the two (log or announce). Make message headings `h2`, or add a visually hidden `h2` for the conversation. |
| R-19 | minor | AI sources | `src/features/student/tutor/TutorPage.tsx:79`; `src/components/ui/SourceList.tsx:29-30` | An answer with an empty `sources` array is still shown, with the "no sources" state. That satisfies "never render without SourceList or an explicit no-sources state", but the contract says answers *show sources*. With a real LLM, unsourced answers would reach students. The mock always returns sources (`mockServices.ts:105-108`, fallback included). | Code reading. | E, B | Validate in the service layer: reject or flag answers without sources, and show a "could not find a source; ask your teacher" message instead of the answer. |
| R-20 | minor | Readiness representation | `src/features/student/dashboard/DashboardPage.tsx:164-168`; `src/components/ui/MasteryRing.tsx:24`; `src/types/index.ts:16-18,37-38` | No numbers are rendered (QA-06 fixed, verified), but the ring's arc length is still proportional to the continuous 0-1 level, which reads as a visual percentage. Students' API payloads (`Mastery.level`, `ExamReport.conceptBreakdown[].level`) also carry raw numbers that the UI never needs. | Code reading. | A, D, B | Draw the ring in 4 band segments, like `ReadinessBand`. Have the student-facing DTOs send bands only. |
| R-21 | minor | Wellbeing wording (si/ta) | `src/i18n/locales/si.json:192-193,471`; `src/i18n/locales/ta.json:193,471`; `src/app/routes.tsx:25` | English is fine. In Sinhala and Tamil, "not a diagnosis" is rendered as "රෝග විනිශ්චය" / "நோய்க் கண்டறிதல்" (literally "disease diagnosis"), which brings a medical word into teacher prompts. The si title "සුවදායක" may read as healing or therapeutic. The student "Diagnostic" nav item uses a Stethoscope icon, also a medical metaphor. No word implying anxiety, depression or disorder was found in any locale. | Strings at the cited lines; grep for anxi/depress/disorder/mental/risk found none. | C (native review), Lead (icon) | Native-speaker review: prefer plain "assessment/label" wording over "disease". Use a neutral icon (for example ClipboardCheck) for the diagnostic. |
| R-22 | minor | Security | `src/components/ui/SourceList.tsx:37-38` | `href` from data is rendered with no scheme check. Once the backend supplies source URLs, a `javascript:` URL becomes XSS. | Code reading (not used today: `TutorPage.tsx:20` passes no href). | A | Allow only `http:`/`https:` (or relative) URLs. Add `rel="noopener noreferrer"` for external links. |
| R-23 | minor | Mock auth leakage | `src/mocks/people.ts:70-76`; `src/store/useSessionStore.ts:38-41`; `src/mocks/mockServices.ts:15,42-57`; `src/app/guards.tsx:7-12`; `src/features/student/onboarding/LoginPage.tsx:22,81-87` | Any email plus a chosen role signs in. The password is collected and thrown away. The user, including role, name, email and `classIds`, is persisted in `localStorage` twice, and the guards trust it, so editing `edunova.session` grants the admin UI. Acceptable for a demo; see the go-live list. | Code reading; the R-02 browser test used exactly this. | Lead, B | See "What must change when going live". |
| R-24 | minor | Router | `src/app/guards.tsx:10` | `state.from` is set but never read, so deep links are lost after login. This is not an open redirect today. | `grep` for `state.from`: only the guard. | Lead, D | Read it in `LoginPage`/`destinationFor` and accept only same-app relative paths that start with `/` (not `//`) and match the user's role area. |
| R-25 | minor | Lint coverage | `eslint.config.js:19-22` | The hex rule only matches a string literal that is entirely hex. It misses `bg-[#fff]`, `rgb(...)` and template literals. A grep of `src` is clean today (verified), but the rule would not catch regressions. | Code reading. | Lead | Extend the selector to `TemplateElement`, add a regex for `\[#|rgba?\(|hsla?\(` inside class strings, or add a stylelint/grep CI step. |
| R-26 | minor | A11y chatter | `src/features/teacher/pages/ClassPage.tsx:60-62` | "N students shown" is announced on mount and on every search keystroke. | Code reading. | G | Debounce it (about 500 ms) and skip the first render. |
| R-27 | minor | Charts | `src/components/ui/Charts.tsx:43,57` | The default Recharts `<Tooltip/>` shows the raw dataKey (`count`) in English and cannot be reached by keyboard. The text summary is present, so this is not blocking. | Code reading. | A | Pass a translated `formatter`/`name`, or drop the tooltip since the figcaption gives the values. |
| R-28 | minor | Robustness | `src/features/student/diagnostic/DiagnosticPage.tsx:65-66`; `src/mocks/mockServices.ts:85-96` | `submitQuiz` then `getMastery` run inside one try. If the second call fails, Retry resubmits the quiz and nudges mastery twice. | Code reading. | D, B | Keep the saved attempt in state and retry only the read, or make submit idempotent by attempt id. |
| R-29 | minor | README accuracy | `README.md` (Known gaps, Swap section, breakpoints row) | <ul><li>The breakpoint claim is false (R-10).</li><li>"Only the signed-in user, language choice and onboarding profile are kept" leaves out `edunova.quests.celebrate`, `edunova.locale`, `edunova.mock.user` and the mock flags.</li><li>The swap section misses that `auditData.ts` depends on a mock quirk (R-07), that the session store persists the role client-side, and that `mockEn` has no usages (nothing to remove).</li><li>`public/engage` is not mentioned (R-01).</li></ul> | Code vs README text. | Lead | Update the README. |
| R-30 | nit | ui-only rule | `src/features/student/path/PathPage.tsx:151`; `src/features/teacher/pages/ClassPage.tsx:215`; `src/features/student/exams/ExamsPage.tsx:4`; `src/features/student/exams/ExamDetailPage.tsx:4`; `src/features/student/dashboard/DashboardPage.tsx:24-28`; `src/features/student/diagnostic/DiagnosticPage.tsx:132-135`; `src/features/teacher/pages/TeacherOverviewPage.tsx:10` | Two raw `<button>`s (step selector, sortable header) and imports of the internal `@/components/ui/cn` path. Each feature hand-rolls link-buttons with copied classes. | Grep for raw elements: only these 2. | A (provide `ButtonLink`, `SortHeader`), E, G, D | Add `ButtonLink`/`SortableTh` to the ui components and replace the copies. |
| R-31 | nit | Timers | `src/store/useUiStore.ts:43`; `src/components/ui/Toast.tsx:30`; `src/features/student/quests/QuestsPage.tsx:21`; `src/lib/a11y/index.ts:131` | `setTimeout`s are never cleared on unmount. Harmless with React 19, but untidy. | Code reading. | A, B, C, F | Track the ids and clear them in cleanup. |
| R-32 | nit | Folder ownership | commits `56e027b` (C edited `package.json`), `621511e` (A edited `docs/A11Y.md`) | Two small edits outside the owners' folders. Both are disclosed in PROGRESS/QA and are harmless. No feature agent edited another feature's folder. | `git log --name-only` per commit. | C, A | None needed; noted for the record. |
| R-33 | nit | Indic CSS | `src/styles/index.css:20-27` | `:lang(si) *` with `!important` also applies to `lang="en"` fragments inside si/ta pages and overrides every `leading-*`. | Code reading. | A | Scope it as `:lang(si):not(:lang(en))`, or set a per-size `lineHeight` instead of `!important`. |

## Verified OK

- **Scripts:** `npm run typecheck`, `npm run lint` (0 errors, 0 warnings; QA-19 fixed), `npm run build` and `npm run i18n:check` (527 keys x en/si/ta) all pass. Run today.
- **No numeric readiness in `src`:**
  - I grepped `%`, `percent`, `.level`, `score`, `mark`, `predict`, `rank`, `toFixed` and `Math.round` across `src` and the en strings.
  - The only visible `%` is `ProgressBar showValue` in `QuestCard.tsx:40` (mission completion, not readiness).
  - `MasteryRing` has no number and only one caller, inside an `aria-hidden` wrapper (`DashboardPage.tsx:165`). That wrapper is decorative with no focusable children, so `aria-hidden` is used correctly. QA-06 fixed.
  - The exam list and detail, diagnostic results, path detail, teacher table, student detail and charts render only `ReadinessBand` or band counts.
  - Mock reports carry `band` only at report level (`learning.ts:55-65`).
- **No leaderboard or ranking:**
  - No rank or leaderboard text anywhere, and the quests page states "There is no public ranking".
  - Teacher sort defaults to name ascending (`ClassPage.tsx:38-39`); band sort is opt-in and teacher-only.
  - `bandRank` is a band ordinal; the exam topic sort is per-student, weakest first.
  - The admin users list has no performance data.
- **Wellbeing exposure:**
  - `wellbeingPromptKey` is read only in `features/teacher` (grep).
  - No student or admin page imports `teacherService.listStudents`.
  - `ClassSummary` (used by admin) has no wellbeing field.
  - Routes guard `/teacher/*` by role (`routes.tsx:62-71`).
  - The prompts are labelled "Private to you" plus "not a diagnosis or a score" in en, si and ta (`WellbeingPrompt.tsx:30,42`), use `role="note"`, are dismissible, and are never a table column.
  - English wording is prompt-style ("Consider…"), with no diagnostic terms in any locale (exception: the si/ta wording in R-21). The cross-class leak is R-02.
- **Tutor sources:**
  - Every tutor bubble renders `SourceList` (`TutorPage.tsx:42`), with an explicit `ui.sources.none` state.
  - The error path shows `ErrorState` and no answer.
  - The mock fallback reply has a source, and `askTutor` forces sources (`mockServices.ts:105-108`).
  - Stale replies are dropped via `requestRef`. QA-17 fixed (title only).
- **Colours:** no hex, `rgb()`, `hsl()` or arbitrary colour classes in `src` outside `tailwind.config.ts` (grep). Inline `style` is used only for sizes. The `public/animations` SVGs still hard-code hex, a known gap (QA-20).
- **Mock boundary:** no feature imports `@/mocks`; only `src/services/index.ts` does (grep).
- **Hard-coded text:** a grep of JSX text and of literal `aria-label`/`placeholder`/`title`/`alt` values found no user-visible English outside `Showcase.tsx` (apart from the `defaultValue`s in R-12).
- **Type safety:** no `any`, `@ts-ignore` or `as any`. Three non-null assertions, all safe (`main.tsx:13`, `learning.ts:32`, `people.ts:74`). One justified `eslint-disable` (`useAsync.ts:40`). The `as TKey` casts are on data-driven keys.
- **`useAsync`:** results are keyed by deps plus reload tick, stale responses are ignored through the `cancelled` flag, errors are normalised to `Error`, and every page shows retry.
- **Storage:** every `localStorage`/`sessionStorage` access is wrapped in try/catch (`i18n/index.ts:26-33,66-70`, `mocks/config.ts`, `mockServices.ts`, `useCelebrationPref.ts`). zustand persist handles storage being unavailable.
- **Guards:** signed-out users go to `/login`, the wrong role goes to its own home, and `*` goes home. No redirect target comes from user input (`state.from` is unused, R-24), so there is no open redirect. No `dangerouslySetInnerHTML`, `eval` or `import.meta.env` secrets in `src`.
- **QA items re-checked in code, not taken from the agents' claims:**

  | QA item | What I checked |
  |---|---|
  | QA-01 | "More" menu present |
  | QA-02 | `:lang` line-height rule present |
  | QA-05 | Opaque focus ring (`tailwind.config.ts:24`) |
  | QA-07 | Rules equivalent (R-08 is about duplication only) |
  | QA-08 | Eager loading, intrinsic size, translated alt |
  | QA-09 | Whole-row label |
  | QA-10 | `min-h-11` |
  | QA-11 | Title and announce (but see R-03) |
  | QA-12 | Focus moves to email |
  | QA-14 | Admin empty states |
  | QA-16 | Class names resolved |
  | QA-18 | CTA hidden when nothing is due |
  | QA-21 | `localeChosen` |
  | QA-22 | Sticky flags |

- **Folder ownership:** every feature commit touches only its own folder plus `docs/PROGRESS.md`/`REQUESTS.md`; exceptions in R-32.
- **README:**
  - The route map matches `src/app/routes.tsx` and the feature route files.
  - Token names and values match `tailwind.config.ts`, including the focus shadow.
  - The scripts table matches `package.json`.
  - The demo logins exist (`people.ts:30,36,51`).
  - The mock toggles behave as described (`mocks/config.ts`).
  - Inaccuracies are listed in R-10 and R-29.

## What must change when going live

1. Replace the four service instances in `src/services/index.ts` and delete `src/mocks`, `mockControls` and `mockEn`. Fix `auditData.ts:27` first (R-07).
2. Authentication:
   - Use real auth (for example Supabase Auth); the password must actually be checked.
   - Stop persisting `role` and the full `User` (name, email, `classIds`) in `localStorage`. Keep a session token in httpOnly cookies or the SDK's storage, and fetch the profile from the server.
   - The guards stay a UX convenience only.
3. Enforce authorisation server-side (RLS or Express middleware):
   - Students read only their own data.
   - Teachers read only their classes' rosters and wellbeing prompts (R-02).
   - Admins get no per-child wellbeing and no per-class readiness unless that is intended.
4. Student-facing APIs return bands, not numeric `level` (R-20).
5. The tutor API must return non-empty `sources`; the client rejects or flags any answer without them (R-19).
6. Sign-out must clear local state even when the server call fails (R-04).
7. Validate any source or redirect URL (R-22, R-24).
8. Keep the LLM and Supabase service keys on the server; only the `VITE_` anon URL and key go in the client.
9. Do not ship `public/engage` or the media without review (R-01).

## Not verified

- Anything to do with Figma or visual fidelity (no design source exists).
- Native-speaker review of the si/ta wording beyond the R-21 flags.
- A screen reader pass, 200% zoom, measured text contrast and real `prefers-reduced-motion` runs. Accessibility was reviewed by reading the code, plus three browser spot-checks (R-02, R-03, R-04).
- Behaviour at the 390/834/1440 widths (not re-run; relied on QA.md for layout).
- Whether the untracked `public/` media is licensed for distribution.
