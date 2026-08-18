# Enriched Sparkline — spark bar/line/area + trend + highlight

**Date:** 2026-08-18
**Status:** Design approved
**Package:** `@rokkit/chart`

## Problem

`packages/chart/src/Sparkline.svelte` is a standalone inline chart (line / bar / area) for table
cells and KPI tiles. It has no way to draw the small-multiple staples that make a sparkline
readable at a glance: **min/max/last markers**, a **trend line**, or a **baseline reference**.

The composable geom path already ships those as overlays (`GeomHighlight`, `GeomTrend`, `GeomRule`),
backed by two **pure, unit-tested** utilities: `resolveHighlight` (`lib/highlight.js`) and
`computeTrend` (`lib/trend.js`). The enrichment we want is a re-expression of logic that already
exists — the only question was reuse strategy.

## Decision: lean island + shared math (not a PlotState preset)

Sparklines appear in table cells and KPI rows — potentially hundreds on a page. Routing each through
`<PlotChart>` would pay per-instance `PlotState` + `PlotSurface` cost (ResizeObserver, context,
scale inference), a real perf risk at that density. So:

- **Keep `Sparkline` a standalone lightweight SVG component** with its own tight scales (no
  `.nice()`, no band padding — it already does this).
- **Import the pure math** (`resolveHighlight`, `computeTrend`) — do NOT re-implement min/max/
  regression. Zero `PlotState` involvement.
- **Mirror the geom `data-plot-*` attributes and `--chart-*` CSS tokens exactly**, so a theme styles
  both the geom overlays and the sparkline identically — the visual-consistency win of unification
  without the runtime cost.

This means `packages/chart/src/lib/plot/scales.js` is **NOT** touched (the `nice:false`/`padding:0`
scale opt-out that a PlotState preset would have needed is out of scope).

## API (additive, fully backward-compatible)

All existing props are unchanged: `data`, `field`, `type`, `curve`, `color`, `pattern`, `width`,
`height`, `min`, `max`. Three new optional props, all defaulting to `undefined` → nothing rendered →
zero behavior change for existing callers:

```ts
type Selector =
  | 'first' | 'last' | 'min' | 'max'
  | number
  | ((row: { x: number; y: number }, i: number) => boolean)

type Method =
  | 'avg' | 'median' | 'min' | 'max' | 'linear' | 'ema' | 'exp'
  | number
  | { type: 'ma'; window: number }
  | { type: 'ema'; span?: number; alpha?: number }

highlight?: Selector | Selector[]   // e.g. ['min','max','last']
trend?:     Method   | Method[]
baseline?:  number                  // optional reference rule, e.g. 0
```

Example:

```svelte
<Sparkline data={rows} field="sales" type="bar"
           highlight={['min','max','last']} trend="linear" baseline={0} />
```

## Design detail

### Adapter to the pure utils

The component already derives `values: number[]`. Bridge to the utilities with a trivial row shape
(no logic duplicated):

```js
const rows = values.map((v, i) => ({ x: i, y: v }))
// markers: resolveHighlight(rows, selector, { y: 'y' })          → number[] indices
// trend:   computeTrend(rows, { x: 'x', y: 'y' }, method)        → {kind:'constant',value} | {kind:'series',values} | null
```

`highlight` accepting an array is resolved by mapping each selector through `resolveHighlight` and
**deduping the resulting indices** (a point that is both `max` and `last` renders once). `trend`
accepting an array renders one path per method.

### Rendering & positioning (island's own SVG, existing `xScale`/`yScale`)

- **Markers** — one `<circle cx={xScale(i)} cy={yScale(values[i])}>` per resolved index, inside
  `<g data-plot-geom="highlight">`, each carrying `data-plot-highlight`. For `type="bar"` the bar
  center is already `xScale(i)`, so the math is identical.
- **Trend** — `constant` → horizontal `<path d="M0,{y} L{width},{y}">`; `series` → a `d3line` path
  through `(xScale(i), yScale(seriesValues[i]))`. Inside `<g data-plot-geom="trend">`, each path
  carries `data-plot-trend={type}`.
- **Baseline** — a horizontal rule at `yScale(baseline)`. When `baseline` is set, the y-domain is
  extended to include it, so e.g. a `0` line stays on-canvas for all-positive data. **v1 = visual
  reference line only** — it does not re-anchor bar growth (bars keep their current behavior).
- **Draw order** — series/area/bars → trend → baseline → markers (markers on top). Trend and markers
  are `pointer-events: none`, matching the geom overlays.

### Theming — mirror geom tokens verbatim

The component's scoped `<style>` copies the geom fallbacks so global `--chart-*` theme vars flow
through both paths identically:

- markers: `--chart-highlight-color`, `--chart-highlight-ring`, `--chart-highlight-radius`
- trend: `--chart-trend-color`, `--chart-trend-width`, `--chart-trend-dash`, `--chart-trend-opacity`

Baseline reuses a rule token consistent with `GeomRule` (e.g. `--chart-rule-*`/`currentColor`
fallback), confirmed against `Rule.svelte` during implementation.

## Tests

Extend `packages/chart/spec/Sparkline.spec.js` (the util math is already covered by
`highlight`/`trend` specs — we only test the sparkline's rendering/positioning):

- markers: correct count + position for `min`, `max`, `last`, and array form `['min','max','last']`
  (including dedup when selectors overlap);
- trend: constant method renders a horizontal path; series method (`linear`) renders a multi-point
  path;
- baseline: rule renders and the y-domain includes it;
- `data-plot-highlight` / `data-plot-trend` attributes present;
- existing line / bar / area / pattern cases remain green (regression guard).

## Docs

- Update the **Sparkline** section of `docs/design/20-chart.md` with the new props.
- Extend the existing chart demo entry (`apps/learn/src/lib/koan/demos/chart/`) to show enriched
  props.

## Out of scope (YAGNI)

- No change to `PlotState` or `scales.js`.
- No last-value **text label** in v1 (natural follow-up).
- The second duplicate sparkline at `apps/learn/src/lib/components/Sparkline.svelte` — flagged for
  consolidation as a **follow-up**, not folded into this change.
- The `packages/blocks/src/SparklinePlugin.svelte` wrapper spreads props, so it inherits the new
  props for free; no change required there.
