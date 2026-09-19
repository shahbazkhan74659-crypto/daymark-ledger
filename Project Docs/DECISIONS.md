# Technical Decisions

These decisions were made during a prior discussion, before any code was written. They are recorded here as established direction for `PROJECT.md` and `ARCHITECTURE.md`. Where reasoning beyond the owner's stated preference was not captured at the time, this is marked explicitly rather than guessed.

## Decision: App name — Daymark Ledger

- Status: Accepted
- Date: 2026-09-18
- Context: The app had no name yet. The owner wanted a short, one-word-style name that evokes daily attendance/tracking metaphorically (not a literal translation of "attendance," and deliberately not region/language-flavored). As part of exploring options, the same brief was independently given to both ChatGPT and Gemini, and their suggestions were compared against Claude's own.
- Decision: **Daymark Ledger** — combining "Daymark" (marking each day, suggested independently by both ChatGPT and Gemini) with "Ledger" (the record-keeping side covering salary/advance tracking, suggested by Gemini and fitting the app's calculation-heavy nature).
- Reasoning: "Daymark" was the strongest single convergence point across all three models' independent suggestions and matched the brief exactly (short, metaphorical, evokes daily marking without naming attendance directly). "Ledger" was added to acknowledge that the app is equally about salary/advance record-keeping, not attendance alone — owner's explicit choice to combine the two rather than pick one standalone word.
- Consequences: Any future branding, PWA manifest `name`/`short_name`, package identifiers, or app-store listing should use "Daymark Ledger" (or a "Daymark" short form) rather than a generic/placeholder name.

## Decision: Production stack — React/Vite frontend, Node/Express REST API backend, PostgreSQL via Prisma, database-backed sessions

- Status: Accepted
- Date: 2026-09-18
- Context: The app was originally planned as an offline-only PWA with local on-device storage (see the now-removed "Offline-first mobile PWA, no server/hosting" decision). The owner's father — the actual admin user — wants to be able to open the app on any device, which local-only storage cannot support: it needs one central, always-current copy of the data that every device reads from. This requires a real backend and database rather than local storage.
- Decision:
  - **Frontend:** React + Vite + TypeScript + Tailwind CSS.
  - **Backend:** Node.js + Express + TypeScript, exposing a REST API. Next.js is explicitly **not** part of the default stack — it may be introduced later only if a specific, concrete need arises that Express can't reasonably satisfy; until then, treat the backend as plain Express.
  - **Database:** PostgreSQL 18.
  - **ORM:** Prisma.
  - **Auth:** Database-backed sessions — the session ID is hashed before storage, and the admin's account password is hashed with bcrypt. No OAuth/social login, no multi-user roles — this remains a single-admin account.
- Reasoning: Multi-device access requires a central source of truth, which rules out local-only storage. Node/Express/TypeScript keeps one language across the whole stack (no Python/Django context-switch). PostgreSQL fits the relational Worker → Attendance → Advance data shape and is well-supported on every PaaS/managed-DB provider. Prisma gives type-safe queries matching the TypeScript backend. Database-backed sessions (over stateless JWTs) were chosen so sessions can be revoked/invalidated server-side at any time — appropriate for a single admin account where that control matters more than statelessness.
- Consequences: This supersedes the original offline-first/local-storage/no-server plan in full — the app is now a normal client-server web app requiring hosting and internet connectivity to function (see `TASKS.md` for the still-open PaaS hosting choice). `PROJECT.md`'s Non-Goals/Constraints and `ARCHITECTURE.md` have been updated to match. Prior discussion items premised on local-only storage (e.g. the earlier backup/export-mechanism deferral, which existed specifically to address local-device data loss) no longer apply in their original form, since the database itself is now the durable, device-independent copy of the data.

## Decision: Dedicated login screen with admin-set credentials

- Status: Accepted
- Date: 2026-09-17
- Context: The app needed an access-control approach for its single admin user.
- Decision: A dedicated login screen (not just a PIN), with username/password credentials set by the admin (the project owner's father) — presumably during first-time setup.
- Reasoning: Owner's explicit direction; not otherwise elaborated.
- Consequences: No worker-facing accounts or multi-user auth are needed — this is the app's only account. Exact first-time-setup flow (how the admin sets their initial credentials) is not yet detailed.

## Decision: Half-day pay = exactly 0.5 × per-day salary (flat rule)

- Status: Accepted
- Date: 2026-09-17
- Context: Attendance can be marked Present, Half day, or Absent, and each worker has their own per-day salary rate. A rule was needed for how a half day is paid.
- Decision: Half-day pay is always exactly 0.5 × the worker's per-day rate — the same flat multiplier for every worker, not configurable per worker.
- Reasoning: Owner's explicit direction; not otherwise elaborated.
- Consequences: Salary calculation logic can apply one fixed multiplier for Half day status across all workers, with no per-worker override to account for.

## Decision: Attendance edits allowed for any date, including past dates (backfill allowed)

- Status: Accepted
- Date: 2026-09-17
- Context: A decision was needed on whether attendance entry should be restricted to "today only" or allow editing past dates.
- Decision: Any date on the calendar — past or present — is editable. The admin can backfill or correct attendance for any day.
- Reasoning: Owner's explicit direction; not otherwise elaborated.
- Consequences: The attendance calendar UI/data model must not special-case "today" as the only editable date — every calendar day needs the same tap-to-edit popup.

## Decision: Advance salary logged as individual dated entries, not a single balance field

- Status: Accepted
- Date: 2026-09-17
- Context: A decision was needed on how to record advance-salary payments — a single running balance the admin edits manually, or a history of individual payments.
- Decision: Each advance is logged individually with its own date and amount, via a checkbox + ₹ amount field in the attendance day-popup. This builds a full history per worker, not just a single manually-edited running balance.
- Reasoning: Owner's explicit direction; not otherwise elaborated.
- Consequences: Advance totals (running-month, whole-year, remaining owed) must be derived by summing the individual dated entries, not read from or written to a single balance field.

## Decision: Advance salary display shows two totals — running month, and whole year plus remaining owed

- Status: Accepted
- Date: 2026-09-17
- Context: Following from the individual-dated-entries decision above, a decision was needed on what summary figures to surface to the admin.
- Decision: Show two auto-calculated advance figures: the running-month total (sum of advances taken so far in the current month), and the whole-year total (sum of advances taken in the current year) plus how much is still remaining/owed to be recovered from future salary.
- Reasoning: Owner's explicit direction; not otherwise elaborated.
- Consequences: The calculation logic needs both a month-scoped and a year-scoped aggregation over the same advance-entry history, plus a "remaining owed" figure reconciling advances taken against salary earned.

## Decision: Worker lifecycle — never deleted, Active/Inactive status only

- Status: Accepted
- Date: 2026-09-17
- Context: Daily-wage worker headcount fluctuates day to day; a decision was needed on how to handle a worker who stops working and possibly returns later.
- Decision: Workers are never deleted. A worker who stops working is marked Inactive. If they rejoin later — even months later — they are reactivated and keep all historical attendance/salary data intact.
- Reasoning: Owner's explicit direction; not otherwise elaborated.
- Consequences: Any worker-record deletion feature is out of scope. The data model must support an Active/Inactive status field and must not cascade-delete or orphan a worker's attendance/advance history on deactivation.

## Decision: Prototype UI navigation — home list + floating quick-actions menu, Manage Employees split from the attendance module

- Status: Accepted
- Date: 2026-09-18
- Context: While building the mobile UI prototype, two navigation questions came up that `PROJECT.md`'s original spec didn't resolve: (1) how the admin gets from a home screen to admin-only actions like adding a worker, and (2) whether worker housekeeping (Active/Inactive, editing personal info, documents) lives in the same screen as day-to-day attendance/salary tracking, or separately.
- Decision:
  - A home screen lists all workers by full name and today's status, with status changeable inline (tap a P/H/A pill) without opening the worker.
  - A floating circular quick-actions menu (bottom-right) opens four options: Create New Employee, Manage Employees, Reporting, Settings.
  - Tapping a worker's name from the home list opens their **attendance/salary/advance module** (the module described in `PROJECT.md`'s Core Features).
  - **Manage Employees** is a separate flow (its own worker list → its own per-worker edit screen) for Active/Inactive toggling, personal-info edits, and document management — not mixed into the attendance module.
  - Reporting and Settings are reserved menu entries with placeholder "coming soon" screens; their actual scope is undecided (see `TASKS.md`).
- Reasoning: Owner's explicit direction, given while directing the prototype build. Splitting "view/record attendance" (frequent, fast, day-to-day) from "manage worker identity" (infrequent, administrative) keeps the high-traffic home→worker flow uncluttered.
- Consequences: The real frontend's routing/screens should follow this split (two distinct worker-detail routes, not one) rather than the single unified "worker module" implied by `PROJECT.md`'s original wording. Reporting and Settings are now named in the product's navigation but still have no defined scope — do not build them out without a further owner decision.

## Decision: Local dev Postgres — native Windows service, connect as `postgres` superuser (no dedicated dev role)

- Status: Accepted
- Date: 2026-09-19
- Context: Phase 1 (Local PostgreSQL 18 Setup, see `PHASES.md`) needed two open decisions resolved: native Windows PostgreSQL 18 service vs. a Docker-based instance, and whether the backend connects via a dedicated dev role/credentials or the default `postgres` superuser. Investigation found the native `postgresql-x64-18` Windows service already installed, running, and set to Automatic startup, with port 5432 reachable — while Docker Desktop's service was present but stopped (Manual startup).
- Decision:
  - Use the **native Windows PostgreSQL 18 service** for local dev, not Docker.
  - The backend connects as the **`postgres` superuser** directly for local dev — no separate dedicated dev role was created.
  - The local development database is named **`daymark_ledger_dev`**.
- Reasoning: The native service required zero additional setup (already running automatically), whereas Docker would have required starting Docker Desktop's service and provisioning a container — extra moving parts with no local-dev benefit. Using the `postgres` superuser directly was the owner's explicit choice, prioritizing local-dev simplicity over the least-privilege alternative (a dedicated role) that was initially recommended.
- Consequences: This is a **local-dev-only** decision. The still-open production PaaS/hosting choice (see `TASKS.md`) is unaffected and may still warrant a dedicated, non-superuser database role for the production database — do not assume the superuser approach carries over to production without a separate decision.

## Decision: Tailwind CSS v4 via `@tailwindcss/vite` (CSS-first config, no `tailwind.config.js`)

- Status: Accepted
- Date: 2026-09-19
- Context: Phase 5 (Creating Frontend Server, see `PHASES.md`) needed to wire Tailwind CSS into the new Vite + React frontend. Two integration paths exist: the legacy PostCSS-config flow (`tailwind.config.js` + `postcss.config.js` + `npx tailwindcss init`), used by Tailwind v3 and earlier, or Tailwind v4's dedicated `@tailwindcss/vite` plugin, which is CSS-first and requires no separate config files.
- Decision: Use Tailwind CSS v4 via the `@tailwindcss/vite` plugin. No `tailwind.config.js` or `postcss.config.js` exist in `frontend/` — theme/config, when needed, will live in `frontend/src/index.css` via CSS `@theme` directives (Tailwind v4's config model), not a separate JS config file.
- Reasoning: This is the current officially recommended integration for a fresh Vite project — zero-config, faster builds, and avoids maintaining a parallel PostCSS pipeline. No concrete need for the legacy config-file approach exists yet.
- Consequences: Future phases adding custom theme tokens, colors, or breakpoints should extend `frontend/src/index.css`'s `@theme` block rather than reaching for a `tailwind.config.js` — introducing one would mean reversing this decision and should get its own consult if a concrete need arises (e.g. a design-token generation tool that expects the legacy config format).

## Decision: Frontend–backend dev connectivity — CORS + explicit `VITE_API_BASE_URL`, not a Vite dev proxy

- Status: Superseded — see the following decision
- Date: 2026-09-19
- Context: Phase 6 (Connecting Frontend, Backend, and Database, see `PHASES.md`) needed the frontend to call the backend locally. Two common approaches exist: a Vite dev-server proxy (transparent same-origin requests in dev only, hiding the cross-origin nature of the real deployment), or CORS on the backend plus an explicit frontend-side base URL (matching how the two apps will actually be hosted).
- Decision: Use CORS (the `cors` npm package, allow-listing an origin via a new `CORS_ORIGIN` backend env var, default `http://localhost:5173`) plus a new `VITE_API_BASE_URL` frontend env var — not a Vite proxy.
- Reasoning: `ARCHITECTURE.md`'s planned production topology already hosts frontend and backend on separate origins (see the production stack decision above), so dev-time connectivity should mirror that shape rather than diverge from it. A proxy would work in dev but hide the cross-origin reality, requiring CORS and an explicit base URL to be introduced later anyway once hosted — building the same plumbing twice. Deciding this now means Phase 8+ inherits an already-proven, production-shaped pattern.
- Consequences: Any future API calls from the frontend should go through `VITE_API_BASE_URL`, not a relative path assuming same-origin. Backend routes intended for frontend consumption must remain reachable under the CORS-allowed origin; widening `CORS_ORIGIN` (e.g. for a deployed frontend URL) is an env-var change, not a code change.

## Decision: Frontend–backend dev connectivity — reversed to a Vite dev proxy (single port 5173 for local dev)

- Status: Accepted
- Date: 2026-09-19
- Context: The prior decision (above, now superseded) chose CORS + `VITE_API_BASE_URL` specifically to mirror `ARCHITECTURE.md`'s planned production topology of separate frontend/backend origins. The owner has since explicitly asked to reverse that: use only port 5173 in dev (frontend and backend combined via a proxy), instead of juggling two ports/origins.
- Decision: Add a Vite dev-server proxy (`frontend/vite.config.ts`'s `server.proxy`) forwarding `/api` and `/health` request prefixes to `http://localhost:3001`. The frontend now fetches relative paths (e.g. `/api/db-check`) instead of an absolute `VITE_API_BASE_URL`-prefixed URL. The backend's `cors` middleware and `CORS_ORIGIN` env var are left in place, unused by this dev path but harmless.
- Reasoning: Owner's explicit dev-convenience preference, accepting the tradeoff called out in the superseded decision. The production hosting/topology this was meant to mirror is still an open, undecided item (see `TASKS.md`'s PaaS/hosting task) — it was not yet load-bearing, so mirroring it prematurely cost more dev friction (two ports, CORS config) than it bought. If production later does end up cross-origin, CORS/base-URL plumbing can be reintroduced at that point without difficulty, since the backend's CORS support was never removed.
- Consequences: `VITE_API_BASE_URL` is removed from `frontend/.env` and `frontend/.env.example` (dead config once fetches are relative). `frontend/src/App.tsx` now calls `fetch('/api/db-check')` directly rather than building a base-URL-prefixed request. This is a **local-dev-only** change — the backend itself, its CORS middleware, and `CORS_ORIGIN` are untouched; if a future production decision hosts frontend and backend on separate origins, this proxy-based approach does not carry over, and CORS + an explicit base URL (or an equivalent reverse-proxy setup) will need to be reintroduced for production at that time.

## Decision: UI language — English

- Status: Accepted
- Date: 2026-09-17
- Context: A decision was needed on the app's interface language.
- Decision: English.
- Reasoning: Owner's explicit direction; not otherwise elaborated.
- Consequences: No localization/i18n framework is currently in scope.
