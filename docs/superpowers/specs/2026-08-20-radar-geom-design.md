# Radar / spider geom

**Date:** 2026-08-20
**Status:** Design approved
**Package:** `packages/chart`
**Cycle:** 2 of 2 — cycle 1 was `Spark` (`2026-08-20-spark-plot-geom-architecture-design.md`), shipped

## Problem

`@rokkit/chart` has no way to plot a multi-dimensional profile — one series measured across N
named axes. That is the radar/spider/kiviat form, and it is the natural chart for scorecards,
capability comparisons and any "how does this thing score across these dimensions" question.

## Why now

Cycle 1 replaced `Sparkline`'s parallel render path with `Spark` — a lean context published on the
same `'plot-state'` key `PlotState` uses, so any geom composes into a spark unchanged.

That makes radar strictly cheaper than it would have been. Under the old design, a micro radar meant
writing a bespoke `SparkRadar` sharing nothing with the full geom. **`SparkRadar` is now obsolete and
will not be written** — `<Spark><Radar …/></Spark>` works for free.

## Goals

1. A `Radar` geom usable inside `Plot` (via a `RadarChart` wrapper) and inside `Spark`, with no
   spark-specific code.
2. Handle mixed units sensibly — a profile across revenue, satisfaction and latency must be readable
   without the consumer pre-normalising.
3. Vertex-level interactivity matching the other geoms' contract, so radar isn't second-class.
4. A layout module built so **weighted axes can be added later without restructuring**.

## Non-goals

- **Weighted axes in this cycle.** Angles are equal. See "Weight-ready, not weighted" below.
- Polar `Grid`/`Axis` components — the geom owns its grid (decision below).
- `selectable` / `bind:selected` multi-select via the Highlight overlay — Highlight positions marks
  from cartesian scales.
- Stacked or faceted radar; animated transitions.
- `SparkRadar` — obsolete by design.

## Architecture

Radar cannot use `xScale`/`yScale`. It follows the **`Arc` precedent**: compute polar geometry from
`innerWidth`/`innerHeight`, centre with a transform, and let the wrapper disable cartesian chrome
(`PieChart` does exactly this — `<Plot grid={false} axes={false}>`).

| Layer | File | Role |
| --- | --- | --- |
| Pure layout | `src/lib/brewing/polar.js` | `buildRadarLayout(...)` → axes, per-series vertices, rings. **No Svelte, no context.** |
| Geom adapter | `src/geoms/lib/marks/radar.js` | `buildRadarMarks(ctx)` — pulls `colors`/`chartPreset` off `plot`, applies `resolveFillStroke`/`resolveAlpha` |
| Geom | `src/geoms/Radar.svelte` | `GeomState` registration, renders grid + polygons + vertex hit targets |
| Wrapper | `src/charts/RadarChart.svelte` | `<Plot grid={false} axes={false}>` + `<Radar>`, mirroring `PieChart` |

It lives in `lib/brewing/polar.js` rather than `marks/radars.js` because it is a **layout** (angles,
radii, rings), not a mark set — sitting alongside `scales.js`/`stats.js`/`symbols.js`. That also keeps
it plot-free, which is what makes it reusable.

## API

