# Spark: Plot + geom composition for sparklines

**Date:** 2026-08-20
**Status:** Design approved
**Package:** `packages/chart`
**Cycle:** 1 of 2 — cycle 2 is the radar/spider geom, specced separately once this lands

## Problem

`Sparkline.svelte` (312 lines) is a **parallel render path**. It computes its own scales and emits its
own line/area/bar geometry, duplicating what `geoms/Line.svelte`, `geoms/Area.svelte` and
`geoms/Bar.svelte` already do through `PlotState` + `GeomState`.

The duplication is only in the *rendering*. The pure layer is already shared — `Sparkline` imports the
same `lib/highlight.js` and `lib/trend.js` that the chart overlays use, and it uses the same
`data-plot-*` hook *vocabulary*. It does **not** share the geoms' DOM *structure* — see the Correction
section below, which is the single most important constraint on this work.

The cost of the parallel path is paid on every new geom: adding radar (cycle 2) under the current
design means writing a bespoke `SparkRadar` that shares nothing with `geoms/Radar.svelte`. That
scales badly — every geom needs a hand-written spark twin.

`GeomState`'s own doc comment states the intent this violates:

> This is the integrated version of the old brewer idea — one shared path, not a parallel one.

## Goals

1. A **`Spark` container** that provides geom context, so sparks compose the same way plots do:
   `<Spark><Line /><Trend /></Spark>`.
2. **Zero changes to any existing geom.** Every geom and overlay works inside `Spark` unmodified.
3. **`Sparkline` stays working** — same props, same DOM hooks, existing tests and e2e green
   *unmodified*.
4. Sparks stay cheap enough for hundreds of inline instances (a table column of sparklines).

## Non-goals

- The radar geom — cycle 2. This spec must not add polar code.
- `SparkRadar` — obsolete by design once `Spark` exists. Never written.
- Spark tooltips, `selectable`/Highlight multi-select, zoom, crossfilter, facets.
- Deprecating `Sparkline`. It remains the useful one-liner for the common case.

## Correction (2026-08-20, after review)

The first draft of this spec claimed Sparkline's DOM contract was already aligned with the geoms
because both use `data-plot-*` hooks. **That was wrong** — they share a prefix, not a structure:

| Hook | In `Sparkline` | In any geom |
| --- | --- | --- |
| `data-plot-area` | yes | **no** |
| `data-plot-area-sign` (`above`/`below`) | yes | **no** |
| `data-plot-baseline` | yes | **no** |

`data-plot-area-sign` is the baseline-anchored negative-fill split shipped as **#148 on 2026-08-19**.
`geoms/Area` renders a single fill and has no equivalent, so refactoring `Sparkline` onto it as
originally written would both break tests and **regress a feature shipped the day before**.

Resolution (chosen): port negative-fill into `geoms/Area` as part of this cycle, so the geom gains
the capability and `Sparkline` can sit on top of it losslessly. §5a below covers the port.


## Correction 2 (2026-08-20) — patterns, and geom channel inheritance

Two findings from building the `Spark` container, both of which invalidated parts of §5.

### Geoms do NOT inherit channels from the container

`GeomState.marks` reads channels from the geom's **own props only** — there is no fallback to the
container's channels. `<Spark><Line /></Spark>` renders `NaN` paths; it must be `<Line {x} {y} />`.
`charts/LineChart.svelte` already forwards `{x} {y}` to `<Line>` explicitly for this reason, even
though `Plot`'s own config carries them.

Every `<Spark>` usage example in this spec and in the implementation plan showing a bare `<Line />`
is **wrong** and must pass `x`/`y`.

### Patterns route through the SHARED mechanism, not a literal special case

`Sparkline` takes a literal pattern name (`pattern="diagonal"`). The geoms treat `pattern` as a
data-field channel resolved via `plotState.patterns`. Initially these looked irreconcilable —
criterion 2 (27 tests unmodified) versus goal 2 (zero geom changes).

