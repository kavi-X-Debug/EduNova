# Progress

- Phase 0 (lead): scaffold, contract, types, service interfaces.
- Agent B (data/services, branch agent/data): mock services (auth/student/teacher/admin) in src/mocks with 150-400ms latency; `?fail=1` / `?empty=1` (or localStorage edunova.mock.fail / edunova.mock.empty) toggles; singletons in src/services/index.ts; Zustand stores (useSessionStore, useUiStore) in src/store; src/lib: bandFromLevel/bandFromMastery, date formatters, useAsync. English text for all mock i18n keys exported as `mockEn` from '@/services'.