Following `Arc`'s pattern of domain-meaningful **prop** names mapped to standard **channels**
internally (`Arc`'s `theta` → `channels.y`):

```svelte
<Radar axis="metric" value="score" series="team" />
<!-- → channels { x: axis, y: value, color: series } -->
```

Long-format data — one row per (series × axis). The stat pipeline, palette and legend then work
unchanged.

### Radar must take its own props — it does not inherit from the container

Cycle 1 established this the hard way: `GeomState.marks` reads channels from the geom's **own props
only**. There is no fallback to the container's channels. `<Spark><Radar /></Spark>` would render
nothing; it must be `<Radar axis="metric" value="score" />`.

Every usage example in this spec and its plan passes the props explicitly. Do not "simplify" them.

## Radial scale

**Per-axis by default.** Each spoke normalises to `[0, max]` of that axis, so mixed units are
comparable at a glance. `sharedDomain` switches to one domain across all axes for genuinely
comparable metrics.

Two semantics stated explicitly rather than left to discovery:

- **Negatives extend, they do not clamp.** If any value on an axis is negative, that axis's domain
  becomes `[min, max]` rather than `[0, max]`. Clamping to the centre would silently hide data.
- **Duplicate `(series, axis)` cells are averaged**, and `stat` is exposed for explicit aggregation.

## Layout

Axis *i* sits at `-90° + i × 360/n` — first axis at top, clockwise.

**Axis order** is the explicit `axes` prop if given, else first-appearance order in the data. Stable
by construction, because arbitrary reordering changes what the shape means.

### Weight-ready, not weighted

Angles are equal in this cycle. But `buildRadarLayout` computes them from a weights array that
**defaults to equal**, so weighting later is a prop, not a restructuring:

```js
// weights default to equal; angle is a function over the cumulative weight
buildRadarLayout(data, channels, { weights = axes.map(() => 1), ... })
// angleOf(i) = -90° + 360° × (cumulativeBefore(i) + w[i] / 2) / totalWeight
```

With equal weights this reduces exactly to `-90° + i × 360/n`. **A test must assert that reduction
holds**, so the generalised form cannot silently drift from the simple one.

Weighting is deferred deliberately, not overlooked: unequal angles break the *regular polygon =
balanced profile* heuristic people use to read radars, and deciding whether weight should drive
angle, radius or annotation deserves its own design pass.

## Grid

The geom owns its grid — `options.grid` with `rings` (default 4) concentric polygons plus one spoke
per axis, drawn behind the polygons.

**Accepted tradeoff, recorded so it isn't rediscovered as a defect:** the grid cannot be replaced,
restyled or reordered independently the way `Grid`/`Axis`/`Legend` can on the cartesian side. A
consumer wanting a different ring style must fork the geom. The documented upgrade path is a polar
descriptor on `PlotState` (axis list + per-axis radial scale) that a composable `RadarGrid` could
read — deliberately not built now.

## Interactivity

Each polygon vertex is a focusable hit target firing `onselect` with the standard `buildSelectDetail`
shape, plus tooltips. No `selectable`/Highlight.

## DOM hooks

Planned deliberately, because cycle 1's most expensive lesson was assuming hook compatibility:

| Hook | On |
| --- | --- |
| `data-plot-geom="radar"` | the geom's root `<g>` |
| `data-plot-element="radar-area"` | each series polygon |
| `data-plot-element="radar-vertex"` | each vertex hit target |
| `data-plot-element="radar-grid-ring"` | each concentric ring |
| `data-plot-element="radar-grid-spoke"` | each axis spoke |
| `data-plot-element="radar-axis-label"` | each axis label |
| `data-plot-series` | series value, on polygon and vertex |
| `data-plot-axis` | axis value, on vertex and label |

These follow the existing `data-plot-geom` / `data-plot-element` convention rather than inventing a
parallel vocabulary — the mistake that cost cycle 1 two extra rounds.

## Acceptance criteria

1. `buildRadarLayout` is pure — no Svelte import, no context — and unit-testable standalone.
2. With equal weights, `angleOf(i)` equals `-90° + i × 360/n` exactly. Asserted.
3. Per-axis normalisation: two axes with different maxima both reach the outer ring at their own max.
4. `sharedDomain` makes them share one domain — asserted with inputs where the two modes **differ**.
5. A negative value extends its axis domain rather than clamping to the centre.
6. Duplicate `(series, axis)` rows average.
7. `<Radar>` renders inside **both** `<Plot>` and `<Spark>` with no spark-specific code.
8. Vertex `onselect` fires with the standard detail shape; vertices are keyboard-reachable.
9. Every existing test in the repo passes **unmodified**.
10. Coverage gates hold: 100% statements+lines on the new `.js` files, ≥90% on the `.svelte`.
11. `bun run check` and `bun run test:browser` green.

## Testing

**jsdom** — layout maths (angles, radii, rings, normalisation, negatives, duplicates), mark
building, rendering, interactivity.

**Browser mode** — real geometry: a vertex must land at the pixel its angle and radius imply. jsdom
reports zero for all geometry, so this cannot live there. Also: a `<Radar>` inside `<Spark>` must
render the same geometry as inside `<Plot>` at the same size.

### Test-quality rules carried from cycle 1

Six tests in cycle 1 passed while the code was broken. Every one asserted something *adjacent* to the
behaviour rather than the behaviour itself. These rules are part of the spec, not advice:

- Assert the value the feature computes, not a property that survives the feature being wrong.
- Never loop a collection without first asserting it is non-empty.
- Where a test's name promises a difference or precedence, construct inputs where a broken
  implementation gives a **different** answer.
- `.not.toThrow()` is never sufficient for a no-op claim.
- Before committing, break the implementation and confirm the test notices. Report the outcome.

## Known limitations

- `<Spark><Radar/></Spark>` at 28×28 fits roughly 5–7 axes before the polygon is unreadable. Not
  capped in code; documented.
- Radar area scales quadratically with radius, so area comparisons between series overstate
  differences. Inherent to the form; worth a documentation note.
