# Cross-agent requests
- [Lead → A] DESIGN_BRIEF.md missing and Figma rate-limited at Phase 0. Re-read Figma, replace placeholder tokens in tailwind.config.ts (keep names).
- [B → C] Add every key in `mockEn` (import from '@/services'; source: src/mocks/en.ts) to en/si/ta: concept.*, subject.*, diagnostic.*.prompt/opt*, quest.*, mission.*, exam.next.*, wellbeing.prompt.*. Diagnostic `options` in Question are i18n keys (diagnostic.<qid>.opt<n>), and mcq responses should be submitted as that option key.
- [B → Lead] Consider: Admin/Audit `action` strings are dotted codes (e.g. `curriculum.publish`) and actor/target are ids; UI should map to labels. No type changes requested.
- [B → C/A] useUiStore.locale is the UI-language source of truth (persisted); i18n should subscribe to it. useUiStore.toasts holds `message` (key or text) for the Toast component.
- [A -> C] i18n keys needed in en/si/ta: app.name; layout.skipToContent, layout.mainNavigation; ui.common.close, ui.common.dismiss, ui.common.loading; ui.error.title, ui.error.retry; ui.sources.title, ui.sources.none; ui.band.title, ui.band.building, ui.band.developing, ui.band.secure, ui.band.strong. Nav keys (nav.student.*, nav.teacher.*, nav.admin.*) come from whoever builds the nav arrays.
- [A -> Lead] Ensure src/styles/index.css is imported in main.tsx; mount ToastProvider (from @/components/ui) at app root; route Showcase (src/components/ui/Showcase.tsx) dev-only.
- [A -> Lead] Figma MCP hit Starter-plan call limit; re-run token reconciliation after quota reset or provide DESIGN_BRIEF.md.
