# Architecture

This describes the **actual current implementation** — a local Postgres database, a bare Express/TypeScript backend scaffold, and Prisma Client connected to it, per Phases 1–3 — followed by the **planned** architecture per the chosen production stack for everything not yet built. See `DECISIONS.md` for the reasoning behind decisions already made, and `TASKS.md` for what's still open.

## System Overview

**Implemented:** A local PostgreSQL 18 database (`daymark_ledger_dev`, see Phase 1 in `PHASES.md`), a scaffolded Express 5 + TypeScript backend (`backend/`, see Phase 2 in `PHASES.md`) with a `GET /health` liveness endpoint and a `GET /api/db-check` endpoint (Phase 6) proving DB connectivity via a raw Prisma query, and Prisma (CLI + Client, see Phases 3–4 in `PHASES.md`) installed, connected to that database via a Postgres driver adapter, and with its CLI tooling (`generate`/`validate`/`format`/`migrate status`/`studio`) fully verified via `backend/package.json`'s `prisma:*` scripts — no schema/models, migrations, or auth yet. A scaffolded React 19 + Vite 8 + TypeScript + Tailwind CSS v4 frontend (`frontend/`, see Phase 5 in `PHASES.md`) fetches `/api/db-check` on load and renders the result (Phase 6) — the full frontend → backend → database → backend → frontend round trip is proven working; no routing, auth, or real business screens yet. The repository also contains this `Project Docs/` documentation system and a `Prototype/` folder (see "Prototype" below).

**Prototype (2026-09-18, not production code):** An interactive, non-functional UI prototype — a mobile view (390×844), built as a Claude Artifact (Design Component format, `<x-dc>`/`DCLogic`, not React/Vite) — lives at `Prototype/project/Main.dc.html` in this repo, with the live/editable version linked from `Prototype/README.md`. It uses in-memory sample data only (no backend, no persistence) and exists purely to validate the UX before real implementation. Screens covered: Worker List (home, with inline today-status change), Worker Detail (attendance calendar, salary config, salary/advance totals, advance history), a floating quick-actions menu, Manage Employees List, Manage Employee Edit (Active/Inactive toggle, personal-info edit, document add/remove), Create New Employee, and placeholder "coming soon" screens for Reporting and Settings (not yet designed — see `TASKS.md`). This prototype's screen/data shape should inform, but does not replace, the real Prisma schema and API design once implementation starts.

**Planned:** A normal client-server web app — a React frontend talking to a Node/Express REST API backend, backed by a PostgreSQL database — gated by a dedicated login screen, accessible from any device with internet access (not an offline-only/local-storage app; see `DECISIONS.md`'s production stack decision). Provides a per-worker module (profile, monthly attendance calendar, salary configuration, auto-calculated salary/advance totals) plus a separate Manage Employees flow (see `PROJECT.md` for the full feature set, and DECISIONS.md's prototype navigation decision).

## Technology Stack

