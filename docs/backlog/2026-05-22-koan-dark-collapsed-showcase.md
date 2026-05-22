# Koan: Dark + Collapsed Sidebar Showcase (mockup C5)

**Date:** 2026-05-22
**Status:** Backlog
**Parent:** Stage C — Koan demo rebuild

## Summary

Mockup C5 — the same Tabs response screen rendered in dark mode with a collapsed sidebar. Already functionally supported in the live app (dark mode toggle works; sidebar collapses via the collapse button), but no dedicated entry point that demonstrates the combination as a showcase artboard.

## Source

- Mockup: `docs/mockups/project/rokkit-composer.jsx`, `C.Dark` export
- `app.jsx`: `<DCArtboard id="C5" label="05 Dark mode · collapsed sidebar" ...><C.Dark/></DCArtboard>`

## Scope (light — mostly verification)

The screen is the same content as C3 (Tabs response) plus:
1. `data-mode="dark"` on body
2. Sidebar in collapsed state from initial load

### Implementation options

**Option A — URL query params** (lightweight):
- `/app?demo=tabs&mode=dark&collapsed=true` boots into the response phase with dark mode and collapsed sidebar.
- The existing `onMount` in `+page.svelte` already reads `?demo` and `?q` params; extend to also read `mode` and `collapsed`.

**Option B — Dedicated route** (heavier):
- `/app/showcase/dark` or similar — bootstraps with the right state baked in.
- Probably overkill; URL params are sufficient.

**Option C — Just verify + journal** (lightest):
- Take a screenshot in the existing app with dark mode on + sidebar collapsed.
- Log a journal entry confirming the visual matches the mockup.
- No code changes.

Recommendation: **Option A** — URL params give a stable demo link without route bloat.

## Acceptance criteria

- `/app?demo=tabs&mode=dark&collapsed=true` lands directly in the response phase, dark mode, sidebar collapsed.
- Sidebar's collapsed-body shows the icon-only conversation rows.
- Real `<Tabs>` mounted in the response card renders correctly in dark mode (zen-sumi dark variant).
- CodeBlock + ChatResponse borders use the dark `--paper-edge` value.

## Estimated cost

~30 min for option A. ~5 min for option C.
