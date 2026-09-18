# Daymark Ledger — Prototype Source

Source files for the interactive Claude Artifact prototype, kept here as a local backup.

- Live prototype: https://claude.ai/artifact/LpJwMitqYVcGmhC4pMbgUW
- `project/canvas.json` — artboard layout/metadata for the Artifact canvas.
- `project/Main.dc.html` — the full prototype: mobile (390×844) worker list, per-worker attendance/salary/advance detail, floating action menu (Create New Employee, Manage Employees, Reporting, Settings).

`Main.dc.html` is written in Claude's Design Component format (`<x-dc>`, `support.js`, the `DCLogic` runtime) and only renders fully interactive inside the Artifact platform — opening it directly as a plain HTML file will not run the app logic. Use the live link above to view/interact with it, or open it back up as an Artifact to keep editing.

This is a prototype only — no production code exists yet. See `../Project Docs/` for the actual project spec, architecture, and decisions.
