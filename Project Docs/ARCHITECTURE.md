# Architecture

This describes the **actual current implementation** — a local Postgres database, a bare Express/TypeScript backend scaffold, and Prisma Client connected to it, per Phases 1–3 — followed by the **planned** architecture per the chosen production stack for everything not yet built. See `DECISIONS.md` for the reasoning behind decisions already made, and `TASKS.md` for what's still open.

## System Overview

**Implemented:** A local PostgreSQL 18 database (`daymark_ledger_dev`, see Phase 1 in `PHASES.md`), an Express 5 + TypeScript backend (`backend/`, see Phase 2 in `PHASES.md`) with a `GET /health` liveness endpoint, a `GET /api/db-check` endpoint (Phase 6) proving DB connectivity via a raw Prisma query, and a real auth backend (Phase 7): `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, and session-verification middleware, backed by Prisma's first real migration (`User`/`Session` models). Prisma (CLI + Client, see Phases 3–4, 7 in `PHASES.md`) is installed, connected to that database via a Postgres driver adapter, with its CLI tooling (`generate`/`validate`/`format`/`migrate dev`/`migrate status`/`studio`/`seed`) fully verified via `backend/package.json`'s `prisma:*` scripts. A React 19 + Vite 8 + TypeScript + Tailwind CSS v4 frontend (`frontend/`, see Phase 5 in `PHASES.md`) now has a real, working login screen wired to the Phase 7 backend, `react-router-dom`-based routing, and a Context-based auth state (Phase 8) — the full frontend → backend → database → backend → frontend round trip (Phase 6) is proven, and now gated behind real authentication end-to-end. No worker/business screens exist in the frontend yet (Phase 9+). The repository also contains this `Project Docs/` documentation system and a `Prototype/` folder (see "Prototype" below).

**Prototype (2026-09-18, not production code):** An interactive, non-functional UI prototype — a mobile view (390×844), built as a Claude Artifact (Design Component format, `<x-dc>`/`DCLogic`, not React/Vite) — lives at `Prototype/project/Main.dc.html` in this repo, with the live/editable version linked from `Prototype/README.md`. It uses in-memory sample data only (no backend, no persistence) and exists purely to validate the UX before real implementation. Screens covered: Worker List (home, with inline today-status change), Worker Detail (attendance calendar, salary config, salary/advance totals, advance history), a floating quick-actions menu, Manage Employees List, Manage Employee Edit (Active/Inactive toggle, personal-info edit, document add/remove), Create New Employee, and placeholder "coming soon" screens for Reporting and Settings (not yet designed — see `TASKS.md`). This prototype's screen/data shape should inform, but does not replace, the real Prisma schema and API design once implementation starts.

**Planned:** A normal client-server web app — a React frontend talking to a Node/Express REST API backend, backed by a PostgreSQL database — gated by a dedicated login screen, accessible from any device with internet access (not an offline-only/local-storage app; see `DECISIONS.md`'s production stack decision). Provides a per-worker module (profile, monthly attendance calendar, salary configuration, auto-calculated salary/advance totals) plus a separate Manage Employees flow (see `PROJECT.md` for the full feature set, and DECISIONS.md's prototype navigation decision).

## Technology Stack

- **Frontend (implemented, Phases 5–6, 8):** React 19 + Vite 8 + TypeScript, scaffolded at `frontend/` via `npm create vite@latest frontend -- --template react-ts`, run via npm scripts (`dev`, `build` via `tsc -b && vite build`, `preview`). Tailwind CSS v4 wired in via the `@tailwindcss/vite` plugin — CSS-first config, no `tailwind.config.js`/`postcss.config.js` (see `DECISIONS.md`); a `@theme` block in `index.css` carries the app-wide brand tokens (teal primary, warm stone neutrals, Manrope font — matching the prototype, used by `HomePlaceholder`) plus a second, screen-scoped set of navy tokens (`--color-login-header-start/-end`, `--color-login-accent`) used only by `LoginScreen`, whose visual design was rebuilt to match an owner-supplied mobile mockup rather than the app-wide prototype brand (see Phase 8's note in `PHASES.md`). `react-router-dom` provides routing (`/login`, `/`), and a Context-based `AuthProvider` (see "Authentication & Authorization" below) tracks session state, checking `GET /api/auth/me` once on mount. `App.tsx`'s Phase 6 `/api/db-check` demo fetch has been removed (superseded by the real login flow).
- **Backend (implemented, Phases 2, 6):** Node.js + **Express 5** + TypeScript, exposing a REST API, run via npm scripts (`dev` via `tsx watch`, `build` via `tsc`, `start` via compiled `dist/`). CORS is enabled via the `cors` package, allow-listing an origin (`CORS_ORIGIN` env var, defaults to `http://localhost:5173`), but is currently unused by local dev — the frontend's Vite dev-server proxy (see below and `DECISIONS.md`) makes requests same-origin from the browser's perspective, so no cross-origin request actually occurs in dev. The CORS middleware is left in place for direct/cross-origin access (e.g. non-browser clients, or a future production topology) rather than removed. Next.js is explicitly not part of the default stack — see `DECISIONS.md` for the condition under which it could be introduced later.
- **Database (implemented, Phase 1):** PostgreSQL 18, local dev database `daymark_ledger_dev` on the native Windows service.
- **ORM (implemented, Phases 3–4, 7):** Prisma 7.10.0 (CLI + `@prisma/client`, pinned to matching versions), connected to Postgres via `@prisma/adapter-pg` (this Prisma version requires an explicit driver adapter — no built-in engine-binary connection). Config lives in `prisma7.config.ts` (not `schema.prisma`'s `env()`, per this version's setup) and is auto-discovered by the CLI despite its non-default filename. `backend/package.json`'s `prisma:validate`/`prisma:format`/`prisma:generate`/`prisma:migrate:dev`/`prisma:migrate:status`/`prisma:studio`/`prisma:seed` npm scripts wrap the CLI (each pinned to `--config prisma7.config.ts` for self-documentation) and are all confirmed working end-to-end against `daymark_ledger_dev`. Schema now has its first models, `User`/`Session` (see `PHASES.md` Phase 7).
- **Auth (implemented, Phase 7):** Database-backed sessions (SHA-256-hashed session token) + bcrypt-hashed account password (cost factor 12), a single seeded admin account. See "Authentication & Authorization" below.
- **Hosting/PaaS:** Not yet chosen — see `TASKS.md`.

