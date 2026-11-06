# QA report (Agent I: responsive and integration)

Tested against `main` in E:\EduNova, dev server http://localhost:5173, built-in browser pane, 2026-11-06. Nothing was fixed or committed; this file is the only edit.

**Figma comparison: NOT DONE.** Figma MCP was rate-limited and `docs/DESIGN_BRIEF.md` does not exist, so there is nothing to compare against. No visual-fidelity claims are made here, only measurements.

Method: for every route at 1440x900, 834x1112 and 390x844 a script measured `scrollWidth` vs `clientWidth`, raw i18n keys in text/aria-label/title/alt/placeholder, visible interactive targets under 44px, nav landmarks, `h1` count and focus, clipped text and Indic line-height. Student, teacher and admin were signed in through `/login` (some role switches were done by writing the mock session to localStorage). Sinhala and Tamil were run at 390 on every route, plus Tamil at 834 on student routes and Sinhala on onboarding at 834. `?fail=1` and `?empty=1` were run at 1440 on every route that fetches data.

## 1. Pass/fail summary per matrix row

Legend: OVF = horizontal overflow at 834 and 390 (English); KEYS = raw i18n keys; TGT = targets under 44px at 390; NAV = nav check; ST = loading/empty/error + retry; SI/TA = Sinhala/Tamil check at 390. "ok" = pass.

| Row | OVF | KEYS | TGT@390 | NAV | ST (fail/empty) | SI / TA | Verdict |
|---|---|---|---|---|---|---|---|
| /login | ok | ok | ok | n/a | validation present, focus not moved (QA-12) | ok / ok | PASS with minor |
| /onboarding | ok | ok | FAIL 20x20 inputs (QA-09) | n/a | n/a | ok / not run | FAIL (target size) |
| /student | ok | ok | ok | FAIL mobile nav (QA-01) | ok / ok | FAIL line-height (QA-02) / FAIL overflow 401>390 (QA-03) | FAIL |
| /student/diagnostic | ok | ok | ok | FAIL not in mobile nav (QA-01) | ok / ok | line-height (QA-02) / ok | FAIL (nav only) |
| /student/path | ok | ok | ok | ok | ok / ok | line-height / ok | PASS with QA-02 |
| /student/tutor | ok | ok | ok | ok | send-time error not exercised / ok | line-height / ok | PASS with QA-02 |
| /student/exams | ok | ok | ok | FAIL not in mobile nav (QA-01) | ok / ok | line-height / ok | FAIL (nav only) |
| /student/exams/:id | ok | ok | ok | FAIL (QA-01) | ok / ok (not-found text) | line-height / FAIL overflow 434>390 (QA-04) | FAIL |
| /student/quests | ok | ok | ok | ok | ok / ok | line-height / ok | PASS with QA-02 |
| /student/revision | ok | ok | ok | ok | ok / ok | line-height / ok | PASS with QA-02 |
| /teacher | ok | ok | ok | ok (single item, by design) | ok / ok | ok / ok (line-height QA-02) | PASS |
| /teacher/classes/:id | ok | ok | FAIL 11 links 24px tall (QA-10), also at 834/1440 | ok | ok / ok | ok / ok (line-height QA-02) | FAIL (minor) |
| /teacher/students/:id | ok | ok | ok | ok | ok / ok | ok / ok (line-height QA-02) | PASS |
| /admin | ok | ok | ok | ok (4 of 4) | ok / no empty state (QA-14) | ok / ok | PASS with minor |
| /admin/users | ok | ok | ok | ok | ok / ok | ok / ok | PASS |
| /admin/curriculum | ok | ok | ok | ok | ok / ok; modal Esc and focus return ok | ok / ok | PASS |
| /admin/audit | ok | ok | ok | ok | ok / ok | ok / ok | PASS |

Role guards (item 9): signed-out `/student` goes to `/login` PASS; teacher visiting `/admin` goes to `/teacher` PASS; student visiting `/admin` goes to `/student` PASS; admin visiting `/student` goes to `/admin` PASS.

Console (item 3): no errors or warnings on any route I observed. Only `[vite]` debug, React DevTools info, and the dev-only "Could not Fast Refresh ("router" export is incompatible)" debug message, which comes from lint warning QA-19. Caveat: the console buffer only covered the first student sweep and the final page, not every later teacher/admin page.

Keyboard (item 6): skip link is the first focusable element and works (focus moves to `main#main-content`), `h1` receives focus after every client-side route change (checked on admin and on login to onboarding to dashboard), modal (admin publish confirm) has `role=dialog`, `aria-modal`, labelled, focus inside, Esc closes, focus returns to the originating `select`. Failures: focus ring contrast (QA-05), static document title (QA-11).