They aren't. `DefinePatterns` renders id `toPatternId(key)` with marks `PATTERNS[patternName]` for
each `[key, patternName]` in `state.patterns`; `buildAreas` computes
`patternId = toPatternId(row[patternField])`. **Both sides call `toPatternId` on the same value**, so
they agree by construction. The false constraint was assuming a literal name must pass through
`assignPatterns`, which assigns patterns by index — `SparkState` builds its own Map and can map a
value to *itself*.

Resolution, requiring **no geom change**:

- `Sparkline` includes the pattern name as an ordinary data column on the rows it builds, and passes
  that column as the geom's `pattern` channel.
- `SparkState.patterns` returns `Map([[name, name]])` when a pattern is set, else an empty Map.
- The geom resolves `url(#chart-pat-diagonal)` — verified end-to-end against a real `Area` render.

**Why a literal is the only sensible spark case:** sparks are single-series. The chart pattern system
exists to distinguish groups, and a spark has no grouping to encode. So "texture this fill" is the
only meaning available — which is exactly what the literal form expresses. Data-driven patterning is
not a gap here; it is inapplicable.

This supersedes §5's implication that `pattern` passes straight through to the geom unchanged.

## Key insight

`PlotState` is **already assembled from pure, reusable modules**:

```js
import { applyGeomStat } from './lib/plot/stat.js'
import { buildUnifiedXScale, buildUnifiedYScale } from './lib/plot/scales.js'
import { distinct, assignColors } from './lib/brewing/colors.js'
import { defaultPreset } from './lib/preset.js'
```

So `SparkState` is a **thin composition of the same modules**, not a reimplementation. It omits the
parts a 80×24 inline glyph has no use for.

Precedent that a lightweight context can drive the real geoms: `spec/helpers/mock-plot-state.js`
(`createMockState`) already duck-types `PlotState` and drives real geoms across the chart test suite.

## Design

### 1. `SparkState` — `src/SparkState.svelte.js`

Publishes on the **same `'plot-state'` context key** so geoms resolve it with no edits.

Composes (does not reimplement):

| Concern | Reused from |
| --- | --- |
| x/y scales | `lib/plot/scales.js` — `buildUnifiedXScale`, `buildUnifiedYScale` |
| Stat pipeline | `lib/plot/stat.js` — `applyGeomStat` |
| Categorical colours | `lib/brewing/colors.js` — `distinct`, `assignColors` |
| Per-geom opacity | `lib/preset.js` — `defaultPreset` |

**Deliberately omitted** (this is where the weight goes): zoom, crossfilter, selection sets, facets,
patterns, symbols, tooltip/format/label helpers, axis positions (`xAxisY`/`yAxisX`), orientation
flipping, animation gating, continuous/diverging colour scales.

### 2. The geom-facing contract

Enumerated by static scan of `geoms/` (`plot.*` in adapters, `plotState.*` in components). `SparkState`
must implement all of it:

**Scales and dimensions** — `xScale`, `yScale`, `innerWidth`, `innerHeight`
**Geom lifecycle** — `registerGeom`, `updateGeom`, `unregisterGeom`, `geomData`
**Data** — `data`, `channels`
**Aesthetics** — `colors`, `patterns`, `symbols`, `chartPreset`
**Orientation** — `place`, `isFlipped`, `orientation`
**Colour typing** — `continuousCategory`, `continuousColorScale`
**Interactivity** — `interactive`, `handleSelect`, `setHovered`, `clearHovered`

Spark-specific values: `place` is identity, `isFlipped` is `false`, `orientation` is `'vertical'`,
`patterns`/`symbols` are empty `Map`s, `continuousColorScale` is `null`, `interactive` is `false`,
and `setHovered`/`clearHovered`/`handleSelect` are no-ops.

**`data` must return the same array identity the geoms receive from `geomData()`.** A previous bug
(journal 2026-08-13) had `PlotState` holding `#data` and `#rawData` as separate `$state` fields,
giving distinct proxy identities so `plotState.data.indexOf(pt.data)` returned `-1`. `SparkState` must
not repeat this.

### 3. Conformance test

