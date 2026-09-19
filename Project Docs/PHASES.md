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

**Status: Complete** — 2026-09-19. Scaffolded at `backend/` (npm, Express 5, TypeScript, `tsx` for dev). `GET /health` returns `{"status":"ok"}`, verified via both `npm run dev` and the compiled `npm run build && npm start` path. See `ARCHITECTURE.md` for the resulting structure.

## Phase 3 — Connecting Backend and Local Database

### Objective
Give the Phase 2 backend server a bare, working connection to the Phase 1 local PostgreSQL database via Prisma — no schema yet.

### Scope
Install Prisma in the Phase 2 backend project and configure it (e.g. `DATABASE_URL` env var) to point at the Phase 1 local database; verify Prisma Client can successfully connect. Explicitly excludes: schema design, migrations, Prisma Client generation against a real schema, API route/business-logic implementation, auth logic, and any frontend work — all deferred to Phase 4 and beyond.

### Completion Criteria
Prisma is installed in the backend project and Prisma Client successfully connects to the Phase 1 local database. No schema, no tables, no migrations exist yet.

**Status: Complete** — 2026-09-19. Installed Prisma 7.10.0 (CLI) + `@prisma/client` 7.10.0 (kept pinned to matching versions — `npm install`'s "latest" tags for the two packages were briefly out of sync, CLI at an `8.0.0-rc` and client at `7.10.0`, resolved by pinning both to `7.10.0`). This Prisma version requires an explicit driver adapter (`@prisma/adapter-pg`) to connect to Postgres — there's no more implicit built-in engine-binary connection. Connection verified against `daymark_ledger_dev` via a throwaway script, then deleted. Schema remains bare (datasource + generator blocks only, zero models).

## Phase 4 — Full Prisma Setup

### Objective
Get Prisma's tooling fully configured and verified in the backend project, building on the bare connection established in Phase 3 — still no real tables or migrations.

### Scope
Scaffold the `schema.prisma` file (datasource, generator blocks), confirm `prisma generate`/`prisma migrate`/`prisma studio` tooling runs correctly against the Phase 1 local database, and verify the Prisma Client package builds/imports cleanly in the backend project. Explicitly excludes: designing or migrating any real entity models (Worker, Attendance, Advance, User/session — all deferred to later phases, starting with the User table in Phase 7), API route/business-logic implementation, auth logic, and any frontend work.

### Completion Criteria
Prisma's CLI tooling and Client generation work end-to-end against the Phase 1 database from the backend project. No tables, models, or migrations exist yet.

**Status: Complete** — 2026-09-19. Added `prisma:validate`/`prisma:format`/`prisma:generate`/`prisma:migrate:status`/`prisma:studio` npm scripts to `backend/package.json`, each pinned to `--config prisma7.config.ts` for self-documentation (the CLI was confirmed to already auto-discover `prisma7.config.ts` with zero flags — `Loaded Prisma config from prisma7.config.ts.` appears on every invocation regardless). `prisma validate` and `prisma format` both ran clean against the bare schema (format was a no-op). `prisma generate` regenerated `src/generated/prisma` successfully. `prisma migrate status` connected to `daymark_ledger_dev` and correctly reported the database as not yet managed by Prisma Migrate (exit code 1 — the CLI's expected signal for a DB with zero migration history, not a connectivity failure; no `migrate dev`/`migrate reset` was run, so no migration files were created). `prisma studio` was started, confirmed serving over HTTP, then stopped. Prisma Client + `@prisma/adapter-pg` compiling and connecting cleanly was reverified via a throwaway `backend/src/verify-phase4.ts` script (`npm run build` + `node dist/verify-phase4.js`), then deleted with no leftover `dist/` artifacts. Schema still has zero models; `prisma/migrations` still does not exist.

## Phase 5 — Creating Frontend Server

### Objective
Scaffold the React + Vite + TypeScript + Tailwind frontend project (see `ARCHITECTURE.md`'s planned stack) so it runs locally as a bare, working dev server — before any connection to the backend or real screens/routes exist.

### Scope
Project scaffolding only: initialize the Vite + React + TypeScript project, configure Tailwind CSS, set up folder structure and env-var handling, and confirm the dev server runs and serves a default/placeholder page in the browser. Explicitly excludes: any connection/API calls to the Phase 2 backend, routing, and the login screen, worker module, or other real screens (the prototype's screen designs — see `ARCHITECTURE.md`'s Prototype note — inform but do not get built out yet).

### Completion Criteria
The frontend project runs locally via its dev script and serves a page in the browser. No backend connection, no routing, and no real app screens exist yet.

**Status: Complete** — 2026-09-19. Scaffolded at `frontend/` via `npm create vite@latest frontend -- --template react-ts` (Vite 8, React 19, TypeScript). Tailwind CSS v4 installed via the `@tailwindcss/vite` plugin (CSS-first config — no `tailwind.config.js`/`postcss.config.js`; see `DECISIONS.md`). The demo scaffold content (counter, logos, sample CSS) was stripped per the owner's explicit direction that the placeholder page render as a plain blank white page — `App.tsx` renders an empty styled `<div>` only, with `import.meta.env.VITE_APP_NAME` logged to the console (not rendered) to prove the env-var mechanism works. `frontend/.env`/`.env.example` mirror the backend's tracked/gitignored pattern with one placeholder key; `VITE_API_BASE_URL` is deliberately deferred to Phase 6 per `ARCHITECTURE.md`. Verified via `npm run dev` (server boots on `http://localhost:5173/`, HTML/JS/CSS modules all served with 200s — the Claude-in-Chrome browser extension was unavailable in this session, so verification used direct HTTP checks against the dev server rather than a live browser render) and `npm run build` (clean `tsc -b && vite build`, producing `dist/` with no errors, including a non-empty compiled Tailwind CSS bundle confirming the pipeline runs). No routing, backend connection, or real screens exist yet.

## Phase 6 — Connecting Frontend, Backend, and Database

### Objective
Prove the full stack works end-to-end: the Phase 5 frontend can call the Phase 2 backend, which reads/writes the Phase 1 database via the Phase 4 Prisma schema, and the result makes it back to the browser.

### Scope
Add one minimal API round-trip — e.g. extend the Phase 2 health-check endpoint (or add one trivial endpoint) to run a raw/connection-check query via Prisma (no real tables exist yet at this point — see Phase 4) and return a result, and have the Phase 5 frontend fetch it and render the response. Include whatever local-dev plumbing this requires (CORS config, frontend API base URL/env var, etc.). Explicitly excludes: the login screen, auth, the worker module, and any other real business logic/screens — this phase only proves connectivity across all three layers, not feature functionality.

### Completion Criteria
Running the frontend and backend locally together, the frontend successfully displays data that traveled frontend → backend → database → backend → frontend.

**Status: Complete** — 2026-09-19. Added a Prisma Client singleton (`backend/src/db.ts`, `@prisma/adapter-pg` against `DATABASE_URL`) and a new `GET /api/db-check` endpoint (`backend/src/index.ts`) running `SELECT NOW()` via `$queryRaw` against the still-zero-model schema, returning `{ status, dbTime }`. `GET /health` was left untouched as a dependency-free liveness check. Added the `cors` package with an allow-listed origin (`CORS_ORIGIN` env var, defaulting to `http://localhost:5173`). Frontend gained a `VITE_API_BASE_URL` env var and `App.tsx` now fetches `/api/db-check` on mount and renders the result — this necessarily replaces Phase 5's intentionally blank page, since this phase's completion criteria requires visible fetched data. Verified with both dev servers running together: direct HTTP checks confirmed a real DB-sourced timestamp and the correct CORS header, `npm run build` compiled the backend cleanly, and — with the Claude-in-Chrome extension connected this session — an actual browser load of `http://localhost:5173` was confirmed rendering "Backend status: ok — DB time: ..." with zero console errors. No login, auth, or business logic/screens exist yet.

## Phase 7 — Login and Auth Backend

### Objective
Build the real login/auth backend per `DECISIONS.md`'s auth decision (database-backed sessions, bcrypt password hash, single admin account) — this phase runs the first real Prisma migration and gets a working, seeded admin login.

### Scope
Design and migrate the User/admin schema (the account's bcrypt-hashed password, plus a Session model with a hashed session ID — per `ARCHITECTURE.md`'s Authentication & Authorization section) — this is the first real migration, building on the Phase 4 tooling. Seed one admin user (credentials to be provided/set by the owner, not hardcoded defaults left in place). Implement backend login/logout endpoints and session-verification middleware. Explicitly excludes: the frontend login screen/UI (a later phase), and the Worker/Attendance/Advance schema and routes (their own later phase).

### Completion Criteria
The User/Session schema is migrated against the Phase 1 database, the admin user is seeded, and login/logout endpoints work end-to-end via a real HTTP request (e.g. through a REST client) — issuing and validating a database-backed session.

**Status: Complete** — 2026-09-19. Added a `User` model (unique `username`, bcrypt-hashed `passwordHash`, cost factor 12) and a `Session` model (SHA-256-hashed `hashedToken`, `userId` FK with cascade delete, `expiresAt`) to `backend/prisma/schema.prisma` and ran the project's first real migration (`prisma migrate dev --name add_user_session`) against `daymark_ledger_dev`. Added a seed script (`backend/prisma/seed.ts`, wired into `prisma7.config.ts`'s `migrations.seed` and a `prisma:seed` npm script) that reads `ADMIN_USERNAME`/`ADMIN_PASSWORD` from the environment (no hardcoded fallback) and upserts the single admin user — the owner supplied real credentials, stored only in the gitignored `backend/.env`. Implemented `POST /api/auth/login`, `POST /api/auth/logout`, and `GET /api/auth/me` (`backend/src/routes/auth.ts`), a `requireSession` middleware (`backend/src/middleware/requireSession.ts`), and shared auth helpers (`backend/src/lib/auth.ts`: bcrypt hash/compare, session token generation/hashing, cookie options — httpOnly, `sameSite: lax`, `secure` in production only, 30-day expiry). Added `bcrypt` and `cookie-parser` dependencies (plus `express.json()`/`cookieParser()` middleware and CORS `credentials: true` in `backend/src/index.ts`). Verified end-to-end via direct HTTP requests: wrong credentials → `401`; correct credentials → `200` with a `Set-Cookie` and a `Session` row holding only the hashed token; `GET /api/auth/me` → `200` with the cookie, `401` without; `POST /api/auth/logout` → clears the cookie, deletes the `Session` row, and a subsequent `/me` with the old cookie returns `401`. No frontend login UI, and no Worker/Attendance/Advance schema, exist yet.

## Phase 8 — Building the Frontend Login Screen

### Objective
Build the real login screen UI and wire it to the Phase 7 auth backend, so the admin can actually authenticate through the app.

### Scope
Build a dedicated login screen (username/password form, per `DECISIONS.md`'s login decision — not a PIN) in the Phase 5 frontend project; on submit, call the Phase 7 login endpoint, handle success (session established, e.g. via the browser automatically holding the session cookie) and failure (invalid-credentials error shown to the admin) states, and redirect to a placeholder authenticated area on success. Note: the prototype (see `ARCHITECTURE.md`'s Prototype note) did not cover a login screen, so its visual design is not yet established and may need a fresh design pass here. Explicitly excludes: the worker module, Manage Employees flow, and any other post-login app screens — those remain placeholder/stub content until their own later phases.

### Completion Criteria
The admin can enter credentials on the frontend login screen, submit, and successfully authenticate against the Phase 7 backend with a valid session maintained; invalid credentials show a visible error and do not authenticate.

**Status: Complete** — 2026-09-19. Added `react-router-dom` (two routes: `/login`, `/`) and a React Context-based `AuthProvider` (`frontend/src/context/AuthContext.tsx`) that checks `GET /api/auth/me` once on mount so an existing session survives a page reload, and exposes `login`/`logout` calling the Phase 7 endpoints. `RequireAuth` (`frontend/src/components/RequireAuth.tsx`) guards `/`, redirecting to `/login` when unauthenticated. `LoginScreen` (`frontend/src/components/LoginScreen.tsx`) is an AJAX-submitted (no page reload) username/password form; it shows the backend's error message inline on bad credentials and disables/relabels the submit button while pending. Its visual design was rebuilt once more the same day to match an owner-supplied mobile mockup: a navy curved/scooped header (an inline responsive SVG gradient shape, colors sampled from the reference image) with the app's real logo (`/logo.png`) centered in it, underline-style Username/Password fields (Password has a working show/hide eye-icon toggle), a "Remember Me" checkbox and a "Forgot Password?" line (both visual-only — no backend behavior exists for either yet, see `TASKS.md`), a full-width navy pill LOGIN button, and a small caps footer line reusing the prototype's tagline. This introduced three new `@theme` tokens (`--color-login-header-start/-end`, `--color-login-accent`, all navy) scoped to this screen — the app-wide teal `--color-brand`/`--color-brand-tint` tokens (matching the prototype, used by `HomePlaceholder`) are unchanged, so the login screen and the rest of the app intentionally use different accents for now. `HomePlaceholder` (`frontend/src/components/HomePlaceholder.tsx`) is the placeholder authenticated area — "Logged in as {username}" plus a working logout button — explicitly not the real home screen (Phase 10). A shared fetch wrapper (`frontend/src/lib/api.ts`) replaces the ad hoc pattern `App.tsx` used for Phase 6's `/api/db-check` demo, which this phase removes (superseded). Verified end-to-end in a live browser (Claude-in-Chrome): unauthenticated load redirects to `/login`; wrong credentials show "Invalid credentials" inline; correct credentials redirect to `/` and show the logged-in placeholder; reloading `/` in a fresh tab stays authenticated (proves session persistence via the cookie + on-mount `/me` check); logout redirects to `/login`, and reloading `/` afterward bounces back to `/login` (session actually cleared server-side). `npm run build` (`tsc -b && vite build`) compiles cleanly. No worker module, Manage Employees, or other post-login screens exist yet.

## Phase 9 — Home Screen Backend

### Objective
Build the backend the home screen needs: a list of workers with today's attendance status, and a way to change a worker's today-status inline — the first real domain migration, after Phase 7's User/Session.

### Scope
Design/migrate the Worker model (personal/employment info, per-day salary rate, Active/Inactive status) and the Attendance model (worker, date, status). The Attendance model is designed to support any date from the start, per `ARCHITECTURE.md`'s "editable for any date" invariant, even though this phase only exercises it for "today" — any-date editing is built out in Phase 11. Endpoints: list (active) workers with each one's today status; set/update a worker's status for today. All routes require a valid admin session (Phase 7 middleware).

Explicitly excludes: the Advance model, calculation endpoints, any-date attendance editing, Worker create/update-personal-info/Active-Inactive-toggle endpoints (Manage Employees territory — its own later phase), and document/photo handling.

### Completion Criteria
Worker and Attendance are migrated against the Phase 1 database; the list endpoint returns workers with correct today-status; the inline update endpoint successfully changes a worker's today-status — verified via real HTTP requests behind session auth.

**Status: Complete** — 2026-09-19. Added `WorkerStatus` (`ACTIVE`/`INACTIVE`) and `AttendanceStatus` (`PRESENT`/`HALF`/`ABSENT`) enums, a `Worker` model (`fullName`, `designation`, `contact`, `joiningDate` as `@db.Date`, `perDayRate` as `Decimal(10,2)`, `status`) and an `Attendance` model (`workerId`, `date` as `@db.Date`, `status`, with `@@unique([workerId, date])` enforcing one record per worker per date and an `@@index([date])` for future calendar queries) to `backend/prisma/schema.prisma`, migrated via `prisma migrate dev --name add_worker_attendance`. `backend/prisma/seed.ts` extended to upsert 8 sample workers (7 Active, 1 Inactive) since no create-worker endpoint exists yet (Phase 13). Added `backend/src/lib/date.ts` (`todayDateOnly()`, avoids the `@db.Date` off-by-one gotcha by anchoring the server's local calendar date at UTC midnight) and `backend/src/routes/workers.ts`: `GET /api/workers` (active workers only, each with `todayStatus` derived from a same-day `Attendance` join, `null` when no record exists yet) and `POST /api/workers/:id/attendance/today` (validates `status` against the enum or accepts `status: null` to clear the day's record, 404s on an unknown worker, upserts on the `(workerId, date)` unique key so repeated same-day changes update one row rather than duplicating) — both behind `requireSession`, mounted at `/api/workers` in `backend/src/index.ts`. Verified end-to-end via direct HTTP requests: unauthenticated → `401`; authenticated list returns only the 7 Active seed workers with `todayStatus: null`; setting `PRESENT` then `HALF` on the same worker/day updates one row in place (confirmed via a row-count check, not a duplicate); an invalid status string → `400`; a non-existent worker id → `404`. `npm run build` compiles cleanly. The `status: null` clear behavior (and the frontend toggle-off it enables) was added after initial completion, in response to the owner reporting that re-tapping an already-selected pill didn't unselect it — see the addendum below. No Advance model, any-date editing, or Worker create/update/toggle endpoints exist yet.

## Phase 10 — Home Screen Frontend

### Objective
Build the real home screen UI, wired to the Phase 9 backend with real data — the UX validated by the prototype (see `ARCHITECTURE.md`'s Prototype note), now built for real.

### Scope
List all (active) workers by full name and today's attendance status, with status changeable inline (tap a P/H/A pill), per `DECISIONS.md`'s navigation decision — backed by real Phase 9 API data, not the prototype's sample data. Tapping a worker's name should navigate toward a Worker Detail route/screen, but that screen's real content doesn't need to exist yet — a stub/placeholder page is enough until Phase 11 (backend) and its own later frontend phase are built. The floating quick-actions menu button may appear as a UI element, but its entries (Create New Employee, Manage Employees, Reporting, Settings) remain non-functional placeholders — each is wired up in its own later phase.

Explicitly excludes: the real Worker Detail screen (calendar, salary config, totals, advance history), Manage Employees, Create New Employee, and Reporting/Settings.

### Completion Criteria
The admin can load the home screen with real worker data and change a worker's today-status inline — backed by real Phase 9 API calls, no mock/sample data.

**Status: Complete** — 2026-09-19. Built alongside Phase 9 in the same pass (owner's explicit direction, so there'd be an actual working screen to review rather than just an API) rather than the roadmap's default backend-then-frontend split; Phase 9's own scope/completion criteria were still met in full first. Added `frontend/src/types/worker.ts` (`Worker`, `AttendanceStatus` types), status-color `@theme` tokens in `frontend/src/index.css` (Present/Half/Absent bg+fg pairs, exact hex values matching the UI prototype, plus neutral pill colors — app-wide, not screen-scoped, since Phase 12's calendar will reuse them), and three new components: `StatusPill.tsx` (a single P/H/A pill, filled when active), `WorkerRow.tsx` (avatar with deterministic-by-id pastel color + initials, name linking to `/workers/:id`, three `StatusPill`s), and `HomeScreen.tsx` (the real screen — header with the app logo mark/name/today's date and the admin's initial avatar via `useAuth()`, a "Workers (N)" list fetched from `GET /api/workers` on mount, and the floating quick-actions button/menu). Status-pill taps update optimistically (immediate local UI change, `POST .../attendance/today` fired in the background, reverted on failure) to match the prototype's instant, confirmation-free feedback. The quick-actions menu's four entries (Create New Employee, Reporting, Manage Employees, Settings) render matching the prototype exactly but remain non-functional placeholders (`onClick` only closes the menu) — each is wired up in its own later phase, per this phase's explicit scope. Added `WorkerDetailStub.tsx` (a minimal placeholder read via `useParams()`) and a new `/workers/:id` route in `App.tsx`, both `RequireAuth`-wrapped; `HomeScreen` replaces `HomePlaceholder` at `/`, and `HomePlaceholder.tsx` was deleted as fully superseded. The screen is laid out mobile-first (`h-dvh`, internally scrolling list, fixed-position FAB/menu) and, on wider viewports, centers itself as a fixed-aspect mobile card (`sm:` breakpoint, capped to the viewport height) — the same desktop-preview treatment `LoginScreen` already established — per the owner's explicit "mobile view focused" direction. Verified end-to-end in a live browser (Claude-in-Chrome): unauthenticated load redirects to `/login`; after login the header, date, admin avatar, and "Workers (7)" (the 7 Active seed workers; the 1 Inactive seed worker correctly excluded) all render correctly; tapping a status pill fills it immediately, the corresponding `POST` request was confirmed via network inspection, and the change survived a full page reload (proving server-side persistence, not just optimistic UI); tapping a worker's name navigated to the `/workers/:id` stub; the FAB opened/closed correctly (rotating into an "X"), showed all four placeholder items in the prototype's specified order, and tapping one closed the menu without navigating or erroring; zero console errors throughout. `npm run build` (`tsc -b && vite build`) compiles cleanly. No Manage Employees, Create Employee, Reporting, Settings, or real Worker Detail content exist yet — those remain future phases exactly as scoped.

**Post-completion refinements** (owner feedback after reviewing the live screen, 2026-09-19, superseding some details above rather than the phase's scope/completion criteria): the header's flat checkmark mark was replaced with the real app logo (`/logo.png`), then the header was simplified to just the logo/date on the left and the logged-in admin's username in place of the "Daymark Ledger" heading — the admin-initial avatar circle and the separate "Signed in" text block were removed entirely, so `useAuth()`'s `user` is now only used for the username display, not an avatar. Worker-row avatar/name sizing, status-pill sizing, row spacing, and the FAB were all reduced (avatar 38px→32px, pill 28px→24px, FAB 56px→40px, tighter row padding/gaps) so more of the list fits on screen without scrolling. Separately, tapping an already-active status pill previously re-sent the same status instead of clearing it — fixed by extending `POST /api/workers/:id/attendance/today` to accept `status: null` (deletes that day's `Attendance` row rather than storing a null status) and having `WorkerRow` send `null` when the tapped pill matches the worker's current `todayStatus`; verified via a live browser check (tap to set → tap again to unset → reload confirms the record was actually deleted server-side, not just cleared optimistically). The quick-actions menu's four buttons gained a visible border (`border border-ink/40`, tuned after two rounds of feedback — first too faint, then too heavy) so they read as distinct buttons rather than blending into the white card background. A logout icon button (top-right of the header) was added/restored — `HomeScreen` now also calls `useAuth()`'s `logout()` directly (Phase 8's `HomePlaceholder` had a logout button; it wasn't carried over when `HomeScreen` replaced it, so this closes that gap) — verified end-to-end in a live browser: clicking it clears the session and redirects to `/login`.

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