Loading states (item 7): skeletons and `aria-busy` confirmed on admin/users (5 skeleton blocks, `role=status`). Other routes use `LoadingState`/`Skeleton` in source but I only observed admin at runtime.

## 2. Educational safety audit

| Rule | Result | Evidence |
|---|---|---|
| Readiness is a band, never a predicted mark | PASS for exam, diagnostic, path, teacher. FLAG on dashboard | /student/exams/exam-term1 shows "Building ... This is a band, not a mark", per-topic bands only, no digits or `%` in text. Diagnostic result lists "Developing"/"Building" per concept with "It is not a mark or a prediction". **FLAG: /student dashboard "Mastery by subject" shows 39%, 32%, 47%, 37%, 40% rings.** Source: `src/components/ui/MasteryRing.tsx` line 24 (visible `{Math.round(v * 100)}%`) and line 19 (`aria-label="Mathematics: 39%"`), used at `src/features/student/dashboard/DashboardPage.tsx:161` as `<MasteryRing value={s.level} />`. It is concept mastery, not an exam prediction, but it is a numeric percentage next to a band label and reads as a score (QA-06). |
| No public leaderboard or ranking of students | PASS | No "rank/leaderboard/position" text on quests, dashboard, teacher or admin pages. Quests page says "There is no public ranking". Teacher class table default sort is Name ascending (`aria-sort="ascending"` on Name). `bandRank` in code is a band ordinal helper, not a student rank. Note: teacher can opt in to sort by Readiness (weakest first); teacher-only, bands only, acceptable. Quests show personal XP only ("Revision team goal" is a shared goal, no ordering). |
| Wellbeing prompts only in teacher views, labelled private, prompts not diagnoses | PASS | Appears only on /teacher/classes/:id and /teacher/students/:id under "Private check-in prompts", "Only you can see these", each "(Private to you)", "A gentle prompt for a conversation. It is not a diagnosis or a score.", dismissible. Not present in any student page text and not present in admin overview, users, curriculum or audit text. Not a table column or label. Note: the class page lists a prompt for every flagged student above the table (about 11 banners for class 8A); consider collapsing, but wording is gentle. |
| Every AI tutor answer shows sources | PASS | Two answers tested (a suggested fractions question and an off-topic "capital of Mars" question): both rendered a "Sources" list. Minor: source labels show raw ids such as `curriculum:g6-maths-u3`, `lib:frac-add-01` (QA-17). |

## 3. Findings

Severity: blocker = cannot use/ship; major = clear failure of contract or accessibility; minor = polish.
No blockers were found.