The standing risk is drift: if `PlotState` grows a member the geoms read, `SparkState` breaks at
runtime in a consumer's table cell.

A conformance test asserts `SparkState` implements every member in §2, checked against `PlotState`
for both presence and kind (method vs accessor). It fails in CI the moment the surfaces diverge.

The member list lives in one exported constant shared by the test and documented as the contract, so
there is a single place to update when the surface legitimately changes.

### 4. `Spark` container — `src/Spark.svelte`

```svelte
<Spark data={rows} x="day" y="sales" width={80} height={24}>
  <Line />
  <Trend trend="avg" />
</Spark>
```

Creates `SparkState`, sets the `'plot-state'` context, renders a bare `<svg>` with no margin and no
chrome. Defaults inherited from `Sparkline`: 80×24.

Props: `data`, `x`, `y`, `color`, `width`, `height`, `min`, `max`, `baseline`, `children`.

### 5a. Port negative-fill into `geoms/Area`

`buildAreas` gains a `baseline` option. When set, an area crossing it splits into two segments
carrying `sign: 'above' | 'below'`; when unset, behaviour is byte-identical to today.

`geoms/Area.svelte` **adds** attributes rather than changing them — `data-plot-geom="area"` and
`data-plot-element="area"` stay exactly as they are, so every existing chart consumer and Area test
is unaffected. New: `data-plot-area` on each segment path, plus `data-plot-area-sign` when a baseline
is in effect.

This is what makes criterion 2 achievable: additive on the chart side, sufficient on the spark side.

### 5b. Hooks `Sparkline`'s tests depend on

Enumerated from the 27 specs, with the post-refactor provider for each:

| Assertion | Count | Provided by |
| --- | --- | --- |
| `svg` | 3 | `Spark` root |
| `rect`, `rect[fill^="url("]` | 7 | `geoms/Bar` (already emits `<rect>`) |
| `[data-plot-baseline]` | 6 | `Spark` (owns the baseline — see below) |
| `[data-plot-highlight]` | 5 | `geoms/Highlight` (already emits it) |
| `[data-plot-trend]` | 5 | `geoms/Trend` (already emits it) |
| `path`, `path[fill^="url("]` | 5 | `geoms/Line` / `geoms/Area` |
| `[data-plot-area]`, `[data-plot-area-sign]` | 3 | `geoms/Area` after §5a |
| `defs pattern` | 1 | `Spark` renders `<DefinePatterns />`, as `PlotSurface` does |

**The baseline line belongs to `Spark`, not a geom.** It already owns the domain extension, and the
baseline applies to bar sparks too (not just area). `Spark` renders
`<line data-plot-baseline>` when given `baseline`, and Sparkline's `[data-plot-baseline]` CSS moves
to `Spark` with it. `Rule` is not used — it emits `data-plot-element`/`data-plot-geom`, not
`data-plot-baseline`, and bending it to do so would be worse than one line of SVG in the container.

This supersedes §5's earlier claim that `baseline` maps to `<Rule>`.

### 5. `Sparkline` becomes a wrapper

| Current prop | Becomes |
| --- | --- |
| `type='line' \| 'area' \| 'bar'` | `<Line />` / `<Area />` / `<Bar />` |
| `trend` | `<Trend {trend} />` |
| `highlight` | `<Highlight {highlight} />` |
| `baseline` | `Spark`'s `baseline` prop (domain + line) — see §5b |
| `data`, `field`, `color`, `width`, `height`, `min`, `max` | passed to `Spark` |
| `curve` | `options={{ curve }}` on the geom |
| `pattern` | the geom's `pattern` prop (`Area`/`Bar` only — a line has no interior) |

`curve` needs no new geom code: `geoms/lib/marks/line.js` already forwards `options.curve` to
`buildLines`, which handles `'linear' \| 'smooth' \| 'step'`. `Sparkline` exposes only
`linear`/`smooth`; `step` becomes reachable through `Spark` at no cost.

**`baseline` does two jobs** and splits accordingly:

- *Extending the y-domain* so the baseline and the full negative extent stay on-canvas — a scale
  concern.
