# Distribution geoms: `Plot.Box` / `Plot.Violin` / `Plot.Jitter`

**Date:** 2026-08-14
**Issues:** [#143 Plot.Box](https://github.com/jerrythomas/rokkit/issues/143), [#144 Plot.Violin / beeswarm](https://github.com/jerrythomas/rokkit/issues/144)
**Status:** ✅ SHIPPED (2026-08-14) — Plot.Box/Violin/Jitter with Tukey whiskers + outliers, buildSwarm (jitter/beeswarm), demo, on PR #145. Two follow-ups landed: box/violin/jitter inherit root channels; box outliers are inspectable (role + aria + hover).

## Problem

sensei's metric-detail charts need to show a *distribution* per period (e.g.
`time_to_useful_result` latency across a week/month), where spread and outliers
matter more than the median alone. rokkit 1.3.7 ships Bar/Line/Area/Point/Arc in
the composable `Plot.*` namespace but no distribution geom.

## Current state (discovered)

Box and Violin geoms already exist and work, but are incompletely surfaced:

- `geoms/Box.svelte` → exported as `GeomBox`; `geoms/Violin.svelte` → `GeomViolin`.
  Both are registration-based: they `registerGeom()` on the shared `'plot-state'`
  context, read root data + channels, and render from `plotState.geomData(id)` /
  `xScale` / `yScale` / `colors`.
- `applyBoxStat` (`lib/brewing/stats.js`) computes `{ q1, median, q3, iqr_min, iqr_max }`
  where `iqr_min`/`iqr_max` are the raw **fences** (`q1 − 1.5·IQR`, `q3 + 1.5·IQR`).
- `PlotState.#resolveBoxDomain` derives the y-domain from `iqr_min`/`iqr_max`.
- `buildBoxes` draws whiskers at `iqr_min`/`iqr_max`; `Box.svelte` notes
  "Outlier rendering deferred: buildBoxes does not compute outliers yet".

Gaps vs. the issues:

1. `Plot.Box` / `Plot.Violin` are **not in the `Plot` namespace** object (only the
   `GeomBox` / `GeomViolin` aliases exist).