| ID | Sev | Route | Width | Description | Evidence | Owner | Suggested fix |
|---|---|---|---|---|---|---|---|
| QA-01 | major | /student/exams, /student/exams/:id, /student/diagnostic | 390 | Mobile bottom nav shows only 5 of 7 student routes, so Exams and Diagnostic cannot be reached from the nav below 834. Exams is only reachable via the dashboard "See the report" card; Diagnostic only from the empty state. | Bottom `nav` has 5 links: `/student, /path, /tutor, /quests, /revision`; sidebar at >=834 has 7. | A (layout cap) and Lead (`studentNav` in `src/app/routes.tsx`) | Add a "More" item/sheet, or slice differently and render all routes; keep `aria-current`. |
| QA-02 | major | all pages | 1440/834/390, si and ta | No `:lang(si), :lang(ta)` line-height rule exists (grep of `src/styles` and tailwind config finds none; REQUESTS Lead to A was not done). Tailwind `leading-*` and text-sm/xs classes give Indic text 1.20 to 1.43. | Sinhala dashboard at 390: 42 text nodes under 1.5: nav links 14px at 1.43, h1 30px at 1.20, buttons 14px at 1.43, captions 12px at 1.33, `OPTION` 1.20. Class page (teacher, si/ta) 173 to 198 nodes; admin users 333. Body font stack does include Noto Sans Sinhala/Tamil. | A (styles) with C | Add base rule `:lang(si), :lang(ta) { line-height: 1.6 }` and make Tailwind text-size utilities not override it (or set `lineHeight` per size under a `si:`/`ta:` variant); also no uppercase/letter-spacing on si/ta. |
| QA-03 | major | /student | 390 (ta) | Tamil dashboard overflows horizontally. | `scrollWidth 401 > 390`. Culprit: Science mastery card in the 2-column mastery grid; the unbreakable Tamil band label "அடித்தளம் அமைக்கிறது" (SPAN, W105, R401) pushes `P`, `SPAN` and the fixed bottom nav (r=401). | D | Make the mastery grid one column at 390, add `min-w-0` and `break-words` to the card text; allow the band label to wrap. |
| QA-04 | major | /student/exams/:id | 390 (ta) | Tamil exam report overflows horizontally. | `scrollWidth 434 > 390`; the by-topic `TABLE` (382px wide) plus `FIGCAPTION`/`LI` (R417) exceed the 390 viewport; "தயார்நிலை" column TH is 204px. | E | Wrap the table in a scroll container with `tabIndex=0` and an accessible label, or use a card list at 390; add `min-w-0`/`break-words` on list items. |
| QA-05 | major | all | all | Keyboard focus ring fails 3:1 non-text contrast. `:focus-visible` uses `shadow-focus` = `0 0 0 3px rgba(79,70,229,0.35)` with outline transparent; blended on white this is about 1.8:1. | Computed after real Tab presses: `box-shadow: rgba(79, 70, 229, 0.35) 0 0 0 3px`, `outline: rgba(0,0,0,0) solid 1.6px`. Blend (193,190,246) vs white = about 1.8:1 (estimate by hand, not tool-measured). | A | Use an opaque brand ring (for example 2px solid `brand-600` or 3px at full opacity plus an offset), still removed only with replacement; keep the transparent outline for forced-colors. |
| QA-06 | major (safety) | /student | all | Numeric percentage on dashboard mastery rings. See safety table. | `MasteryRing.tsx:19` and `:24`; `DashboardPage.tsx:161`; rendered "39%/32%/47%/37%/40%". | D (and A for the component) | Pass `children` (the band label or an icon) to `MasteryRing` and drop `%` from the visible text and `aria-label`; keep the ring as decoration and the band as the message. |
| QA-07 | major | /student vs /student/revision | all | Inconsistent revision counts. Dashboard says "1 topic to revisit"; the Revision page says "5 topics to revisit" ("Ready today" x4 plus "Ready since yesterday" x1). | Dashboard counts `dueAt <= now`; Revision groups by due day. | D and F | Share one selector for "ready now/today" (put it in `src/lib`); both pages should use it. |
| QA-08 | major | /student | all | "Your next step" illustration looks blank. Findings: (a) `AnimatedIllustration` renders `<img loading="lazy">` of `/animations/learning-path.svg`; the SVG file loads fine (HTTP 200, `image/svg+xml`, 2552 bytes) but has only a `viewBox`, no width/height, so before load the `img` is 0px tall (measured `complete:false, naturalWidth:0, height:0` at 1.5s) and it can stay empty when lazy loading is deferred; (b) once loaded it renders 192x60 at >=834 (`md:w-48`), natural size 300x94, so the 13px labels scale to about 4px and are unreadable; (c) the artwork is a pale `#f8fafc` rect with pale `#e2e8f0` track on a white card, so contrast against the card is very low; (d) used with `alt=""` although it is informative. | DashboardPage.tsx lines 106 to 110; screenshot at 1440 shows a faint strip with micro text. | D (usage) and A (component) | Give the img explicit `width/height` or `aspect-ratio` (640x200), `loading="eager"` for above-the-fold, larger size (for example `md:w-64` or full width on mobile), crop the SVG to the step nodes, and use a visible card tint; add meaningful `alt` or a text equivalent. |
| QA-09 | major | /onboarding | 1440/834/390 | Radios and checkboxes have tiny hit areas. The row is 44px tall but only the 20x20 input and the 48x20 label text are clickable. | Language, grade and subject steps: 3, 6 and 5 inputs each 20x20; wrapper DIV 309x44 is not the label. | D | Make the whole row the `<label>` (or stretch `label` with `min-h-11 w-full`, `flex items-center`) so the row is the target. |
| QA-10 | minor | /teacher/classes/:id | 1440/834/390 | "About <student>" links in the private-prompt banners are 24px tall. | 11 links, e.g. 212x24, 182x24. | G | Add `min-h-11 inline-flex items-center` or make the whole prompt card the link. |
| QA-11 | minor | all | all | `document.title` is always "EduNova Sahayaka"; route changes are not announced (live regions exist but stayed empty). WCAG 2.4.2. | `/admin/users`, `/admin/curriculum`, `/admin` all give the same title after navigation. | Lead (`RouteFocus`) with C | Set `document.title = "<h1> - EduNova Sahayaka"` and call `announce()` with the title on route change. |
| QA-12 | minor | /login | all | Empty submit shows "This field is required" and sets `aria-invalid`, but focus stays on the Sign in button instead of moving to the invalid field. | After empty submit, `activeElement` = BUTTON submit. | D | Focus the first invalid field on submit. |
| QA-13 | minor | all | all | Skip link target is `main#main-content` (A11Y.md says `main#main`), and activating it appends `#main-content` to the URL. `RouteFocus` also draws a visible ring box around the `h1` after keyboard navigation. | URL becomes `/admin/audit#main-content`. | A / Lead / C | Align the doc; suppress the `h1` ring (`focus:outline-none` on `tabindex=-1` heading); optional. |
| QA-14 | minor | /admin | all | No empty state with `?empty=1`: zeros, an empty 0 to 4 axis chart and a blank "Recent activity" heading. | Text: "0 students, 0 teachers ... Recent activity View full audit log". | H | Add an empty message for recent activity and hide the chart when all counts are zero. |
| QA-15 | minor | /admin | all | Plural error: "1 administrators". | "75 students, 3 teachers and 1 administrators." | H and C | Use `_one`/`_other` plural keys. |
| QA-16 | minor | /admin, /admin/audit | all | Audit targets show raw ids for classes: `class-9b`, `class-10c`. | Audit rows "Exported a class report / class-9b". | H | Resolve class ids to names (as already done for users and curriculum). |
| QA-17 | minor | /student/tutor | all | Source entries show raw ids (`curriculum:g6-maths-u3`, `lib:frac-add-01`) after the title. | Tutor answer Sources list. | E | Show title only, or a friendly type label. |
| QA-18 | minor | /student | all (?empty=1) | Empty dashboard still shows a "Start revising" button under "Nothing to revise today". | Empty text + `Start revising` link. | D | Hide the CTA when there is nothing due. |
| QA-19 | minor | src/app | n/a | The 3 lint warnings (`react-refresh/only-export-components`, 0 errors): `src/app/guards.tsx:7` (`homeFor` exported next to components), `src/app/routes.tsx:38` (`AppLoading`) and `:43` (`Root`) declared in a file that exports `routes`/`router`. They also cause the dev "router export is incompatible" Fast Refresh message. | `npx eslint src/app` output. | Lead | Move `homeFor` to `src/lib` or `src/app/paths.ts`; move `AppLoading` and `Root` into their own component files. |
| QA-20 | minor | public/ | n/a | Colour literals: none in `src` (grep for `#rrggbb`, `rgb(`, `hsl(`, `bg-[#...]`, `[rgb`, `[hsl` found nothing; `tailwind.config.ts` holds `rgba(79,70,229,0.35)` which is allowed). But `public/animations/*.svg` hard-code hex fills (for example `#6366f1`, `#f8fafc`, `#e2e8f0`), so illustration colours will not follow token changes once Agent A reconciles with Figma. | `grep` on `public/animations/learning-path.svg`. | A | Recolour SVGs to the final tokens when reconciled, or use `currentColor`/CSS variables. |
| QA-21 | minor | login to home | all | On sign-in the UI language switches to the user's profile locale (teacher demo user is Sinhala), overriding the language chosen on the login page. | Teacher sign-in landed on Sinhala UI with English picked. | B / C / D | Decide the rule; either keep the selected locale or tell the user. |
| QA-22 | minor | mock toggles | n/a | `?fail=1` / `?empty=1` apply only to that page load; client-side navigation drops them. | Retry after removing the query param succeeds. | B | Optional: persist when set (`setFailing`) or document it. |

