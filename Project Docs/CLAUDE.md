# CLAUDE.md

Rules and instructions for how Claude should work in this repository.

Dont commit or Push anything wothout my Consult next time

## Project Documentation System

This project uses a strict 6-file Markdown documentation system, each file with **one** distinct responsibility:

```text
CLAUDE.md       → Rules and instructions (this file)
PROJECT.md      → Project definition — what we're building, and why
PHASES.md       → Development roadmap — in what order we're building it
TASKS.md        → Current execution — what we're doing right now
ARCHITECTURE.md → System design — how the system works internally
DECISIONS.md    → Technical decision history — why we chose to build it this way
```

Claude must preserve this separation. Do not duplicate large sections across files — if a fact belongs in another file, put it there and reference it instead.

## Mandatory Maintenance Rules

### 1. Responsibility Separation
Keep each file focused on its own responsibility. Do not duplicate large sections across files.

### 2. TASKS.md
Must remain actionable. Tasks should normally belong to a phase defined in `PHASES.md`. Tasks represent concrete work, not vague project goals.

### 3. PHASES.md
Must remain high-level: development stages, milestones, sequencing — **not** individual coding tasks. The project owner determines the number and order of phases. Claude must not arbitrarily restructure the project's phase order or phase count.

### 4. ARCHITECTURE.md
Describes the project's actual technical structure — stable system design, relationships, boundaries, data flow, dependencies, architectural patterns. Not a dumping ground for temporary implementation notes.

### 5. DECISIONS.md
Records significant technical decisions and the reasoning behind them. Do not create decision records for trivial coding choices.

### 6. Documentation Accuracy
Update documentation when major project changes make existing documentation inaccurate.

### 7. No Silent Destruction
Never silently modify, delete, or replace important documentation. If a change makes existing documentation obsolete: (1) identify what became obsolete, (2) explain why, (3) determine which file(s) should change, (4) make the update deliberately. Do not casually overwrite historical information.

### 8. Six-File Limit
Do not create additional Markdown documentation files unless information genuinely cannot fit into these six. Assume these six are sufficient by default.

### 9. Actual Project State
Documentation must always reflect the actual project state. Never document a feature, architecture, system, component, or integration as completed when it is not actually implemented.

### 10. Whole-Project Understanding
Together, the six files should let Claude answer "Analyze the whole project" without reading the entire codebase first — but they remain a high-level representation, not a replacement for source code.

## Documentation Conflict Priority

```text
CLAUDE.md
    ↓
PROJECT.md
    ↓
PHASES.md
    ↓
TASKS.md
    ↓
ARCHITECTURE.md
    ↓
DECISIONS.md
```

When information conflicts between documentation files, the higher-priority document governs. **However**, when code and documentation disagree, do not blindly trust the documentation — inspect the code, determine the actual current state, and correct the stale documentation.

## Mandatory Pre-Change Documentation Check

Before making any significant project change, identify which documentation file(s) will become affected or inaccurate as a consequence:

- New project requirement → `PROJECT.md`
- Change in development stage → `PHASES.md`
- New/current implementation work → `TASKS.md`
- Architectural change → `ARCHITECTURE.md`
- Significant technical choice → `DECISIONS.md`
- Change to Claude's working rules → `CLAUDE.md`

A single change may require updates to multiple files.

## Project-Specific Notes

- **As of 2026-09-18**, this repository contains only this `Project Docs/` folder. No code, no framework, no dependencies, and no build tooling exist yet. The repository is not yet a git repo. Do not assume more exists than this — verify against the filesystem before making claims.
- The project owner's original raw discussion notes (`PROJECT_SPEC.md`, repo root) were fully extracted into `PROJECT.md`, `PHASES.md`, `TASKS.md`, `ARCHITECTURE.md`, and `DECISIONS.md` below, then deleted at the owner's explicit request on 2026-09-18 — this documentation system is now the sole source of truth for the discussion-phase spec; there is no separate raw-notes file to cross-check against.
- Tech stack (framework, local storage/PWA mechanism, build tooling) has not been chosen yet — see `TASKS.md`'s open items and `ARCHITECTURE.md`'s "To be decided" notes. Do not assume a stack or begin scaffolding a project structure until the owner decides this.
- The project owner determines phase count/order (rule 3). **As of 2026-09-18, the full build roadmap (originally Phase 0 through Phase 21) was defined and the owner declared `PHASES.md` complete.** Claude must never add, reorder, split, or otherwise modify a phase on its own initiative — any new/changed phase requires the owner's explicit consultation and direction first, every time, not just for the initial roadmap. **Updated 2026-09-21:** the owner explicitly directed removing Phase 19/20 (Settings, cancelled outright) and renumbering the former Phase 21 down to Phase 19 — see `PHASES.md`'s top-of-file note and `DECISIONS.md`'s "Settings panel cancelled" entry. The roadmap is now Phase 0 through Phase 19.
