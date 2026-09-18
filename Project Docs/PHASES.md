# Development Phases

The project owner has not yet defined a build roadmap beyond the discussion/specification stage recorded below as **Phase 0 — Pre-Development (Discussion & Specification)**. Per `CLAUDE.md` rule 3, Claude must not invent Phase 1 and beyond — the project owner determines the number and order of phases, and further phases should be added here only once the owner defines them (e.g. tech-stack selection, project scaffolding, and the worker/attendance/salary features themselves).

## Phase 0 — Pre-Development (Discussion & Specification)

### Objective
Define the app's purpose, users, platform approach, and feature set before writing any code.

### Scope
Requirements discussion covering: purpose and target users, platform approach (offline-first mobile PWA, no server), login approach, worker lifecycle (Active/Inactive, never deleted), the worker module's structure (profile, attendance calendar, salary configuration, salary/advance calculations), and the attendance/advance-salary entry mechanism (day-popup with a checkbox for advance salary). Originally captured in the owner's raw discussion notes, then fully extracted into `PROJECT.md` and `DECISIONS.md` and the raw notes deleted (2026-09-18) — see `CLAUDE.md`'s Project-Specific Notes.

### Completion Criteria
A written specification exists covering purpose, users, platform, login, worker lifecycle, and the full worker module (profile, attendance calendar, salary configuration, calculations) — reviewed and confirmed by the project owner before implementation begins.

**Status: Complete**, for the discussion captured so far. The owner's discussion notes were written 2026-09-17 and their content carried into this documentation system 2026-09-18. On 2026-09-18, an interactive, non-functional UI prototype (mobile view, Claude Artifact) was also built to validate the worker-list/attendance/manage-employee flows visually — this is still discussion/specification work (no production code), not a new phase; see `ARCHITECTURE.md`'s Prototype note and `TASKS.md`. Several items remain explicitly open (PaaS hosting, exact personal-info fields, document types, Reporting screen scope, Settings screen scope, overtime/bonuses/deductions) — see `TASKS.md`'s Next section. These are follow-up discussion items, not a sign this phase is incomplete; the owner may reopen or extend this phase's scope, or fold remaining open items into a later phase, at their discretion.

## Phase 1 and beyond — Not yet defined

No further phases have been defined. Likely next steps, implied by the spec but not yet scoped or ordered by the owner: choosing a tech stack (framework, local storage mechanism, PWA tooling), scaffolding the project, and building the login screen, worker module, and calculation logic. Do not treat this list as a committed roadmap — it is only mentioned here so the open work is not lost; the owner sets the actual phase breakdown when ready.