## Application Structure

**Monorepo** (single git repo, resolved by Phase 2): top-level `backend/` (Express + TypeScript, scaffolded) and `frontend/` (React/Vite, scaffolded Phase 5) directories, communicating over a REST API (first round trip proven Phase 6). No npm workspaces/build-orchestration tool (e.g. Turborepo) — each app has its own standalone `package.json`; revisit only if a concrete cross-package sharing need arises.

`backend/` layout (as of Phase 7):
```text
backend/
  src/
    index.ts               — Express app bootstrap; GET /health (liveness), GET /api/db-check (Phase 6), mounts /api/auth (Phase 7); express.json()/cookieParser() wired in
    db.ts                   — Prisma Client singleton (PrismaClient + @prisma/adapter-pg)
    lib/
      auth.ts                — bcrypt hash/compare, session token generation + SHA-256 hashing, cookie name/options
    middleware/
      requireSession.ts      — reads the session cookie, validates it against the Session table, attaches req.user or responds 401
    routes/
      auth.ts                 — POST /login, POST /logout, GET /me
    generated/prisma/      — generated Prisma Client (gitignored, regenerated via `prisma generate`)
  prisma/
    schema.prisma          — User + Session models (first real migration, Phase 7)
    seed.ts                 — seeds the single admin user from ADMIN_USERNAME/ADMIN_PASSWORD env vars
    migrations/              — first migration: add_user_session
  prisma7.config.ts        — Prisma config (schema path, migrations path + seed command, datasource URL from env)
  .env                     — local env vars incl. DATABASE_URL, CORS_ORIGIN, ADMIN_USERNAME, ADMIN_PASSWORD (gitignored)
  .env.example             — committed template (PORT, CORS_ORIGIN, DATABASE_URL shape, ADMIN_USERNAME/ADMIN_PASSWORD placeholders)
  package.json
  tsconfig.json
```

`frontend/` layout (as of Phase 8):
```text
frontend/
  src/
    main.tsx                — React root bootstrap
    App.tsx                 — wraps AuthProvider + BrowserRouter; defines /login and / (guarded by RequireAuth) routes
    context/
      AuthContext.tsx         — AuthProvider + useAuth(): checks GET /api/auth/me on mount, exposes login()/logout()
    components/
      LoginScreen.tsx          — AJAX-submitted username/password form (navy curved-header mobile design, see Phase 8's note in PHASES.md), calls useAuth().login()
      HomePlaceholder.tsx      — placeholder post-login screen ("Logged in as {username}" + logout) — not the real home screen (Phase 10)
      RequireAuth.tsx          — route guard: redirects to /login when unauthenticated
    lib/
      api.ts                   — shared fetch wrapper (getJson/postJson), credentials: "include", parses the {status, message} envelope
    index.css                — @import "tailwindcss" (Tailwind v4 entry point) + a @theme block with app-wide brand tokens and LoginScreen-scoped navy tokens
  public/
    logo.png                 — the app's real logo (transparent PNG); also used as the favicon
  index.html                — favicon points at /logo.png; includes the Manrope Google Font link
  vite.config.ts            — @vitejs/plugin-react + @tailwindcss/vite; server.proxy forwards /api and /health to http://localhost:3001 (see DECISIONS.md)
  .env                      — local env vars incl. VITE_APP_NAME (gitignored)
  .env.example              — committed template
  package.json
  tsconfig.json / tsconfig.app.json / tsconfig.node.json
```

