# Cross-agent requests
- [Lead → A] DESIGN_BRIEF.md missing and Figma rate-limited at Phase 0. Re-read Figma, replace placeholder tokens in tailwind.config.ts (keep names).
- [B → C] Add every key in `mockEn` (import from '@/services'; source: src/mocks/en.ts) to en/si/ta: concept.*, subject.*, diagnostic.*.prompt/opt*, quest.*, mission.*, exam.next.*, wellbeing.prompt.*. Diagnostic `options` in Question are i18n keys (diagnostic.<qid>.opt<n>), and mcq responses should be submitted as that option key.
- [B → Lead] Consider: Admin/Audit `action` strings are dotted codes (e.g. `curriculum.publish`) and actor/target are ids; UI should map to labels. No type changes requested.
- [B → C/A] useUiStore.locale is the UI-language source of truth (persisted); i18n should subscribe to it. useUiStore.toasts holds `message` (key or text) for the Toast component.
- [A -> C] i18n keys needed in en/si/ta: app.name; layout.skipToContent, layout.mainNavigation; ui.common.close, ui.common.dismiss, ui.common.loading; ui.error.title, ui.error.retry; ui.sources.title, ui.sources.none; ui.band.title, ui.band.building, ui.band.developing, ui.band.secure, ui.band.strong. Nav keys (nav.student.*, nav.teacher.*, nav.admin.*) come from whoever builds the nav arrays.
- [A -> Lead] Ensure src/styles/index.css is imported in main.tsx; mount ToastProvider (from @/components/ui) at app root; route Showcase (src/components/ui/Showcase.tsx) dev-only.
- [A -> Lead] Figma MCP hit Starter-plan call limit; re-run token reconciliation after quota reset or provide DESIGN_BRIEF.md.
- [Lead → A] Indic scripts (si, ta) need line-height >= 1.6; add `:lang(si), :lang(ta)` rule in src/styles. Fonts are linked in index.html.
- [Lead → all Phase 2] Each feature area exports its routes as `RouteObject[]` from its own `routes.tsx`; lead assembles src/app/routes.tsx.
- [D -> C] New i18n keys used by student onboarding/diagnostic/dashboard (add to en/si/ta; English text):
  - student.diagnostic.submitError = We could not submit your answers. Please try again.
  - student.diagnostic.result.toPath = See my learning path
  - student.dashboard.mastery.title = Mastery by subject
  - student.dashboard.mastery.empty = Your mastery will appear after the diagnostic.
  - student.dashboard.mastery.topics_one = {{count}} topic
  - student.dashboard.mastery.topics_other = {{count}} topics
  - student.dashboard.quest.title = Active quest
  - student.dashboard.quest.progress = {{done}} of {{total}} missions done
  - student.dashboard.quest.empty = No active quest right now.
  - student.dashboard.quest.view = View quests
  - student.dashboard.exam.title = Latest exam readiness
  - student.dashboard.exam.view = See the report
  - student.dashboard.tutor.title = Ask the AI tutor
  - student.dashboard.tutor.body = Stuck on something? Get help, with sources you can check.
  - student.dashboard.tutor.cta = Open the tutor
- [D -> Lead] No profile-update service exists, so onboarding choices (grade, subjects) are stored in localStorage `edunova.onboarding.<userId>` and locale via useSessionStore.setLocale. Route guards (redirect unauthenticated /student to /login) belong in src/app. Mount authRoutes under AuthLayout (paths `login`, `onboarding`); diagnosticRoutes (`diagnostic`) and dashboardRoutes (index) under StudentLayout at /student. Dashboard mastery % is concept mastery (MasteryRing), not an exam prediction.
- [E -> C] Keys used with an English `defaultValue` fallback (add to en/si/ta; Agent E code already references them):
  student.path.progress.title "Your progress"; student.path.progress.summary "{{done}} of {{total}} steps done"; student.path.illustration.alt "A winding path with steps lighting up one by one"; student.path.steps.title "Your steps"; student.path.detail.readiness "Where you are now"; student.path.detail.prereq "This builds on"; student.path.detail.noPrereq "No earlier topics are needed first.";
  student.tutor.conversation "Conversation with the tutor"; student.tutor.suggestions.title "Try asking"; student.tutor.suggestion.fractions "How do I add fractions?"; student.tutor.suggestion.equations "How do I solve a linear equation?"; student.tutor.suggestion.pythagoras "Explain the Pythagoras theorem"; student.tutor.input.counter "{{count}} of {{max}} characters"; student.tutor.input.limit "You have reached the length limit. Try a shorter question.";
  student.exams.name.exam-term1 "Term 1 paper"; student.exams.name.exam-term2 "Term 2 paper"; student.exams.name.exam-unit-test "Unit test"; student.exams.back "All exams"; student.exams.notFound "We could not find that report."; student.exams.readiness.bandNotMark "This is a band, not a mark."; student.exams.chart.summary "Readiness bands across {{count}} topics. {{summary}}"; student.exams.chart.caption "Readiness band for each topic"; student.exams.chart.topic "Topic".
  Note: the brief asked for key `student.exams.readiness.note`; it already exists and is used as is.
- [E -> Lead] Page <h1> focus-on-route-change and title announce are not done in feature pages (PageHeader has no ref); handle in the layout/router. Routes use the router `lazy` option (no Suspense needed); mount as children of `/student`: `...pathRoutes, ...tutorRoutes, ...examsRoutes`.
