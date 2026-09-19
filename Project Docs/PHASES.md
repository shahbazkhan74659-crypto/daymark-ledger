# Development Phases

**The full build roadmap (Phase 0 through Phase 21) is defined, and the owner has declared this roadmap complete as of 2026-09-18.** Per `CLAUDE.md` rule 3 and the owner's explicit instruction, Claude must never add, reorder, split, or otherwise change a phase on its own initiative — any change to this roadmap requires the owner's explicit consultation and direction first, every time.

## Phase 0 — Pre-Development (Discussion & Specification)

### Objective
Define the app's purpose, users, platform approach, and feature set before writing any code.

### Scope
Requirements discussion covering: purpose and target users, platform approach (offline-first mobile PWA, no server), login approach, worker lifecycle (Active/Inactive, never deleted), the worker module's structure (profile, attendance calendar, salary configuration, salary/advance calculations), and the attendance/advance-salary entry mechanism (day-popup with a checkbox for advance salary). Originally captured in the owner's raw discussion notes, then fully extracted into `PROJECT.md` and `DECISIONS.md` and the raw notes deleted (2026-09-18) — see `CLAUDE.md`'s Project-Specific Notes.

### Completion Criteria
A written specification exists covering purpose, users, platform, login, worker lifecycle, and the full worker module (profile, attendance calendar, salary configuration, calculations) — reviewed and confirmed by the project owner before implementation begins.

**Status: Complete**, for the discussion captured so far. The owner's discussion notes were written 2026-09-17 and their content carried into this documentation system 2026-09-18. On 2026-09-18, an interactive, non-functional UI prototype (mobile view, Claude Artifact) was also built to validate the worker-list/attendance/manage-employee flows visually — this is still discussion/specification work (no production code), not a new phase; see `ARCHITECTURE.md`'s Prototype note and `TASKS.md`. Several items remain explicitly open (PaaS hosting, exact personal-info fields, document types, Reporting screen scope, Settings screen scope, overtime/bonuses/deductions) — see `TASKS.md`'s Next section. These are follow-up discussion items, not a sign this phase is incomplete; the owner may reopen or extend this phase's scope, or fold remaining open items into a later phase, at their discretion.

## Phase 1 — Local PostgreSQL 18 Setup

### Objective
Get a local PostgreSQL 18 instance running and ready for development — reachable, with an empty development database created — before any schema, Prisma setup, or migrations exist.