## Component Structure

**Login screen implemented (Phase 8); remaining screens planned** (breakdown validated by the prototype — see "Prototype" above):
- ~~A login screen.~~ Implemented — `LoginScreen` + `AuthContext`/`RequireAuth` (Phase 8). No prototype reference existed for it; its current visual design follows an owner-supplied mobile mockup (navy curved header, underline fields, pill button) rather than the prototype's teal brand tokens — see Technology Stack above and Phase 8's note in `PHASES.md`.
- A home screen listing all workers by full name and today's attendance status, with status changeable inline from the list. (A non-functional placeholder, `HomePlaceholder`, exists post-login for now — see Phase 8's completion note in `PHASES.md`.)
- A worker module per worker (opened by tapping their name from the home list), containing: a personal/employment-info section (with document and photo upload), a monthly attendance calendar, and a salary-configuration/calculation section.
- A monthly calendar component per worker, color-coded per day (Green = Present, Yellow = Half day, Red = Absent), with per-status counts shown below it, and every day tappable/editable regardless of date.
- A day-tap popup for setting a day's attendance status, containing an "Advance Salary" checkbox that reveals a ₹-prefixed amount input when checked.
- A floating quick-actions menu (Create New Employee, Manage Employees, Reporting, Settings).
- A Manage Employees flow, separate from the worker module above: a list of all workers, and a per-worker edit screen for Active/Inactive status, personal-info edits, and document management.
- A Create New Employee form.
- Reporting and Settings screens are named/reserved in the navigation but **not yet designed** — see `TASKS.md`.

## Data Flow

**Planned, not yet implemented:** Setting a day's attendance status (and, optionally, an advance-salary amount) in the day popup is the only manual data entry point for attendance/advances. The frontend sends this to the backend over the REST API, which persists it to PostgreSQL. All salary and advance totals — total earned with/without advance deducted, running-month advance total, whole-year advance total plus remaining owed — are derived/auto-calculated from that stored data (computed server-side or client-side from fetched records; not yet decided which), never entered directly.

## State Management

**Decided (Phase 8), scoped to auth so far:** React Context (`AuthContext`/`AuthProvider`, `frontend/src/context/AuthContext.tsx`) holds auth/session state (`status`, `user`) app-wide, with a `useAuth()` hook for consumers. No broader app-wide state-management library (Redux, Zustand, TanStack Query, etc.) has been introduced — revisit only if a concrete need arises once real data-fetching screens (Phase 9+) are built.

## Routing

**Decided (Phase 8):** `react-router-dom`, chosen now (rather than deferred) since this is the first phase needing to switch between screens. Two routes exist so far: `/login` (`LoginScreen`) and `/` (`HomePlaceholder`, wrapped in `RequireAuth`). Future phases are expected to add routes under this same router rather than introducing a different routing approach.

## API Architecture

**Auth endpoints implemented (Phase 7), other business endpoints still planned:** A REST API served by the Express backend, CORS-enabled for the frontend's origin (with `credentials: true` so the session cookie is sent). `GET /health` (Phase 2, liveness only), `GET /api/db-check` (Phase 6), and `/api/auth/login` / `/api/auth/logout` / `/api/auth/me` (Phase 7) exist under this pattern; the `/api` prefix is intended for future business routes. Remaining endpoints/resource shape not yet designed — implied by the data model: workers (CRUD + Active/Inactive status), attendance (per worker, per date), and advances (per worker, dated entries), plus whatever endpoints the auto-calculated totals need — all of which will require a valid admin session via the Phase 7 `requireSession` middleware. Not yet decided whether totals are computed server-side (returned pre-calculated) or client-side (raw records fetched, calculated in the frontend).

## Data / Persistence

