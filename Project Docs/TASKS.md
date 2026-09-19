# Current Tasks

## Active

None.

## Next

Open items carried over from the discussion phase, not yet decided or scoped into a phase:

- Choose a PaaS hosting platform for the backend/database (e.g. Render, Railway, Fly.io — see `DECISIONS.md`'s production stack decision; frontend/backend/database/ORM/auth approach are already chosen).
- Itemize the exact fields for a worker's "Personal info" (e.g. address, ID number, emergency contact — not yet itemized).
- Decide which document types to support for worker document uploads (ID proofs, contracts, etc. — not yet itemized).
- Decide Reporting's actual scope (what it shows/does) — the owner has deferred this specifically to when Phase 17 (Reporting Panel Frontend) starts, per `PHASES.md`; built frontend-first deliberately, with Phase 18 (Reporting Panel Backend) following once the frontend clarifies what's needed.
- Decide Settings' actual scope (what it shows/does) — the owner has deferred this to when Phase 19 (Settings Panel Frontend) starts, per `PHASES.md`; likely candidate is admin credential management, but not confirmed. Built frontend-first deliberately, with Phase 20 (Settings Panel Backend) following once the frontend clarifies what's needed.
- Decide whether overtime, bonuses, or deductions beyond attendance/advance are in scope.
- Decide the document/photo upload storage mechanism (local filesystem vs. cloud storage) — surfaced as a prerequisite for Phase 9's Worker document/photo fields, not yet decided.
- [Phase 2] Scaffold the Node/Express + TypeScript backend project (folder structure, TS/build config, env-var handling) with a basic health-check endpoint — no DB/Prisma connection yet (see `PHASES.md`; starts once Phase 1 is complete).
- [Phase 3] Install Prisma in the backend and verify Prisma Client connects to the Phase 1 database — no schema yet (see `PHASES.md`; starts once Phase 2 is complete).
- [Phase 4] Scaffold `schema.prisma` and confirm Prisma CLI/Client tooling works against the Phase 1 database — no real tables/models yet (see `PHASES.md`; starts once Phase 3 is complete).
- [Phase 5] Scaffold the React + Vite + TypeScript + Tailwind frontend project and confirm its dev server runs and serves a page — no backend connection or real screens yet (see `PHASES.md`; starts once Phase 4 is complete).
- [Phase 6] Wire up one minimal end-to-end round-trip (frontend → backend → database via Prisma raw/connection-check query → backend → frontend) to prove the full stack connects locally — no real tables/screens/business logic yet (see `PHASES.md`; starts once Phase 5 is complete).
- [Phase 7] Design/migrate the User + Session schema (first real migration), seed the admin user, and implement login/logout endpoints + session-verification middleware per `DECISIONS.md`'s auth decision — no frontend login UI or Worker/Attendance/Advance schema yet (see `PHASES.md`; starts once Phase 6 is complete).
- [Phase 8] Build the frontend login screen (username/password form, no existing prototype design to draw from) and wire it to the Phase 7 login endpoint, with success/failure handling and a redirect to a placeholder authenticated area — no worker module/other post-login screens yet (see `PHASES.md`; starts once Phase 7 is complete).
- [Phase 9] Design/migrate the Worker and Attendance models (first domain migration) and build the home-screen endpoints (list workers with today's status; set today's status) behind session auth — no Advance model, calculations, any-date editing, or Manage Employees endpoints yet (see `PHASES.md`; starts once Phase 8 is complete).
- [Phase 10] Build the real home screen frontend (worker list + inline today-status change), wired to the Phase 9 API (no mock data) — Worker Detail route is a stub for now; quick-actions menu entries besides navigation stay non-functional (see `PHASES.md`; starts once Phase 9 is complete).
- [Phase 11] Extend Attendance to any-date get/set, design/migrate the Advance model (second domain migration), and build advance add/history + calculation endpoints (totals, running-month/whole-year advance, flat half-day rule) behind session auth — no frontend, no document/photo handling yet (see `PHASES.md`; starts once Phase 10 is complete).
- [Phase 12] Build the real Worker Detail screen (calendar for any date, day-tap popup with advance checkbox, salary-rate display, live totals, advance history), wired to the Phase 11 API, replacing the Phase 10 stub route — no Manage Employees/Create Employee/Reporting/Settings/document handling yet (see `PHASES.md`; starts once Phase 11 is complete).
- [Phase 13] Build a create-worker endpoint (full name, designation, contact, joining date, per-day rate; defaults to Active) using the Phase 9 Worker model — no frontend form yet (see `PHASES.md`; starts once Phase 12 is complete).
- [Phase 14] Build the Create New Employee form, wired to the Phase 13 endpoint, and activate that quick-actions menu entry — new worker should appear on the Phase 10 home screen afterward (see `PHASES.md`; starts once Phase 13 is complete).
- [Phase 15a] Build the list-all-workers endpoint (Active + Inactive) for the Manage Employees List screen — no frontend yet (see `PHASES.md`; starts once Phase 14 is complete).
- [Phase 15b] Build get-one, update-personal-info, and toggle-Active/Inactive endpoints for the Manage Employee Details screen; document/photo add/remove endpoints blocked on the storage-mechanism decision — no frontend yet (see `PHASES.md`; starts once Phase 15a is complete).
- [Phase 16a] Build the Manage Employees List screen, wired to Phase 15a, and activate that quick-actions menu entry — worker Details route is a stub for now (see `PHASES.md`; starts once Phase 15b is complete).
- [Phase 16b] Build the Manage Employee Details screen (personal-info edit, Active/Inactive toggle, document management), wired to Phase 15b, replacing the Phase 16a stub route (see `PHASES.md`; starts once Phase 16a is complete).
- [Phase 17] Build the Reporting panel frontend, activating that quick-actions menu entry — scope not yet specified by the owner; built before its backend deliberately (see `PHASES.md`; starts once Phase 16b is complete).
- [Phase 18] Build the Reporting panel backend, once Phase 17's frontend clarifies what it needs — scope not yet specified (see `PHASES.md`; starts once Phase 17 is complete).
- [Phase 19] Build the Settings panel frontend, activating that quick-actions menu entry (the last placeholder one) — scope not yet specified by the owner; built before its backend deliberately (see `PHASES.md`; starts once Phase 18 is complete).
- [Phase 20] Build the Settings panel backend, once Phase 19's frontend clarifies what it needs — scope not yet specified (see `PHASES.md`; starts once Phase 19 is complete).
- [Phase 21] Full end-to-end testing of every implemented flow against the real local stack, re-verifying `ARCHITECTURE.md`'s invariants (half-day rule, any-date editing, history preserved on reactivation, auto-calculated totals) hold together, not just per-feature — testing approach/tooling not yet decided (see `PHASES.md`; starts once Phase 20 is complete).

## Blocked

None.

## Completed

- [x] [Phase 1] Confirmed the local PostgreSQL 18 server (`postgresql-x64-18` Windows service) is installed, running, and set to Automatic startup — 2026-09-19 (see `PHASES.md`, `DECISIONS.md`)
- [x] [Phase 1] Decided the dev connection approach: use the existing native Windows PostgreSQL 18 service directly, not Docker — 2026-09-19 (see `DECISIONS.md`)
- [x] [Phase 1] Created the empty development database `daymark_ledger_dev` — 2026-09-19
- [x] [Phase 1] Decided to connect as the `postgres` superuser directly for local dev, no dedicated dev role — 2026-09-19 (see `DECISIONS.md`)
- [x] [Phase 1] Confirmed a working connection string end-to-end via `psql` (`postgres@localhost:5432/daymark_ledger_dev`), with zero tables present — 2026-09-19
- [x] [Phase 0] Define purpose and users (offline PWA for a single admin — the owner's father — managing daily-wage worker attendance/salary/advances) — 2026-09-17 (see `PROJECT.md`)
- [x] [Phase 0] Define platform approach: offline-first mobile web PWA, local on-device storage, no server/hosting — 2026-09-17 (**superseded 2026-09-18** — the owner's father needs the app usable from any device, which local-only storage can't support; replaced by the production stack decision below — see `PROJECT.md`, `DECISIONS.md`)
- [x] [Phase 0] Define login approach: dedicated login screen, admin-set credentials — 2026-09-17 (see `DECISIONS.md`)
- [x] [Phase 0] Define worker lifecycle: never deleted, Active/Inactive status only, history preserved on reactivation — 2026-09-17 (see `DECISIONS.md`)
- [x] [Phase 0] Define the worker module: personal/employment info, monthly color-coded attendance calendar (editable for any date), attendance-entry/advance-salary popup, per-worker salary rate with a flat half-day rule, and auto-calculated salary/advance totals — 2026-09-17 (see `PROJECT.md`)
- [x] Set up the 6-file documentation system (`CLAUDE.md`, `PROJECT.md`, `PHASES.md`, `TASKS.md`, `ARCHITECTURE.md`, `DECISIONS.md`) in `Project Docs/`, carrying forward the owner's discussion notes — 2026-09-18
- [x] Extracted the remaining raw discussion notes (`PROJECT_SPEC.md`) fully into this documentation system and deleted the file, per the owner's request — 2026-09-18
- [x] Named the app **Daymark Ledger** — explored naming options against ChatGPT and Gemini using the same brief, converged on "Daymark" plus "Ledger" — 2026-09-18 (see `PROJECT.md`, `DECISIONS.md`)
- [x] Locked the production tech stack: React + Vite + TypeScript + Tailwind CSS (frontend), Node.js + Express + TypeScript REST API (backend, Next.js not used by default), PostgreSQL 18 via Prisma, database-backed sessions with bcrypt password hashing — chosen after the owner clarified the app needs to be usable from any device, ruling out the original offline/local-storage plan — 2026-09-18 (see `PROJECT.md`, `ARCHITECTURE.md`, `DECISIONS.md`)
- [x] Built an interactive mobile UI prototype (Claude Artifact, not production code) covering: home worker list with inline today-status change, per-worker attendance/salary/advance detail, a floating quick-actions menu, Manage Employees (Active/Inactive toggle, personal-info edit, document add/remove), Create New Employee, and placeholder Reporting/Settings screens — 2026-09-18 (source kept at `Prototype/` in this repo; see `ARCHITECTURE.md`'s Prototype note and `DECISIONS.md`)
