# Project

## App Name

**Daymark Ledger** — locked 2026-09-18. See `DECISIONS.md`'s "App name — Daymark Ledger" entry for the naming process and reasoning.

## Overview

A mobile app to manage daily-wage workers: attendance, salary, and advance salary. The app exists only as a discussion-phase specification — no code has been written yet. See `ARCHITECTURE.md` for what actually exists and `DECISIONS.md` for decisions made ahead of implementation.

## Problem

Worker headcount for daily-wage labor fluctuates day to day (typical of this kind of work — up to ~70 workers at a time), and there is no structured, backfillable, per-worker record of attendance, salary earned, and advances given. The admin needs a single place to record each day's attendance per worker and see auto-calculated salary/advance totals, without needing internet access or a server.

## Purpose

Build one offline-first mobile app where the admin can, per worker: mark daily attendance (Present/Half/Absent) on any date past or present, log dated advance-salary payments, and see auto-calculated salary and advance totals — for a fluctuating roster of up to ~70 daily-wage workers.

## Goals

- A dedicated module per worker: personal/employment info, a monthly attendance calendar, and salary/advance configuration and totals.
- Attendance editable for any date (not just "today") so the admin can backfill or correct records.
- Advance salary logged as individual dated entries (date + amount), building a full history per worker — not a single manually-edited balance.
- Auto-calculated salary and advance totals (never manually entered): total earned with and without advances deducted, running-month advance total, and whole-year advance total plus remaining amount owed.
- Fully offline: works with no internet connection, data stored locally on the phone.
- Installable as a mobile web app (PWA).
- A dedicated login screen with admin-set credentials.

## Non-Goals

- No worker-facing access — this is a single-user (admin-only) application. Workers do not have accounts or access.
- No server or hosting — this is not a client-server product; there is no backend to build.
- No backup/export/import feature for now — deferred, to be decided later (see `DECISIONS.md`).
- Workers are never deleted from the system — "removing" a worker means marking them Inactive, not erasing their record.

## Target Users

- **Owner (developer/maintainer):** Shahbaz.
- **Actual user (admin, sole account):** Shahbaz's father — enters everything himself, no worker-facing access.
- Single-user application: all data entry, editing, and viewing is done by the admin only.

## Core Features

- **Worker profile:** personal info (name, contact, etc.), joining date, designation, contact details, uploaded documents (if available), and a worker photo/image.
- **Attendance calendar:** a monthly, color-coded calendar per worker (Green = Present, Yellow = Half day, Red = Absent), with per-status day counts shown below the calendar, editable for any date.
- **Attendance entry / advance salary popup:** tapping a calendar date opens a popup to set that day's status, with a checkbox to log an advance-salary amount (₹) given that day.
- **Salary configuration:** a per-day salary rate set individually per worker; half-day pay is always exactly 0.5 × the per-day rate (flat rule for all workers).
- **Salary & advance calculations (auto-calculated):** total earned before/after advance deduction for a period, running-month advance total, and whole-year advance total plus remaining amount owed.
- **Login:** a dedicated login screen (not just a PIN), with credentials set by the admin, presumably during first-time setup.

## Current Status

Discussion/specification phase. No code has been written, no tech stack chosen, and no project scaffolding exists. See `PHASES.md` and `TASKS.md`.

## Constraints

- Must work fully offline — no internet dependency for core functionality.
- Data stored locally on the phone — no server/hosting.
- Max ~70 workers at a time.
- Single admin user only.
- UI language: English.

## Scope

A single-owner, single-admin mobile app for tracking daily-wage worker attendance and salary. Not a multi-user or multi-tenant product; no worker-facing surface.

## Success Criteria

To be defined.