### Scope
Local-machine database setup only: confirm/install PostgreSQL 18, ensure the server is running and reachable, create an empty development database (and a dedicated dev role/credentials if needed) for the eventual Node/Express + Prisma backend to connect to (see `ARCHITECTURE.md`'s planned stack). Explicitly excludes: Prisma installation/initialization, schema design, and any migrations — this phase produces zero tables and zero migrations. PaaS/production hosting (see `TASKS.md`) is out of scope here; this is local dev only.

### Completion Criteria
A local PostgreSQL 18 server is running and accepting connections, an empty development database exists, and connection credentials/connection string are confirmed working — with no tables, schema, or migrations present yet.

**Status: Complete** — 2026-09-19. Used the existing native `postgresql-x64-18` Windows service (Docker Desktop was available but not used — its service was stopped/manual vs. the native service's already-running/Automatic state). Created the `daymark_ledger_dev` database; the backend connects as the `postgres` superuser directly for local dev (no dedicated dev role — owner's explicit choice). Connection confirmed end-to-end via `psql` with zero tables present. See `DECISIONS.md` for the reasoning.

## Phase 2 — Creating Backend Server

### Objective
Scaffold the Node.js + Express + TypeScript backend project (see `ARCHITECTURE.md`'s planned stack) so it runs locally as a bare, working server — before any database connection, ORM, or business-logic routes exist.

### Scope
Project scaffolding only: initialize the Express + TypeScript project, set up folder structure, TypeScript/build config, and environment-variable handling, and add a basic health-check endpoint to prove the server runs and responds. Explicitly excludes: Prisma installation/initialization, schema design, migrations, and any connection to the Phase 1 Postgres database (deferred to Phase 3 — see below) — and excludes auth, worker/attendance/advance routes, and any other business logic.

### Completion Criteria
The backend project runs locally via its dev script and a health-check endpoint responds successfully. No database connection, no Prisma, and no business-logic routes exist yet.

**Status: Not started.**

## Phase 3 — Connecting Backend and Local Database

### Objective
Give the Phase 2 backend server a bare, working connection to the Phase 1 local PostgreSQL database via Prisma — no schema yet.

### Scope
Install Prisma in the Phase 2 backend project and configure it (e.g. `DATABASE_URL` env var) to point at the Phase 1 local database; verify Prisma Client can successfully connect. Explicitly excludes: schema design, migrations, Prisma Client generation against a real schema, API route/business-logic implementation, auth logic, and any frontend work — all deferred to Phase 4 and beyond.

### Completion Criteria
Prisma is installed in the backend project and Prisma Client successfully connects to the Phase 1 local database. No schema, no tables, no migrations exist yet.

**Status: Not started.**

## Phase 4 — Full Prisma Setup

### Objective
Get Prisma's tooling fully configured and verified in the backend project, building on the bare connection established in Phase 3 — still no real tables or migrations.

### Scope
Scaffold the `schema.prisma` file (datasource, generator blocks), confirm `prisma generate`/`prisma migrate`/`prisma studio` tooling runs correctly against the Phase 1 local database, and verify the Prisma Client package builds/imports cleanly in the backend project. Explicitly excludes: designing or migrating any real entity models (Worker, Attendance, Advance, User/session — all deferred to later phases, starting with the User table in Phase 7), API route/business-logic implementation, auth logic, and any frontend work.

### Completion Criteria
Prisma's CLI tooling and Client generation work end-to-end against the Phase 1 database from the backend project. No tables, models, or migrations exist yet.

**Status: Not started.**

## Phase 5 — Creating Frontend Server

### Objective
Scaffold the React + Vite + TypeScript + Tailwind frontend project (see `ARCHITECTURE.md`'s planned stack) so it runs locally as a bare, working dev server — before any connection to the backend or real screens/routes exist.

### Scope
Project scaffolding only: initialize the Vite + React + TypeScript project, configure Tailwind CSS, set up folder structure and env-var handling, and confirm the dev server runs and serves a default/placeholder page in the browser. Explicitly excludes: any connection/API calls to the Phase 2 backend, routing, and the login screen, worker module, or other real screens (the prototype's screen designs — see `ARCHITECTURE.md`'s Prototype note — inform but do not get built out yet).

### Completion Criteria
The frontend project runs locally via its dev script and serves a page in the browser. No backend connection, no routing, and no real app screens exist yet.

**Status: Not started.**

## Phase 6 — Connecting Frontend, Backend, and Database

### Objective
Prove the full stack works end-to-end: the Phase 5 frontend can call the Phase 2 backend, which reads/writes the Phase 1 database via the Phase 4 Prisma schema, and the result makes it back to the browser.

### Scope
Add one minimal API round-trip — e.g. extend the Phase 2 health-check endpoint (or add one trivial endpoint) to run a raw/connection-check query via Prisma (no real tables exist yet at this point — see Phase 4) and return a result, and have the Phase 5 frontend fetch it and render the response. Include whatever local-dev plumbing this requires (CORS config, frontend API base URL/env var, etc.). Explicitly excludes: the login screen, auth, the worker module, and any other real business logic/screens — this phase only proves connectivity across all three layers, not feature functionality.

### Completion Criteria
Running the frontend and backend locally together, the frontend successfully displays data that traveled frontend → backend → database → backend → frontend.

**Status: Not started.**

## Phase 7 — Login and Auth Backend

### Objective
Build the real login/auth backend per `DECISIONS.md`'s auth decision (database-backed sessions, bcrypt password hash, single admin account) — this phase runs the first real Prisma migration and gets a working, seeded admin login.

### Scope
Design and migrate the User/admin schema (the account's bcrypt-hashed password, plus a Session model with a hashed session ID — per `ARCHITECTURE.md`'s Authentication & Authorization section) — this is the first real migration, building on the Phase 4 tooling. Seed one admin user (credentials to be provided/set by the owner, not hardcoded defaults left in place). Implement backend login/logout endpoints and session-verification middleware. Explicitly excludes: the frontend login screen/UI (a later phase), and the Worker/Attendance/Advance schema and routes (their own later phase).

### Completion Criteria
The User/Session schema is migrated against the Phase 1 database, the admin user is seeded, and login/logout endpoints work end-to-end via a real HTTP request (e.g. through a REST client) — issuing and validating a database-backed session.

**Status: Not started.**

## Phase 8 — Building the Frontend Login Screen

### Objective
Build the real login screen UI and wire it to the Phase 7 auth backend, so the admin can actually authenticate through the app.

### Scope
Build a dedicated login screen (username/password form, per `DECISIONS.md`'s login decision — not a PIN) in the Phase 5 frontend project; on submit, call the Phase 7 login endpoint, handle success (session established, e.g. via the browser automatically holding the session cookie) and failure (invalid-credentials error shown to the admin) states, and redirect to a placeholder authenticated area on success. Note: the prototype (see `ARCHITECTURE.md`'s Prototype note) did not cover a login screen, so its visual design is not yet established and may need a fresh design pass here. Explicitly excludes: the worker module, Manage Employees flow, and any other post-login app screens — those remain placeholder/stub content until their own later phases.

### Completion Criteria
The admin can enter credentials on the frontend login screen, submit, and successfully authenticate against the Phase 7 backend with a valid session maintained; invalid credentials show a visible error and do not authenticate.

**Status: Not started.**

## Phase 9 — Home Screen Backend

### Objective
Build the backend the home screen needs: a list of workers with today's attendance status, and a way to change a worker's today-status inline — the first real domain migration, after Phase 7's User/Session.

### Scope
Design/migrate the Worker model (personal/employment info, per-day salary rate, Active/Inactive status) and the Attendance model (worker, date, status). The Attendance model is designed to support any date from the start, per `ARCHITECTURE.md`'s "editable for any date" invariant, even though this phase only exercises it for "today" — any-date editing is built out in Phase 11. Endpoints: list (active) workers with each one's today status; set/update a worker's status for today. All routes require a valid admin session (Phase 7 middleware).

Explicitly excludes: the Advance model, calculation endpoints, any-date attendance editing, Worker create/update-personal-info/Active-Inactive-toggle endpoints (Manage Employees territory — its own later phase), and document/photo handling.

### Completion Criteria
Worker and Attendance are migrated against the Phase 1 database; the list endpoint returns workers with correct today-status; the inline update endpoint successfully changes a worker's today-status — verified via real HTTP requests behind session auth.

**Status: Not started.**

## Phase 10 — Home Screen Frontend

### Objective
Build the real home screen UI, wired to the Phase 9 backend with real data — the UX validated by the prototype (see `ARCHITECTURE.md`'s Prototype note), now built for real.

### Scope
List all (active) workers by full name and today's attendance status, with status changeable inline (tap a P/H/A pill), per `DECISIONS.md`'s navigation decision — backed by real Phase 9 API data, not the prototype's sample data. Tapping a worker's name should navigate toward a Worker Detail route/screen, but that screen's real content doesn't need to exist yet — a stub/placeholder page is enough until Phase 11 (backend) and its own later frontend phase are built. The floating quick-actions menu button may appear as a UI element, but its entries (Create New Employee, Manage Employees, Reporting, Settings) remain non-functional placeholders — each is wired up in its own later phase.

Explicitly excludes: the real Worker Detail screen (calendar, salary config, totals, advance history), Manage Employees, Create New Employee, and Reporting/Settings.

### Completion Criteria
The admin can load the home screen with real worker data and change a worker's today-status inline — backed by real Phase 9 API calls, no mock/sample data.

**Status: Not started.**

## Phase 11 — Details Page Backend

### Objective
Build the backend for the Worker Detail screen (attendance calendar for any date, salary config, salary/advance totals, advance history) — the rest of the worker module beyond "today," building on Phase 9's Worker/Attendance foundation.

### Scope
Extend Attendance endpoints to get/set a worker's status for any given date, not just today. Design/migrate the Advance model (individual dated entries — second domain migration, after Phase 9's Worker/Attendance). Endpoints: add a dated advance entry, list a worker's advance history, and calculation endpoints for total earned before/after advance deduction for a period, running-month advance total, and whole-year advance total plus remaining owed — computed server-side, applying the flat 0.5× half-day rule. All routes require a valid admin session (Phase 7 middleware).

Note: document/photo **upload storage mechanism** (local filesystem vs. cloud storage) is still undecided and out of scope here — document/photo handling remains its own later item (see `TASKS.md`).

Explicitly excludes: the Worker Detail frontend (its own later phase), Worker personal-info/Active-Inactive update endpoints (Manage Employees territory), and document/photo handling.

### Completion Criteria
Advance is migrated against the Phase 1 database; any-date attendance get/set works; advance add/history endpoints work; calculation endpoints return correct totals (including the flat half-day rule) for test data — verified via real HTTP requests behind session auth.

**Status: Not started.**

## Phase 12 — Building the Worker Detail Frontend

### Objective
Build the real Worker Detail screen, wired to the Phase 11 backend with real data — the UX validated by the prototype (see `ARCHITECTURE.md`'s Prototype note), now built for real, replacing the Phase 10 stub route.

### Scope
Monthly color-coded attendance calendar (Green/Yellow/Red, per-status counts shown below it, every day tappable/editable regardless of date), a day-tap popup to set that day's status with an "Advance Salary" checkbox revealing a ₹ amount field, salary-rate display, the auto-calculated totals (earned with/without advance deducted, running-month advance, whole-year advance plus remaining owed), and advance history — all via the Phase 11 endpoints. Wire up the Phase 10 home screen's worker-name tap to navigate here for real.

Explicitly excludes: Create New Employee, Manage Employees (Active/Inactive toggle, personal-info edit, document management), Reporting/Settings, and document/photo handling — all separate later phases per `DECISIONS.md`'s navigation decision.

### Completion Criteria
The admin can tap a worker from the home screen, land on their real Worker Detail page, view/edit attendance for any date via the day popup (including logging an advance), and see correct, live auto-calculated totals and advance history — all backed by real Phase 11 API calls, no mock/sample data.

**Status: Not started.**

## Phase 13 — Create Employee Backend

### Objective
Build the backend endpoint to create a new worker, per `PROJECT.md`'s "Create New Employee" feature — filling the gap Phase 9 deliberately left open (Phase 9 only covered listing workers and setting today's status, not creating one).

### Scope
A create-worker endpoint accepting full name, designation, contact, joining date, and per-day rate (per `PROJECT.md`'s Create New Employee field list), using the Worker model already migrated in Phase 9, defaulting the new worker to Active status. Requires a valid admin session (Phase 7 middleware). Explicitly excludes: the frontend Create New Employee form (its own later phase), personal-info edit/Active-Inactive toggle endpoints (Manage Employees territory), and document/photo upload (storage mechanism still undecided — see `TASKS.md`).

Note: "User" is deliberately not used here to avoid confusion with the Phase 7 admin auth account (`User`/`Session` models) — `PROJECT.md`'s Non-Goals rule out creating additional admin accounts; this phase is strictly about creating worker records.

### Completion Criteria
The create-worker endpoint successfully adds a new, Active worker to the Phase 1 database with the required fields — verified via a real HTTP request behind session auth.

**Status: Not started.**

## Phase 14 — Create Employee Frontend

### Objective
Build the real Create New Employee form, wired to the Phase 13 backend, and activate that entry in the floating quick-actions menu — the UX validated by the prototype (see `ARCHITECTURE.md`'s Prototype note), now built for real.

### Scope
A form (full name, designation, contact, joining date, per-day rate — per `PROJECT.md`'s field list) reachable via the quick-actions menu's "Create New Employee" entry (previously a non-functional placeholder since Phase 10/12); on submit, calls the Phase 13 create-worker endpoint, then returns to the home screen (Phase 10), which should now list the new worker. Explicitly excludes: Manage Employees, Reporting, and Settings — the quick-actions menu's other entries stay non-functional placeholders until their own later phases.

### Completion Criteria
The admin can open the quick-actions menu, tap Create New Employee, fill and submit the form, and see the new worker appear in the home screen list — backed by a real Phase 13 API call, no mock data.

**Status: Not started.**

## Phase 15a — Manage Employees Backend: List Page

### Objective
Build the backend behind the Manage Employees List screen — a full worker roster for admin housekeeping, distinct from the day-to-day home list (Phase 9).

### Scope
Endpoint: list **all** workers (Active + Inactive), with enough info to render the list (name, designation, Active/Inactive status) — distinct from Phase 9's active-only, today-status home list. Requires a valid admin session (Phase 7 middleware). Explicitly excludes: single-worker detail retrieval, editing, status toggling, and document management — all Phase 15b — and the frontend (its own later phase).

### Completion Criteria
The list-all-workers endpoint returns every worker regardless of Active/Inactive status, with correct list-view fields — verified via a real HTTP request behind session auth.

**Status: Not started.**

## Phase 15b — Manage Employees Backend: Details Page

### Objective
Build the backend behind the Manage Employee Edit/Details screen — viewing and editing a single worker's full record, toggling Active/Inactive, and document management — per `DECISIONS.md`'s navigation decision, which keeps this deliberately separate from the day-to-day worker module (Phases 9–12).

### Scope
- Endpoint: get a single worker's full details for editing.
- Endpoint: update a worker's personal/employment info (name, contact, designation, joining date, per-day rate) — the update capability Phase 9/13 deliberately left out.
- Endpoint: toggle a worker's Active/Inactive status, per `DECISIONS.md`'s worker-lifecycle decision — never deleted, history must survive reactivation intact.
- Document/photo add/remove endpoints — blocked on the still-undecided storage mechanism (local filesystem vs. cloud storage — see `TASKS.md`); resolve that decision as part of this phase, or scaffold these endpoints against a placeholder storage layer to be swapped later.
- All routes require a valid admin session (Phase 7 middleware).

Explicitly excludes: the list-all-workers endpoint (Phase 15a), and the Manage Employees List/Edit frontend screens (their own later phase).

### Completion Criteria
The get-one, update-info, and toggle-status endpoints work end-to-end via real HTTP requests behind session auth against the Phase 1 database, and deactivating/reactivating a worker preserves their attendance/advance history intact. Document/photo endpoints work if the storage-mechanism decision was resolved in this phase; otherwise this is explicitly noted as still open.

**Status: Not started.**

## Phase 16a — Manage Employees Frontend: List Page

### Objective
Build the real Manage Employees List screen, wired to the Phase 15a backend, and activate that entry in the floating quick-actions menu.

### Scope
List all workers (Active + Inactive), with their status visibly indicated — reachable via the quick-actions menu's "Manage Employees" entry (previously a non-functional placeholder since Phase 10/12/14). Tapping a worker in this list should navigate toward a Details route, but that screen's real content doesn't need to exist yet — a stub/placeholder page is enough until Phase 16b is built. Explicitly excludes: editing, Active/Inactive toggling, and document management (all Phase 16b).

### Completion Criteria
The admin can open the quick-actions menu, tap Manage Employees, and see the full worker roster (Active + Inactive) — backed by a real Phase 15a API call, no mock data.

**Status: Not started.**

## Phase 16b — Manage Employees Frontend: Details Page

### Objective
Build the real Manage Employee Edit/Details screen, wired to the Phase 15b backend, replacing the Phase 16a stub route.

### Scope
Personal/employment-info edit form, an Active/Inactive toggle (per `DECISIONS.md`'s worker-lifecycle decision), and document/photo add/remove — all via the Phase 15b endpoints. Document/photo management here depends on Phase 15b's storage-mechanism decision having been resolved; if it wasn't, this part stays a placeholder until it is. Explicitly excludes: the Manage Employees List screen (Phase 16a, already built) and anything outside worker housekeeping (Reporting/Settings).

### Completion Criteria
The admin can tap a worker from the Manage Employees List, land on their real Details page, edit personal/employment info, and toggle Active/Inactive — with the change reflected back on the List and (for reactivation) the worker's attendance/advance history intact — all backed by real Phase 15b API calls, no mock data.

**Status: Not started.**

## Phase 17 — Reporting Panel Frontend

### Objective
Build the real Reporting panel, activating the quick-actions menu's "Reporting" entry (a placeholder since Phase 10/12/14/16a).

### Scope
**Not yet specified** — the owner has deferred the exact scope (what the panel shows/does) to when this phase starts; do not invent it ahead of time. What's already decided: unlike every other feature so far (built backend-then-frontend), Reporting is being built **frontend-first, backend after** (Phase 18) — a deliberate reversal, because the owner hasn't yet decided how many features/what the panel will look like, so building the UI first is meant to help figure out what's actually needed before committing to a backend design.

### Completion Criteria
**Not yet specified** — to be defined once the owner specifies this phase's scope.

**Status: Not started — scope deferred by the owner (2026-09-18) until this phase actually starts.**

## Phase 18 — Reporting Panel Backend

### Objective
Build the real backend behind the Reporting panel, once Phase 17's frontend has clarified what data/features it actually needs.

### Scope
**Not yet specified** — depends on what Phase 17 turns out to need; do not invent it ahead of time. Built deliberately after the frontend for this one feature (see Phase 17's note on why).

### Completion Criteria
**Not yet specified** — to be defined once Phase 17 clarifies what backend support it needs.

**Status: Not started — scope deferred by the owner (2026-09-18) until this phase actually starts.**

## Phase 19 — Settings Panel Frontend

### Objective
Build the real Settings panel, activating the quick-actions menu's "Settings" entry (a placeholder since Phase 10/12/14/16a/17) — the last placeholder menu entry.

### Scope
**Not yet specified** — the owner has deferred the exact scope to when this phase starts; do not invent it ahead of time (TASKS.md notes admin credential management as a likely candidate, but this hasn't been discussed). Built frontend-first, backend after (Phase 20), matching the same deliberate reversal used for Reporting (Phase 17/18) — because Settings' scope isn't pinned down yet either.

### Completion Criteria
**Not yet specified** — to be defined once the owner specifies this phase's scope.

**Status: Not started — scope deferred by the owner (2026-09-18) until this phase actually starts.**

## Phase 20 — Settings Panel Backend

### Objective
Build the real backend behind the Settings panel, once Phase 19's frontend has clarified what it actually needs.

### Scope
**Not yet specified** — depends on what Phase 19 turns out to need; do not invent it ahead of time.

### Completion Criteria
**Not yet specified** — to be defined once Phase 19 clarifies what backend support it needs.

**Status: Not started — scope deferred by the owner (2026-09-18) until this phase actually starts.**

## Phase 21 — Full End-to-End Testing (Frontend + Backend + Database)

### Objective
Verify the whole app works correctly as one system once all of Phases 1–20 are built — not just that each phase's own feature works in isolation, but that the features hold together and the project's invariants hold across the full stack.

### Scope
End-to-end testing across every implemented flow: login/logout and session handling; home screen list + inline status change; Worker Detail (any-date attendance editing, advance logging, calculated totals); Create New Employee; Manage Employees (list, edit, Active/Inactive toggle, document management); Reporting; Settings. Explicitly re-verify `ARCHITECTURE.md`'s Important Invariants end-to-end (not just per-endpoint): half-day pay = exactly 0.5× rate; a worker marked Inactive and later reactivated keeps all attendance/salary/advance history intact; any date (past or present) remains editable; advances stay individual dated entries; all salary/advance totals are auto-calculated and correct; the app is unusable without backend connectivity (no silent local-only fallback). Testing approach/tooling (manual QA pass vs. an automated test suite, and which framework) has not been decided — resolve as part of this phase, or track as a `DECISIONS.md` entry if a framework choice is made.

### Completion Criteria
Every flow listed above works correctly end-to-end against the real local stack (frontend + backend + Phase 1 database), and every invariant above is confirmed holding across at least one realistic multi-feature scenario (e.g. create a worker, mark attendance across several dates including backfilled ones, log advances, deactivate and reactivate the worker, and confirm totals/history remain correct throughout).

**Status: Not started.**
