# Architecture

This describes the **actual current implementation** — which is nothing; no code has been written yet — followed by the **planned** architecture per the chosen production stack. See `DECISIONS.md` for the reasoning behind decisions already made, and `TASKS.md` for what's still open.

## System Overview

**Implemented:** Nothing. The repository contains only this `Project Docs/` documentation system.

**Planned:** A normal client-server web app — a React frontend talking to a Node/Express REST API backend, backed by a PostgreSQL database — gated by a dedicated login screen, accessible from any device with internet access (not an offline-only/local-storage app; see `DECISIONS.md`'s production stack decision). Provides a per-worker module (profile, monthly attendance calendar, salary configuration, auto-calculated salary/advance totals). See `PROJECT.md` for the full feature set.

## Technology Stack

**Planned (decided 2026-09-18, not yet implemented):**
- **Frontend:** React + Vite + TypeScript + Tailwind CSS.
- **Backend:** Node.js + Express + TypeScript, exposing a REST API. Next.js is explicitly not part of the default stack — see `DECISIONS.md` for the condition under which it could be introduced later.
- **Database:** PostgreSQL 18.
- **ORM:** Prisma.
- **Auth:** Database-backed sessions (hashed session ID) + bcrypt-hashed account password.
- **Hosting/PaaS:** Not yet chosen — see `TASKS.md`.

## Application Structure

**Not yet decided in detail.** No project scaffolding exists. Implied by the chosen stack: a separate frontend app (React/Vite) and backend app (Express), communicating over a REST API — likely two top-level directories (e.g. `frontend/`, `backend/`) in this same repository, but the exact monorepo-vs-separate-repos layout hasn't been decided.

## Component Structure

**Planned, not yet implemented:**
- A login screen.
- A worker module per worker, containing: a personal/employment-info section (with document and photo upload), a monthly attendance calendar, and a salary-configuration/calculation section.
- A monthly calendar component per worker, color-coded per day (Green = Present, Yellow = Half day, Red = Absent), with per-status counts shown below it, and every day tappable/editable regardless of date.
- A day-tap popup for setting a day's attendance status, containing an "Advance Salary" checkbox that reveals a ₹-prefixed amount input when checked.
- Whether a dashboard/home screen listing all workers exists, and what it shows, is an open item (see `TASKS.md`).

## Data Flow

**Planned, not yet implemented:** Setting a day's attendance status (and, optionally, an advance-salary amount) in the day popup is the only manual data entry point for attendance/advances. The frontend sends this to the backend over the REST API, which persists it to PostgreSQL. All salary and advance totals — total earned with/without advance deducted, running-month advance total, whole-year advance total plus remaining owed — are derived/auto-calculated from that stored data (computed server-side or client-side from fetched records; not yet decided which), never entered directly.

## State Management

**Not yet decided.**

## Routing

**Not yet decided.**

## API Architecture

**Planned (decided 2026-09-18, not yet implemented):** A REST API served by the Express backend. Endpoints/resource shape not yet designed — implied by the data model: auth (login/logout), workers (CRUD + Active/Inactive status), attendance (per worker, per date), and advances (per worker, dated entries), plus whatever endpoints the auto-calculated totals need. Not yet decided whether totals are computed server-side (returned pre-calculated) or client-side (raw records fetched, calculated in the frontend).

## Data / Persistence

**Planned (decided 2026-09-18, not yet implemented):** PostgreSQL 18, accessed via Prisma. One central database is the single source of truth for all devices — this is the mechanism that satisfies the "open on any device" requirement (see `DECISIONS.md`). Per-worker data (profile, documents, photo, attendance-by-date, advance entries, salary rate) persists in the database and must survive a worker being marked Inactive and later reactivated — historical attendance/salary data must remain intact across that transition. Exact schema (tables/relations) not yet designed.

## Authentication & Authorization

**Planned (decided 2026-09-18, not yet implemented):** A single admin account. Login checks the submitted password against a bcrypt hash stored in the database; on success, a session is created and stored in the database with its session ID hashed before storage (not stored in plaintext), and a reference to that session held by the client (e.g. a cookie) for subsequent requests. This is deliberately not a stateless JWT approach — a database-backed session allows the session to be revoked/invalidated server-side at any time. No worker-facing accounts, no multi-admin support, no OAuth/social login.

## External Integrations

None planned.

## Build & Runtime

**Not yet decided in detail.** Implied by the stack: Vite builds the frontend; the Express backend runs as a Node process; Prisma manages database migrations against PostgreSQL. Exact scripts/dev workflow not yet set up — no project scaffolding exists yet.

## Architectural Boundaries

Not applicable yet — no code exists, so no app/module boundaries have been drawn. Implied by the stack: a clear frontend/backend split communicating only over the REST API (the frontend never talks to PostgreSQL directly).

## Important Invariants

These hold regardless of further implementation detail, since they come directly from the specification (`PROJECT.md`) and the production stack decision (`DECISIONS.md`):

- Half-day pay is always exactly **0.5 × the per-day rate** — a flat rule applied identically to every worker, not configurable per worker.
- Workers are **never deleted** — a worker who stops working is marked Inactive, not removed; reactivating them later must preserve all prior attendance/salary/advance history intact.
- Attendance must be editable for **any date**, past or present — backfilling/correcting a prior day's status is a core requirement, not an edge case to special-case away.
- Advance salary is logged as **individual dated entries** (date + amount) — never collapsed into or replaced by a single manually-edited running-balance field.
- All salary/advance totals shown to the admin are **auto-calculated** from attendance and advance entries — never a manually-entered figure.
- This is a hosted client-server app, not an offline-only tool — the frontend requires connectivity to the backend API to function. Do not reintroduce local-only storage (e.g. IndexedDB as the source of truth) without an explicit owner decision superseding the production stack decision in `DECISIONS.md`.
- Sessions are database-backed with a hashed session ID, and the account password is bcrypt-hashed — never store either in plaintext, and never switch to stateless JWTs without an explicit owner decision, since revocability was the deliberate reason for this choice.
