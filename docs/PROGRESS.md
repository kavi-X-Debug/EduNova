# Progress

- Phase 0 (lead): scaffold, contract, types, service interfaces.
- Agent B (data/services, branch agent/data): mock services (auth/student/teacher/admin) in src/mocks with 150-400ms latency; `?fail=1` / `?empty=1` (or localStorage edunova.mock.fail / edunova.mock.empty) toggles; singletons in src/services/index.ts; Zustand stores (useSessionStore, useUiStore) in src/store; src/lib: bandFromLevel/bandFromMastery, date formatters, useAsync. English text for all mock i18n keys exported as `mockEn` from '@/services'.
- Agent A (design system, branch agent/design-system): src/components/ui (+Showcase.tsx, not routed), src/layouts (AppShell, Student/Teacher/Admin/AuthLayout), global focus and reduced-motion CSS. typecheck, lint, build pass.
  **Tokens are UNVERIFIED against Figma**: Figma MCP session was created but every read (get_variable_defs, get_metadata) returned the Starter-plan tool-call limit, and docs/DESIGN_BRIEF.md does not exist. tailwind.config.ts keeps Phase 0 placeholder values (names unchanged).