Informational (no action): the teacher sidebar and bottom nav have a single item ("Overview"), by design, classes and students are reached from page links; admin shows 4 of 4 items on all widths; Student `/onboarding` is not reachable again once completed (redirects to `/student`).

## 4. Other checks requested

- 3 lint warnings in `src/app`: confirmed, details in QA-19.
- Hex/rgb in src outside tailwind.config.ts: none (QA-20 notes the SVG assets).
- "Your next step" illustration: root cause analysis in QA-08.
- Sinhala/Tamil: no raw keys and no clipped text (my clip check found none) on any route at 390; Tamil overflow QA-03 and QA-04; line-height QA-02. Fonts include Noto Sans Sinhala and Noto Sans Tamil; no tofu glyphs seen in text extraction (not visually verified on every screen).

## 5. Not tested or partial

- Figma comparison: impossible (see top).
- Screen reader pass, 200% zoom and `prefers-reduced-motion` were not run (no screen reader available in this environment).
- Sinhala at 834 and 1440, and Tamil at 834/1440 for teacher and admin, were not run (390 for everything; Tamil at 834 for student; Sinhala at 834 for onboarding only).
- Contrast ratios for text were not measured with a tool; the focus ring figure in QA-05 is a hand calculation.
- Console buffer only held the first student sweep and the last page; teacher/admin console output between was not re-read.
- Tutor send-time error (`?fail=1` then Send) and quest "Mark done" / mastery celebration, revision review flow, curriculum optimistic rollback toast were not exercised.
- Runtime loading states were observed only on admin; other routes verified from source (`LoadingState`/`Skeleton` usage).
- Unverified: the accessibility tree listed onboarding radios with names "en", "si", "ta" (value-like) although visible labels are English/Sinhala/Tamil; could be the tool's rendering, worth a screen-reader check.
- Table sort keyboard operation and 44px targets in the 834 table were measured only (no sort via Tab/Enter).