- **Frontend (implemented, Phases 5–6):** React 19 + Vite 8 + TypeScript, scaffolded at `frontend/` via `npm create vite@latest frontend -- --template react-ts`, run via npm scripts (`dev`, `build` via `tsc -b && vite build`, `preview`). Tailwind CSS v4 wired in via the `@tailwindcss/vite` plugin — CSS-first config, no `tailwind.config.js`/`postcss.config.js` (see `DECISIONS.md`). `App.tsx` fetches the backend's `/api/db-check` endpoint on mount (via `VITE_API_BASE_URL`) and renders the response; no routing or real screens yet (Phase 8+).
- **Backend (implemented, Phases 2, 6):** Node.js + **Express 5** + TypeScript, exposing a REST API, run via npm scripts (`dev` via `tsx watch`, `build` via `tsc`, `start` via compiled `dist/`). CORS enabled via the `cors` package, allow-listing the frontend origin (`CORS_ORIGIN` env var, defaults to `http://localhost:5173`) — chosen over a Vite dev proxy so the dev-time connectivity mirrors the planned production topology of separate frontend/backend origins (see `DECISIONS.md`). Next.js is explicitly not part of the default stack — see `DECISIONS.md` for the condition under which it could be introduced later.
- **Database (implemented, Phase 1):** PostgreSQL 18, local dev database `daymark_ledger_dev` on the native Windows service.
- **ORM (implemented, Phases 3–4):** Prisma 7.10.0 (CLI + `@prisma/client`, pinned to matching versions), connected to Postgres via `@prisma/adapter-pg` (this Prisma version requires an explicit driver adapter — no built-in engine-binary connection). Config lives in `prisma7.config.ts` (not `schema.prisma`'s `env()`, per this version's setup) and is auto-discovered by the CLI despite its non-default filename. `backend/package.json`'s `prisma:validate`/`prisma:format`/`prisma:generate`/`prisma:migrate:status`/`prisma:studio` npm scripts wrap the CLI (each pinned to `--config prisma7.config.ts` for self-documentation) and are all confirmed working end-to-end against `daymark_ledger_dev`. Schema still has zero models (see `PHASES.md` Phase 7).
- **Auth:** Database-backed sessions (hashed session ID) + bcrypt-hashed account password — planned, not yet implemented (see `PHASES.md` Phase 7).
- **Hosting/PaaS:** Not yet chosen — see `TASKS.md`.

## Application Structure

**Monorepo** (single git repo, resolved by Phase 2): top-level `backend/` (Express + TypeScript, scaffolded) and `frontend/` (React/Vite, scaffolded Phase 5) directories, communicating over a REST API (first round trip proven Phase 6). No npm workspaces/build-orchestration tool (e.g. Turborepo) — each app has its own standalone `package.json`; revisit only if a concrete cross-package sharing need arises.

`backend/` layout as scaffolded:
```text
backend/
  src/
    index.ts               — Express app bootstrap; GET /health (liveness), GET /api/db-check (Phase 6, raw Prisma query)
    db.ts                   — Prisma Client singleton (PrismaClient + @prisma/adapter-pg)
    generated/prisma/      — generated Prisma Client (gitignored, regenerated via `prisma generate`)
  prisma/
    schema.prisma          — datasource + generator blocks only, zero models yet
  prisma7.config.ts        — Prisma config (schema path, migrations path, datasource URL from env)
  .env                     — local env vars incl. DATABASE_URL, CORS_ORIGIN (gitignored)
  .env.example             — committed template (PORT, CORS_ORIGIN, DATABASE_URL shape)
  package.json
  tsconfig.json
```

`frontend/` layout as scaffolded (Phases 5–6):
```text
frontend/
  src/
    main.tsx                — React root bootstrap
    App.tsx                 — fetches GET /api/db-check on mount (via VITE_API_BASE_URL) and renders the result; logs VITE_APP_NAME to console
    index.css                — @import "tailwindcss" (Tailwind v4 entry point)
  public/
    favicon.svg
  index.html
  vite.config.ts            — @vitejs/plugin-react + @tailwindcss/vite
  .env                      — local env vars incl. VITE_APP_NAME, VITE_API_BASE_URL (gitignored)
  .env.example              — committed template
  package.json
  tsconfig.json / tsconfig.app.json / tsconfig.node.json
```

## Component Structure

**Planned, not yet implemented** (screen breakdown validated by the prototype — see "Prototype" above):
- A login screen.
- A home screen listing all workers by full name and today's attendance status, with status changeable inline from the list.
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

**Not yet decided.**

## Routing

**Not yet decided.**

## API Architecture

**First endpoint implemented (Phase 6), business endpoints still planned:** A REST API served by the Express backend, CORS-enabled for the frontend's origin. `GET /health` (Phase 2, liveness only) and `GET /api/db-check` (Phase 6, runs `SELECT NOW()` via Prisma and returns `{ status, dbTime }`) exist under this pattern; the `/api` prefix is intended for future business routes. Real endpoints/resource shape not yet designed — implied by the data model: auth (login/logout), workers (CRUD + Active/Inactive status), attendance (per worker, per date), and advances (per worker, dated entries), plus whatever endpoints the auto-calculated totals need. Not yet decided whether totals are computed server-side (returned pre-calculated) or client-side (raw records fetched, calculated in the frontend).

