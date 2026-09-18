# Current Tasks

## Active

None actively in progress. [Phase 0] "Pre-Development (Discussion & Specification)" is complete for the scope captured so far; implementation has not started.

## Next

Open items carried over from the discussion phase, not yet decided or scoped into a phase:

- Choose a PaaS hosting platform for the backend/database (e.g. Render, Railway, Fly.io — see `DECISIONS.md`'s production stack decision; frontend/backend/database/ORM/auth approach are already chosen).
- Itemize the exact fields for a worker's "Personal info" (e.g. address, ID number, emergency contact — not yet itemized).
- Decide which document types to support for worker document uploads (ID proofs, contracts, etc. — not yet itemized).
- Decide whether there's a dashboard/home screen listing all workers, and what it shows at a glance.
- Decide whether reports/export (e.g. PDF payslip generation) are wanted.
- Decide whether overtime, bonuses, or deductions beyond attendance/advance are in scope.

Once the tech stack and first implementation phase are decided by the owner, add that phase to `PHASES.md` and move its concrete work items here.

## Blocked

None.

## Completed

- [x] [Phase 0] Define purpose and users (offline PWA for a single admin — the owner's father — managing daily-wage worker attendance/salary/advances) — 2026-09-17 (see `PROJECT.md`)
- [x] [Phase 0] Define platform approach: offline-first mobile web PWA, local on-device storage, no server/hosting — 2026-09-17 (**superseded 2026-09-18** — the owner's father needs the app usable from any device, which local-only storage can't support; replaced by the production stack decision below — see `PROJECT.md`, `DECISIONS.md`)
- [x] [Phase 0] Define login approach: dedicated login screen, admin-set credentials — 2026-09-17 (see `DECISIONS.md`)
- [x] [Phase 0] Define worker lifecycle: never deleted, Active/Inactive status only, history preserved on reactivation — 2026-09-17 (see `DECISIONS.md`)
- [x] [Phase 0] Define the worker module: personal/employment info, monthly color-coded attendance calendar (editable for any date), attendance-entry/advance-salary popup, per-worker salary rate with a flat half-day rule, and auto-calculated salary/advance totals — 2026-09-17 (see `PROJECT.md`)
- [x] Set up the 6-file documentation system (`CLAUDE.md`, `PROJECT.md`, `PHASES.md`, `TASKS.md`, `ARCHITECTURE.md`, `DECISIONS.md`) in `Project Docs/`, carrying forward the owner's discussion notes — 2026-09-18
- [x] Extracted the remaining raw discussion notes (`PROJECT_SPEC.md`) fully into this documentation system and deleted the file, per the owner's request — 2026-09-18
- [x] Named the app **Daymark Ledger** — explored naming options against ChatGPT and Gemini using the same brief, converged on "Daymark" plus "Ledger" — 2026-09-18 (see `PROJECT.md`, `DECISIONS.md`)
- [x] Locked the production tech stack: React + Vite + TypeScript + Tailwind CSS (frontend), Node.js + Express + TypeScript REST API (backend, Next.js not used by default), PostgreSQL 18 via Prisma, database-backed sessions with bcrypt password hashing — chosen after the owner clarified the app needs to be usable from any device, ruling out the original offline/local-storage plan — 2026-09-18 (see `PROJECT.md`, `ARCHITECTURE.md`, `DECISIONS.md`)
