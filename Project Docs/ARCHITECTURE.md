# Architecture

This describes the **actual current implementation** — which is nothing; no code has been written yet — followed by the **planned** architecture implied by the discussion-phase specification (see `PROJECT.md`). See `DECISIONS.md` for the reasoning behind decisions already made, and `TASKS.md` for what's still open.

## System Overview

**Implemented:** Nothing. The repository contains only this `Project Docs/` documentation system.

**Planned:** An installable, offline-first mobile web app (PWA) with data stored locally on the phone (no server/backend), gated by a dedicated login screen, providing a per-worker module (profile, monthly attendance calendar, salary configuration, auto-calculated salary/advance totals). See `PROJECT.md` for the full feature set.

## Technology Stack

**Not yet decided.** No framework, local-storage mechanism, or PWA tooling has been chosen — this is an open item (see `TASKS.md`). Do not assume a stack until the owner decides one.

## Application Structure

**Not yet decided.** No project scaffolding exists.

## Component Structure

**Planned, not yet implemented:**
- A login screen.
- A worker module per worker, containing: a personal/employment-info section (with document and photo upload), a monthly attendance calendar, and a salary-configuration/calculation section.
- A monthly calendar component per worker, color-coded per day (Green = Present, Yellow = Half day, Red = Absent), with per-status counts shown below it, and every day tappable/editable regardless of date.
- A day-tap popup for setting a day's attendance status, containing an "Advance Salary" checkbox that reveals a ₹-prefixed amount input when checked.
- Whether a dashboard/home screen listing all workers exists, and what it shows, is an open item (see `TASKS.md`).

## Data Flow

**Planned, not yet implemented:** Setting a day's attendance status (and, optionally, an advance-salary amount) in the day popup is the only manual data entry point for attendance/advances. All salary and advance totals — total earned with/without advance deducted, running-month advance total, whole-year advance total plus remaining owed — are derived/auto-calculated from that entered data, never entered directly.

## State Management

**Not yet decided.**

## Routing

**Not yet decided.**

## API Architecture

Not applicable — this is an offline-first app with no server/backend planned (see `PROJECT.md`'s Non-Goals).

## Data / Persistence

**Not yet decided (mechanism).** What is decided: data is stored locally on the phone only, fully offline, with no server/hosting. Per-worker data (profile, documents, photo, attendance-by-date, advance entries, salary rate) must persist locally and survive a worker being marked Inactive and later reactivated — historical attendance/salary data must remain intact across that transition. Backup/export/import is explicitly deferred (see `DECISIONS.md`).

## Authentication & Authorization

**Planned, not yet implemented:** A single admin account, gated by a dedicated login screen (not just a PIN), with credentials set by the admin — presumably during first-time setup. No worker-facing accounts or access exist or are planned.

## External Integrations

None planned.

## Build & Runtime

**Not yet decided.** PWA build tooling has not been chosen.

## Architectural Boundaries

Not applicable yet — no code exists, so no app/module boundaries have been drawn.

## Important Invariants

These hold regardless of the eventual tech stack, since they come directly from the specification (`PROJECT.md`):

- Half-day pay is always exactly **0.5 × the per-day rate** — a flat rule applied identically to every worker, not configurable per worker.
- Workers are **never deleted** — a worker who stops working is marked Inactive, not removed; reactivating them later must preserve all prior attendance/salary/advance history intact.
- Attendance must be editable for **any date**, past or present — backfilling/correcting a prior day's status is a core requirement, not an edge case to special-case away.
- Advance salary is logged as **individual dated entries** (date + amount) — never collapsed into or replaced by a single manually-edited running-balance field.
- All salary/advance totals shown to the admin are **auto-calculated** from attendance and advance entries — never a manually-entered figure.