## Data / Persistence

**Connection implemented (Phase 3), schema not yet designed:** PostgreSQL 18 (`daymark_ledger_dev` locally), accessed via Prisma Client + `@prisma/adapter-pg`, confirmed connecting successfully. One central database is the single source of truth for all devices — this is the mechanism that satisfies the "open on any device" requirement (see `DECISIONS.md`). Per-worker data (profile, documents, photo, attendance-by-date, advance entries, salary rate) will persist in the database and must survive a worker being marked Inactive and later reactivated — historical attendance/salary data must remain intact across that transition. Exact schema (tables/relations, first migration) not yet designed — starts in Phase 7 (User/Session) per `PHASES.md`.

## Authentication & Authorization

**Planned (decided 2026-09-18, not yet implemented):** A single admin account. Login checks the submitted password against a bcrypt hash stored in the database; on success, a session is created and stored in the database with its session ID hashed before storage (not stored in plaintext), and a reference to that session held by the client (e.g. a cookie) for subsequent requests. This is deliberately not a stateless JWT approach — a database-backed session allows the session to be revoked/invalidated server-side at any time. No worker-facing accounts, no multi-admin support, no OAuth/social login.

## External Integrations

None planned.

## Build & Runtime

**Backend (implemented, Phase 2):** `npm run dev` (`tsx watch src/index.ts`) for local development; `npm run build` (`tsc` to `dist/`) + `npm start` (`node dist/index.js`) for a compiled run — both verified working. **Frontend (implemented, Phase 5):** `npm run dev` (Vite dev server, `http://localhost:5173/`) for local development; `npm run build` (`tsc -b && vite build` to `dist/`) + `npm run preview` for a compiled/production-preview run — both verified working. **Database (Phases 3–4):** Prisma Client connects to PostgreSQL via `@prisma/adapter-pg`. `backend/package.json`'s `prisma:generate`, `prisma:validate`, `prisma:format`, `prisma:migrate:status`, and `prisma:studio` scripts wrap the corresponding CLI commands and are all confirmed working against `daymark_ledger_dev` — no migrations exist yet (first migration is Phase 7's User/Session schema).

## Architectural Boundaries

A clear frontend/backend split communicating only over the REST API is now proven in practice (Phase 6): the frontend never talks to PostgreSQL directly, only to the Express backend over HTTP/CORS, which is the only thing that talks to Prisma/Postgres. No further module boundaries drawn yet — no business logic exists.

## Important Invariants

These hold regardless of further implementation detail, since they come directly from the specification (`PROJECT.md`) and the production stack decision (`DECISIONS.md`):

- Half-day pay is always exactly **0.5 × the per-day rate** — a flat rule applied identically to every worker, not configurable per worker.
- Workers are **never deleted** — a worker who stops working is marked Inactive, not removed; reactivating them later must preserve all prior attendance/salary/advance history intact.
- Attendance must be editable for **any date**, past or present — backfilling/correcting a prior day's status is a core requirement, not an edge case to special-case away.
- Advance salary is logged as **individual dated entries** (date + amount) — never collapsed into or replaced by a single manually-edited running-balance field.
- All salary/advance totals shown to the admin are **auto-calculated** from attendance and advance entries — never a manually-entered figure.
- This is a hosted client-server app, not an offline-only tool — the frontend requires connectivity to the backend API to function. Do not reintroduce local-only storage (e.g. IndexedDB as the source of truth) without an explicit owner decision superseding the production stack decision in `DECISIONS.md`.
- Sessions are database-backed with a hashed session ID, and the account password is bcrypt-hashed — never store either in plaintext, and never switch to stateless JWTs without an explicit owner decision, since revocability was the deliberate reason for this choice.
