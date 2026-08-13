# Themes chart.css targets legacy `data-chart-*`, not the Plot system's `data-plot-*`

**Date:** 2026-08-13
**Status:** Backlog — pre-existing theming gap (surfaced during grid/highlight/trend work)
**Site Applicability:** `packages/themes/src/{base,rokkit,minimal,material,frosted,zen-sumi}/chart.css`;
verified against `@rokkit/chart` (`Plot.svelte` + geoms) selectors and the contrast/visual e2e gate.

## Problem

Every theme's `chart.css` styles chart internals via **`data-chart-*`** selectors
(`data-chart-canvas`, `data-chart-tick-label`, `data-chart-grid-line`, `data-chart-legend*`,
`data-chart-axis-line`, …). Those match the **legacy `Chart.svelte` / `ChartLegend.svelte`**
components. The current, primary rendering path — `Plot.svelte` + geoms (`AreaChart`/`LineChart`/
`PlotChart`) — emits **`data-plot-*`** (`data-plot-grid-line="x|y"`, `data-plot-tick-label`,
`data-plot-legend*`, `data-plot-axis-line`, …).

Result: **per-theme chart styling is dead for Plot-rendered charts.** e.g. every
`[data-style='<x>'] [data-chart-grid-line] { @apply stroke-... }` rule matches nothing the Plot
grid renders; Plot charts fall back to their own component CSS + the `--chart-*` CSS vars
(`--chart-grid-*`, `--chart-highlight-*`, `--chart-trend-*`) added in the grid/highlight/trend work.

This was flagged narrowly (one orphaned `[data-chart-grid-line]`) during that work but is a whole
legacy→Plot selector-migration gap, so it's tracked here rather than patched ad hoc.

## Scope

1. Inventory every `data-chart-*` selector across the six `chart.css` files and map to the
   `data-plot-*` equivalent the Plot components actually emit (grep `data-plot-` in
   `packages/chart/src`).
2. Decide the theming contract for Plot charts: either
   - (a) migrate theme `chart.css` selectors `data-chart-*` → `data-plot-*` so themes color the
     Plot grid/ticks/legend/axis per style, **or**
   - (b) keep Plot charts self-styled via component CSS + `--chart-*` vars and have each theme set
     those vars (`--chart-grid-color`, etc.) instead of raw selectors — lighter, and consistent
     with the new theming hooks.
   Recommendation: **(b)** for the new tokens (grid/highlight/trend) + migrate the still-relevant
   structural selectors (tick-label, legend, axis) in (a). Confirm whether legacy `Chart.svelte`
   is still shipped/used anywhere before deleting its selectors.
3. Rebuild themes (`bun run build` in `packages/themes` / the build-themes flow) and
   **re-baseline the contrast + visual-regression e2e** — coloring the Plot grid/ticks is a real
   visual change across all themes/modes.

## Out of scope

- Changing the Plot components' emitted attribute names (keep `data-plot-*`).
- Any new chart feature.

## Deliverable

Theme `chart.css` actually styles Plot-rendered charts (grid/ticks/legend/axis) per style, with the
contrast/visual gate re-baselined and green. No dead `data-chart-*` rules left unless legacy
`Chart.svelte` is confirmed still in use.