- *Drawing the line* and *anchoring the area/bar fill* — see §5a/§5b.

Both stay on `Spark` as a single `baseline` prop, which it forwards to the geoms as
`options.baseline`.

Bar auto-anchoring at 0 when any value is negative stays `Sparkline` behaviour, expressed by passing
the resolved baseline to `Spark`.

`Sparkline` keeps `number[] | Record[]` + `field` normalisation; `Spark` takes rows + channels like
every other container.

### 6. Exports

`SparkState` and `Spark` join `src/index.js`. Geoms are already exported as `GeomLine`, `GeomArea`,
`GeomBar`, `GeomTrend`, `GeomHighlight` — no new geom exports needed.

## Acceptance criteria

1. `<Spark>` + `<GeomLine>` renders a line sparkline with no changes to `geoms/Line.svelte`.
2. Every existing `Sparkline` test (27) and `apps/learn/e2e/sparkline.e2e.ts` passes **unmodified**.
   This is the definition of backward compatible — not a claim in a commit message. §5b maps every
   assertion to its post-refactor provider; if any needs editing, the design is wrong, not the test.
3. Every existing `geoms/Area` test passes **unmodified** — the §5a port is additive only.
4. The conformance test fails when a member is removed from `SparkState`.
5. `Trend` and `Highlight` render inside `Spark` from context, with no spark-specific branches.
6. A spark geom's rendered pixel geometry inside `Spark` matches the same geom inside `Plot` at the
   same dimensions — asserted in browser mode, where geometry is real.
7. `geoms/Area` with `options.baseline` splits into `above`/`below` segments; without it, output is
   unchanged.
8. Coverage gates hold: 100% statements+lines on `SparkState.svelte.js` and the `buildAreas` changes,
   ≥90% on `Spark.svelte` and the refactored `Sparkline.svelte`.
9. `bun run check` green; `bun run test:browser` green.

## Testing

**jsdom** (`packages/chart/spec/`)

- `SparkState`: scale construction, stat passthrough, colour assignment, geom register/update/
  unregister/geomData, `data` identity alignment.
- Conformance test (§3).
- `Spark`: context provision, dimensions, no-chrome output.
- `Sparkline`: the existing 27 specs, unmodified.

**Browser mode** (`packages/chart/browser/`)

- Spark-vs-Plot geometry parity (criterion 5) — needs real layout, so it cannot live in jsdom.

## Risks

| Risk | Mitigation |
| --- | --- |
| `SparkState` drifts from `PlotState`'s geom surface | Conformance test (§3) |
| `Sparkline` refactor changes DOM and breaks consumers | Hooks already aligned (`data-plot-*`); criterion 2 forbids touching the existing tests |
| A geom reads a `PlotState` member `SparkState` stubs as a no-op and misbehaves silently | Geometry-parity test (criterion 5) compares real output against `Plot` |
| Perf claim is unverified | Benchmark a 200-cell table during implementation and **report the measured number**. If `SparkState` is not materially cheaper, say so — the composition win stands on its own, but the perf claim must not be asserted without evidence. |

## Known limitation

`Spark` gives no way to render axes, legends or tooltips — by design. A consumer who outgrows that
should use `Plot` with chrome disabled, which is the documented upgrade path.

## Cycle 2 preview (not in scope)

With `Spark` in place, the radar geom is:

- `lib/brewing/polar.js` — pure layout (axes, per-axis radial scale, rings)
- `geoms/lib/marks/radar.js` — adapter
- `geoms/Radar.svelte` — self-contained grid via `options.grid`, vertex-level `onselect`
- `charts/RadarChart.svelte` — `<Plot grid={false} axes={false}>` wrapper, like `PieChart`

Decisions already taken for cycle 2: per-axis radial normalisation with opt-in `sharedDomain`;
negative values extend that axis's domain rather than clamp to centre; duplicate `(series, axis)`
cells average; axis order is the explicit `axes` prop else first-appearance order; grid is owned by
the geom (accepted tradeoff: not independently replaceable).
