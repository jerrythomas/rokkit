# Plot.svelte decomposition

**Status:** DONE (2026-09-30): `2d246d0f`, `7227692d`. See journal 2026-09-30 (9).
The user said "keep going" after the Navigator and the open items.
**Package:** `@rokkit/chart`

## Why

`src/Plot.svelte` (`PlotChart`) is now the top hotspot: 357 lines, complexity 72, 38 commits.
Every chart wrapper and every spec-driven chart renders through it.

The measured complexity overstates the branching. The metric counts `??`, and most of the 72
are one rule written about twenty times: a `spec` value overrides the matching prop. That rule
has one silent exception: `orientation`, where the prop wins. What's left is a geom lookup
(helpers first, then built-ins, with annotations taking only their own `props`), the merging
of each spec geom's props, and a screen-reader data table.

## Shape

The component API is unchanged. Plot.svelte becomes a template over pure resolvers and two
sub-components.

| Part | Owns |
|---|---|
| `lib/plot/spec.js` (pure) | `PLOT_CONFIG_FIELDS`: the spec-over-prop precedence as a table, with `orientation`'s prop-wins exception declared rather than implied. `resolvePlotConfig(spec, props)`, `resolveChrome(spec, props)` (grid, legend, title, summary, axis labels, overlay x/y), `tableColumns(spec, rows)`, `specGeomProps(geomSpec, spec)`. |
| `Plot/SpecGeoms.svelte` | The spec-driven geom loop: the built-in geom table, helper overrides, annotation props only, keyed by position |
| `Plot/DataTable.svelte` | The visually hidden accessible data table |

## Slices (one commit each, test first)

1. `lib/plot/spec.js` with its specs; Plot.svelte adopts it.
2. `SpecGeoms` and `DataTable`; Plot.svelte is layout only.
3. Differential: render the old Plot.svelte (HEAD before slice 1) and the new one over a grid
   of props × spec shapes (every config field set by prop, by spec, or both; every geom type;
   annotations; helper overrides; grid/legend/axes/tooltip/table variants). Compare the
   rendered HTML and the resulting PlotState config. Plant bugs to prove it can fail.
   Then re-measure, update docs 20-chart, llms and the charts skill if the internals appear,
   write the journal and push.

## Invariants at every slice

- `Plot.spec.js`, `Grid`, `Highlight`, `Trend`, `selection`, `FacetPlot`, `AnimatedPlot` and
  the chart wrapper specs pass unchanged.
- Chart 100% statement gate on JS.
- `check:svelte` passes, and lint is 0/0.
- At the end: chart browser specs and learn e2e.