2. **No outlier points** on Box (issue #143 explicitly wants them).
3. **No Jitter / beeswarm geom** at all (issue #144).

## Decisions (locked with user)

- `Plot.Box` / `Plot.Violin` / `Plot.Jitter` follow the **registration-based geom
  contract** (read root data + channels via context + the stat pipeline), consistent
  with `GeomBox` / `GeomViolin` — **not** the simpler prop-based `Plot.Bar` contract.
  The issue sketches (`<Plot.Box data={grouped} …/>`, `<ChartCanvas …>`) are
  illustrative names; the real root is `Plot.Root` and data flows from it.
- **Box whiskers:** proper **Tukey** — whiskers clamp to the most extreme datum
  within the fence; values beyond the fence render as outlier dots.
- **Jitter layout:** prop-selectable `method='jitter' | 'swarm'` (default `jitter`).
  Both deterministic (no `Math.random` — `Math.random`/`Date.now` are also banned in
  this repo's tooling and break render stability).

## Design

### 1. Box — Tukey whiskers + outliers (issue #143)

- **`applyBoxStat`** (`lib/brewing/stats.js`): redefine `iqr_min`/`iqr_max` as the
  **clamped whisker endpoints** — the min datum `≥ q1 − 1.5·IQR` and the max datum
  `≤ q3 + 1.5·IQR`. Add `outliers: number[]` (values outside the fence). Fences stay
  internal to the reducers. Field names unchanged → `buildBoxes` and
  `#resolveBoxDomain` keep working, but whiskers now touch real data.
  - Edge cases: no outliers → `outliers: []`, whiskers = data min/max. Single value
    per group → q1 = median = q3, IQR 0, whiskers = that value, no outliers.
- **`buildBoxes`** (`lib/brewing/marks/boxes.js`): add
  `outliers: (d.outliers ?? []).map((v) => ({ cy: yScale(v), value: v }))` per box,
  positioned at the box `cx`. Works in both grouped (fill) and non-grouped paths.
- **`Box.svelte`**: render outliers as small circles
  (`data-plot-element="box-outlier"`, `role="presentation"`), stroke = box stroke,
  radius ~2. Rendered after whisker caps.
- **`PlotState.#resolveBoxDomain`**: fold `d.outliers` values into the min/max so
  outlier dots aren't clipped by the y-domain.

### 2. Violin (issue #144)

Promote `geoms/Violin.svelte` into the `Plot` namespace as `Plot.Violin`. No new
code — but note a **side-effect of the Tukey change**: `buildViolins` uses
`iqr_min`/`iqr_max` as the violin's top/bottom silhouette anchors, and the
composable Violin sources its rows from `applyBoxStat`. Redefining those fields
from raw fences (`q1 ± 1.5·IQR`) to Tukey-clamped data extremes therefore shifts
the violin's tapered tips to the actual data min/max instead of the theoretical
fences. This is intentional and an improvement (the silhouette now spans real
data), and the older brewer-based `charts/ViolinPlot.svelte` is unaffected (it
computes its own fences in `QuartileBrewer`).

### 3. `Plot.Jitter` / beeswarm — new (issue #144)

- New **`geoms/Jitter.svelte`** — registration-based, geom type `'jitter'`, stat
  `'identity'` (raw points). Props: `x`, `y`, `fill`, `r = 2`,
  `method: 'jitter' | 'swarm' = 'jitter'`, `options`.
- New mark builder **`lib/brewing/marks/swarm.js`** →
  `buildSwarm(data, channels, xScale, yScale, colors, { method, r })`:
  - Group rows by the x band; band center `cx = xScale(xVal) + bandwidth/2`;
    `halfBand = bandwidth * 0.4` (leave gutters).
  - **`jitter`**: deterministic offset in `[-halfBand, +halfBand]` from a stable hash
    of the row's index within its group (e.g. a small integer-hash → `[0,1)` → mapped).
    Stable across renders.
  - **`swarm`**: 1-D beeswarm — sort each group by `y`; place each point at the offset
    of smallest `|offset|` that doesn't collide (Euclidean distance `< 2r` in scaled
    space) with already-placed points in that group. Deterministic given sorted input.
    Offsets clamped to `halfBand`.
  - Returns `{ cx, cy, fill, stroke, data }` per point; color from the `colors` map
    keyed by `fill ?? x` value (token-driven).
- **`Jitter.svelte`** renders circles `data-plot-element="jitter-point"`,
  `role="graphics-symbol"`, hover wired to `plotState.setHovered`.

### 4. PlotState scale robustness

Generalize the bar-only band-forcing to a
`CATEGORICAL_X = new Set(['bar','box','violin','jitter'])` used by `#resolveXType`
and `xScale`'s `bandX`, so numeric periods (e.g. week numbers) still get a band
x-axis for these geoms. **Additive** — bar behavior unchanged (the
`orientation !== 'horizontal'` guard stays; box/violin/jitter are always vertical).

### 5. Exports + demo

- **`index.js`**: add `Box`, `Violin`, `Jitter` to the `Plot` namespace object; add
  `GeomJitter` export (alias to `geoms/Jitter.svelte`) for symmetry with the other
  `Geom*` aliases.
- New **demo page in `apps/learn`** following the existing per-component chart-demo
  pattern, showing Box (with outliers), Violin, and Jitter (`jitter` + `swarm`) over
  the same distribution dataset. Confirms the geoms compose under `Plot.Root`.

## Testing (TDD, house style)

- `stats` spec: Tukey clamping (whiskers = data extremes within fence) + `outliers`
  extraction; no-outlier case; single-value-per-group case.
- `marks/boxes` spec: outlier `cy` mapping in grouped and non-grouped paths.
- New `marks/swarm` spec: `jitter` determinism (same input → identical offsets);
  `swarm` non-overlap (no two placed points within `2r`) and determinism.
- Component specs: `Plot.Box` renders `box-outlier` circles for known outliers;
  `Plot.Jitter` renders N points for both methods.
- `bun run test:ci` + `bun run lint` green before finish.

## Out of scope (YAGNI)

- Horizontal box/violin/jitter orientation.
- Configurable whisker multiplier (fixed 1.5·IQR).
- Tooltips beyond the existing hover wiring.
- Changes to the older brewer-based `charts/BoxPlot.svelte` / `charts/ViolinPlot.svelte`.

## Files touched

| File | Change |
| --- | --- |
| `packages/chart/src/lib/brewing/stats.js` | Tukey clamp + `outliers` in `applyBoxStat` |
| `packages/chart/src/lib/brewing/marks/boxes.js` | outlier `cy` in `buildBoxes` |
| `packages/chart/src/lib/brewing/marks/swarm.js` | **new** — `buildSwarm` |
| `packages/chart/src/geoms/Box.svelte` | render outlier circles |
| `packages/chart/src/geoms/Jitter.svelte` | **new** geom |
| `packages/chart/src/PlotState.svelte.js` | `CATEGORICAL_X` band-forcing + outliers in box domain |
| `packages/chart/src/index.js` | `Plot.Box/Violin/Jitter`, `GeomJitter` exports |
| `packages/chart/spec/**` | new + updated specs |
| `apps/learn/**` | new distribution-geoms demo page |