**Connection implemented (Phase 3); User/Session schema implemented (Phase 7), domain schema not yet designed:** PostgreSQL 18 (`daymark_ledger_dev` locally), accessed via Prisma Client + `@prisma/adapter-pg`, confirmed connecting successfully. One central database is the single source of truth for all devices — this is the mechanism that satisfies the "open on any device" requirement (see `DECISIONS.md`). The first real migration (Phase 7) added `User` (bcrypt-hashed `passwordHash`) and `Session` (SHA-256-hashed `hashedToken`, `expiresAt`, cascading FK to `User`). Per-worker data (profile, documents, photo, attendance-by-date, advance entries, salary rate) will persist in the database and must survive a worker being marked Inactive and later reactivated — historical attendance/salary data must remain intact across that transition. That domain schema is not yet designed — starts in Phase 9 (Worker/Attendance) per `PHASES.md`.

## Authentication & Authorization

**Implemented (Phase 7):** A single admin account, seeded via `backend/prisma/seed.ts` from `ADMIN_USERNAME`/`ADMIN_PASSWORD` env vars (no hardcoded credentials). `POST /api/auth/login` checks the submitted password against the bcrypt hash (cost factor 12) stored on `User.passwordHash`; on success, a random 32-byte session token is generated, its SHA-256 hash + a 30-day `expiresAt` are stored on a new `Session` row (never the raw token — satisfies the "hashed before storage" requirement), and the raw token is set as an httpOnly cookie (`sameSite: lax`, `secure` in production only) for the client to hold. `GET /api/auth/me`, behind the `requireSession` middleware, hashes the incoming cookie token and looks it up against `Session` to authenticate a request. `POST /api/auth/logout` deletes the matching `Session` row and clears the cookie. This is deliberately not a stateless JWT approach — a database-backed session allows the session to be revoked/invalidated server-side at any time (e.g. logout deletes the row immediately). No worker-facing accounts, no multi-admin support, no OAuth/social login. **Frontend (Phase 8):** `AuthContext`/`AuthProvider` checks `GET /api/auth/me` once on mount (so a page reload doesn't force re-login within the 30-day session), and `LoginScreen`/`HomePlaceholder` call `login()`/`logout()` against the Phase 7 endpoints; `RequireAuth` gates the placeholder home route. Not yet built: applying `requireSession` to future business routes (Phase 9+).

## External Integrations

None planned.

## Build & Runtime

**Backend (implemented, Phase 2):** `npm run dev` (`tsx watch src/index.ts`) for local development; `npm run build` (`tsc` to `dist/`) + `npm start` (`node dist/index.js`) for a compiled run — both verified working. **Frontend (implemented, Phase 5):** `npm run dev` (Vite dev server, `http://localhost:5173/`) for local development; `npm run build` (`tsc -b && vite build` to `dist/`) + `npm run preview` for a compiled/production-preview run — both verified working. **Database (Phases 3–4, 7):** Prisma Client connects to PostgreSQL via `@prisma/adapter-pg`. `backend/package.json`'s `prisma:generate`, `prisma:validate`, `prisma:format`, `prisma:migrate:dev`, `prisma:migrate:status`, `prisma:studio`, and `prisma:seed` scripts wrap the corresponding CLI commands and are all confirmed working against `daymark_ledger_dev` — the first migration (`add_user_session`, Phase 7) has been applied.

## Architectural Boundaries

A clear frontend/backend split communicating only over the REST API is now proven in practice (Phase 6): the frontend never talks to PostgreSQL directly, only to the Express backend over HTTP/CORS, which is the only thing that talks to Prisma/Postgres. Within the backend, auth concerns are now separated into `lib/` (stateless helpers), `middleware/` (request-level session verification), and `routes/` (HTTP handlers) — the convention future business routes (Phase 9+) are expected to follow. No domain/business logic exists yet.

## Important Invariants

These hold regardless of further implementation detail, since they come directly from the specification (`PROJECT.md`) and the production stack decision (`DECISIONS.md`):

- Half-day pay is always exactly **0.5 × the per-day rate** — a flat rule applied identically to every worker, not configurable per worker.
- Workers are **never deleted** — a worker who stops working is marked Inactive, not removed; reactivating them later must preserve all prior attendance/salary/advance history intact.
- Attendance must be editable for **any date**, past or present — backfilling/correcting a prior day's status is a core requirement, not an edge case to special-case away.
- Advance salary is logged as **individual dated entries** (date + amount) — never collapsed into or replaced by a single manually-edited running-balance field.
- All salary/advance totals shown to the admin are **auto-calculated** from attendance and advance entries — never a manually-entered figure.
- This is a hosted client-server app, not an offline-only tool — the frontend requires connectivity to the backend API to function. Do not reintroduce local-only storage (e.g. IndexedDB as the source of truth) without an explicit owner decision superseding the production stack decision in `DECISIONS.md`.
- Sessions are database-backed with a hashed session ID, and the account password is bcrypt-hashed — never store either in plaintext, and never switch to stateless JWTs without an explicit owner decision, since revocability was the deliberate reason for this choice.
