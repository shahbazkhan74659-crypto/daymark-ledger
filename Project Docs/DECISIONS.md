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

## Decision: Auth implementation specifics — bcrypt cost 12, SHA-256 session hashing, 30-day httpOnly cookie

- Status: Accepted
- Date: 2026-09-19
- Context: Phase 7 (Login and Auth Backend, see `PHASES.md`) implemented the database-backed-sessions/bcrypt approach already accepted in the "Production stack" decision above, but that decision left several concrete parameters unspecified: the bcrypt work factor, which algorithm hashes the session token before storage, and the session cookie's lifetime/flags.
- Decision:
  - **bcrypt cost factor:** 12, for both the seeded admin password and any future password hashing.
  - **Session token hashing:** the raw session token (32 random bytes, hex-encoded) is held only by the client cookie; the database stores its SHA-256 hex digest (`Session.hashedToken`), never the raw value.
  - **Session cookie:** `httpOnly: true`, `sameSite: "lax"`, `secure` only when `NODE_ENV=production`, `path: "/"`, and a 30-day expiry/`maxAge` — chosen for admin convenience (the owner's father using the same device regularly) over a shorter-lived session, accepting that a stolen device/cookie stays valid up to 30 days; mitigated by the session being revocable server-side at any time (delete the `Session` row) per the original database-backed-sessions rationale.
  - **Seed credentials:** provided via `ADMIN_USERNAME`/`ADMIN_PASSWORD` environment variables in the gitignored `backend/.env`, read by `backend/prisma/seed.ts` at seed time — never hardcoded in source, matching `PHASES.md`'s Phase 7 completion criteria.
- Reasoning: These are the standard defaults for each mechanism (bcrypt cost 12 balances hashing cost vs. login latency; SHA-256 is sufficient for hashing an already-high-entropy random token, unlike a low-entropy password) plus the owner's explicit choice of a long-lived session for convenience.
- Consequences: Changing the bcrypt cost factor later would not invalidate the already-hashed admin password (bcrypt hashes are self-describing), but changing the session-token hashing algorithm would invalidate all existing sessions (forcing re-login) since `Session.hashedToken` lookups are exact-match. The 30-day cookie lifetime should be revisited if the app is ever used on a shared/public device.

## Decision: Frontend routing and auth state — `react-router-dom` + React Context

- Status: Accepted
- Date: 2026-09-19
- Context: Phase 8 (Building the Frontend Login Screen, see `PHASES.md`) was the first phase requiring the frontend to switch between more than one screen (a login screen and a placeholder authenticated area), and to track whether the admin is currently logged in. `ARCHITECTURE.md` had both "Routing" and "State Management" flagged as not yet decided. Two open questions: (1) introduce a routing library now, or defer until a phase with real multi-screen navigation (e.g. Phase 10's home → worker detail) needs it; (2) how to track/share auth/session state across components.
- Decision:
  - **Routing:** `react-router-dom`, added now rather than deferred — owner's explicit choice, given while reviewing the Phase 8 plan.
  - **Auth state:** a React Context (`AuthContext`/`AuthProvider`) is the single source of truth for session state app-wide, exposing `status`/`user`/`login()`/`logout()` via a `useAuth()` hook. It checks `GET /api/auth/me` once on mount so the 30-day session cookie actually keeps the admin logged in across page reloads, not just within a single page load.
  - No broader state-management library (Redux, Zustand, TanStack Query, etc.) was introduced — Context is scoped to auth only for now.
- Reasoning: Deciding routing now means every subsequent frontend phase builds on one established pattern instead of retrofitting a router later. React Context is sufficient for a single global concern (auth) with a small, single-admin app — no need for a heavier state library until a concrete data-fetching/caching need arises.
- Consequences: Future screens (Phase 9+) should add routes under the same `react-router-dom` router rather than introducing a different routing approach, and should reuse `useAuth()` for any auth-dependent behavior rather than re-checking `/api/auth/me` independently. Revisit the "no broader state library" choice only if a concrete need (e.g. shared server-data caching across screens) arises.

## Decision: Domain status fields use Prisma enums, not free-text strings

- Status: Accepted
- Date: 2026-09-19
- Context: Phase 9 (Home Screen Backend, see `PHASES.md`) introduced the project's first domain models (`Worker`, `Attendance`) and needed a representation for `Worker.status` (Active/Inactive) and `Attendance.status` (Present/Half/Absent). No validation library (e.g. zod) exists in the backend — `auth.ts`'s existing convention is manual `typeof`/allowlist checks inline in route handlers. Two options: a free-text `String` column validated only at the application layer, or a Postgres-native Prisma `enum`.
- Decision: Use Prisma enums (`WorkerStatus`, `AttendanceStatus`) for both fields, giving DB-level constraint enforcement in addition to the existing manual request-body validation.
- Reasoning: Both domains are genuinely fixed and stable — the half-day rule in this file depends on `HALF` remaining a known, exact value — and a DB-native enum catches bad data at the schema level for free, without adding a new dependency (unlike introducing zod solely for this). The trade-off (adding a new status value later requires a migration) was judged acceptable since this project's statuses are specification-locked, not expected to grow ad hoc.
- Consequences: Future domain models with a similarly fixed status/category field (e.g. any status the Advance model or later phases introduce) should default to a Prisma enum following this same pattern, rather than mixing free-text and enum representations across the schema. Introducing a validation library (zod etc.) remains an open option for request-body validation generally, but is not required by this decision.

## Decision: Advance model — one entry per worker per day, not an append-only ledger

- Status: Accepted
- Date: 2026-09-20
- Context: Phase 11 (Details Page Backend, see `PHASES.md`) needed to design the `Advance` model. The original advance decision above ("logged as individual dated entries") didn't specify whether a single calendar day could hold more than one advance entry per worker. The UI prototype's day-popup (checkbox + ₹ amount, attached to the same popup used for setting that day's attendance status) treats a day's advance as one editable value — saving replaces any prior advance already logged for that exact date, rather than adding a second one.
- Decision: `Advance` gets `@@unique([workerId, date])`, identical in shape to `Attendance`'s existing unique constraint. A worker can have at most one advance entry per calendar day; logging a new amount on a date that already has one overwrites it (an upsert), and clearing it (amount `0` or `null`) deletes the row — mirroring `Attendance`'s `status: null` clear behavior from Phase 9/10.
- Reasoning: Matches the prototype's actual working UX exactly, avoids inventing a change to the entry flow the owner hasn't asked for, and reuses the same compound-unique-key upsert/clear pattern already proven for `Attendance` rather than introducing a new one.
- Consequences: If the admin ever needs to log more than one advance on the same day (e.g. two separate payments), the current model cannot represent that without a schema change (dropping or loosening the unique constraint) — revisit only if the owner reports this as an actual need.

## Decision: Salary/advance totals — gross/net earned are all-time, not period-scoped

- Status: Superseded — see the following decision
- Date: 2026-09-20
- Context: `PHASES.md`'s Phase 11 wording asks for "total earned before/after advance deduction for a period," but the working UI prototype's own calculation logic computes gross/net earned as an all-time total (every attendance record ever recorded for a worker, minus every advance ever given) — only the advance-specific figures (this-month, this-year) are period-scoped in the prototype. This ambiguity was raised with the owner directly during Phase 11 planning.
- Decision: The `GET /api/workers/:id/salary-summary` endpoint's `grossEarned`/`netEarned` figures are all-time totals, matching the prototype exactly, with no date-range or month query parameter for them. `advanceThisMonth`/`advanceThisYear` remain scoped to the real current month/year, and `remainingOwed` is the all-time advance total (nothing currently reduces it, since there is no repayment-tracking mechanism).
- Reasoning: Owner's explicit choice when presented with the discrepancy between the phase-description wording and the prototype's actual working behavior — the prototype was built to validate the intended UX and its calculation shape should govern over an ambiguous phrase in the roadmap text.
- Consequences: If the admin later needs earned totals for an arbitrary period (e.g. "how much did this worker earn last month"), the current endpoint cannot answer that — it would require adding a date-range parameter to `computeSalaryTotals()`/`salary-summary`, which is an explicit future extension, not a bug, until the owner asks for it.

## Decision: Salary/advance totals — reversed to per-displayed-month scoping, annual advance follows the displayed year

- Status: Accepted
- Date: 2026-09-20
- Context: The owner reported that browsing the Worker Detail calendar to a different month left the Earnings & Advances card unchanged — it always showed the all-time gross/net totals plus advance figures bucketed against the server's real current month/year (per the immediately preceding decision), regardless of which month the admin was actually looking at. The owner asked for the stats to reflect whichever month is currently displayed, with one exception: the annual advance figure should still cover a whole year, not a single month.
- Decision:
  - `GET /api/workers/:id/salary-summary` now takes `year`/`month` query params (both required together, month 1–12; defaulting to the real current month/year if both are omitted — preserving "current month by default" on first load). `grossEarned`/`netEarned` are now scoped to that month's attendance only, `advanceThisMonth` is scoped to that exact month, and `advanceThisYear` is scoped to that month's **year** (not necessarily the real current year) — so paging the calendar across a year boundary updates which year's total is shown.
  - `netEarned` changed from `grossEarned - advanceAll` to `grossEarned - advanceThisMonth` (both figures now scoped to the same month, which is the natural reading of "net earned this month").
  - `remainingOwed` is unchanged — it stays an all-time running total of every advance ever given, since there's still no repayment-tracking mechanism to scope it against.
  - The frontend (`WorkerDetailScreen.tsx`) refetches `salary-summary` with the calendar's current `year`/`month` on mount and every time `AttendanceCalendar`'s month navigation changes them, and the Earnings & Advances card now shows a small "{Month} {Year}" subtitle so it's visibly clear which period the figures cover.
- Reasoning: Owner's explicit direction, given after reviewing the live screen — the prior all-time-totals decision optimized for matching the original prototype's calculation shape, but the owner found it confusing in practice once real month-to-month navigation was in front of them. Keeping the calculation server-side (rather than deriving it client-side from already-loaded data) was the owner's explicit choice, to keep all salary-math logic living in one place (`computeSalaryTotals()`) rather than duplicating it in the frontend.
- Consequences: This supersedes the immediately preceding decision's all-time gross/net behavior. A worker with an advance logged in a month with no recorded attendance will show a negative "Net Earned" for that month (gross ₹0 minus that month's advance) — this is an accurate reflection of the new month-scoped definition, not a bug. Any future period-earnings feature (e.g. a custom date-range report) should build on this `year`/`month` query-param pattern on `computeSalaryTotals()` rather than reintroducing an all-time total.

## Decision: Phase 12 backend gap-fill endpoints added alongside the frontend phase

- Status: Accepted
- Date: 2026-09-20
- Context: Phase 11 built the Worker Detail backend (any-date attendance, advances, salary-summary) but didn't include a single-worker identity fetch or a full attendance-history list — Phase 12's Worker Detail screen needs both (the header needs a worker's name without depending on the home screen's already-loaded list, and the monthly calendar needs the full attendance history in one call rather than one request per visible day) but neither fit any prior phase's stated scope.
- Decision: Add `GET /api/workers/:id` (identity: `id, fullName, designation, perDayRate, status`) and `GET /api/workers/:id/attendance` (full history, `{date, status}[]`, sorted date descending) to `backend/src/routes/workers.ts` as part of Phase 12, rather than reopening a "complete" Phase 11.
- Reasoning: Both are small, direct extensions of Phase 11's existing patterns (same `requireSession`/404/envelope conventions, `GET /:id/attendance` mirrors `GET /:id/advances`'s shape and sort order exactly) and only became a known necessity once Phase 12's actual screen needs were worked out — filling the gap where it's discovered was judged better than a retroactive addendum to a phase already marked done.
- Consequences: Future phases needing single-worker or full-history data should reuse these two endpoints rather than re-deriving them from the list-all/today-only/single-date endpoints.

## Decision: Per-day rate editing pulled forward from Phase 15b into Phase 12

- Status: Accepted
- Date: 2026-09-20
- Context: `PHASES.md`'s Phase 15b scope covers updating a worker's personal/employment info generally, including per-day rate, as part of the broader Manage Employees editing flow (not yet built). Phase 12's Worker Detail screen shows the rate in its "Salary Configuration" section regardless (per `PROJECT.md`'s spec), and the UI prototype shows it as editable there — read-only-for-now vs. editable-now was raised with the owner directly.
- Decision: Per-day rate is editable directly on the Phase 12 Worker Detail screen via a new `POST /api/workers/:id/rate` endpoint (save-on-blur) — but only the rate field. Full personal-info editing, the Active/Inactive toggle, and document management remain exactly as scoped in Phase 15b/16b, untouched by this phase.
- Reasoning: Owner's explicit choice — the rate literally lives inside the "Salary Configuration" section this phase already builds, and gating it behind a much later phase would ship an oddly read-only field on a screen otherwise entirely about calculation, for no real benefit.
- Consequences: When Phase 15b is built, its personal-info edit form should exclude per-day rate (already editable here) to avoid two divergent editing paths for the same field; `POST /api/workers/:id/rate` is the one canonical way to change it going forward.

## Decision: UI language — English

- Status: Accepted
- Date: 2026-09-17
- Context: A decision was needed on the app's interface language.
- Decision: English.
- Reasoning: Owner's explicit direction; not otherwise elaborated.
- Consequences: No localization/i18n framework is currently in scope.
