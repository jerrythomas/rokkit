# Radar / spider geom

**Date:** 2026-08-20
**Status:** Design approved — revised after depth, feasibility and dataviz review
**Package:** `packages/chart`
**Cycle:** 2 of 2 — cycle 1 was `Spark` (`2026-08-20-spark-plot-geom-architecture-design.md`), shipped

## Problem

`@rokkit/chart` has no way to plot a multi-dimensional profile — one series measured across N named
axes. That is the radar/spider/kiviat form, the natural chart for scorecards and capability
comparisons.

## Why now

Cycle 1 replaced `Sparkline`'s parallel render path with `Spark` — a lean context on the same
`'plot-state'` key `PlotState` uses, so any geom composes into a spark. **`SparkRadar` is obsolete
and will not be written.**

## Revision note

The first draft was reviewed three ways before implementation: a depth gate, a feasibility pass
against the real code, and a dataviz-correctness pass. All three found substantive problems,
including a **provably wrong angle formula backing an acceptance criterion**. Everything below
marked ⚠ is a correction to that draft, kept visible so the reasoning isn't lost.

## Goals

1. A `Radar` geom usable inside `Plot` (via `RadarChart`) and inside `Spark`, with no spark-specific
   code in the geom itself.
2. Mixed units readable without consumer pre-normalisation — **and honest about it**, per §Radial
   scale.
3. Interactivity matching the `Point`/`Bar`/`Line` contract in the `Plot` form.
4. Layout built so weighted axes can be added later without restructuring.
5. **Accessible in both forms.** Cycle 1 shipped `Spark` with no accessible name and no data
   fallback; that is fixed here rather than compounded.

## Non-goals

- Weighted axes this cycle (angles equal; layout weight-ready).
- Polar `Grid`/`Axis` components — the geom owns its grid.
- `selectable` / Highlight multi-select.
- Stacked or faceted radar; animated transitions.
- Arrow-key traversal between vertices (see §Interactivity).
- `SparkRadar`.

## Site and docs scope

The learn site browses charts and sparks **generically** via the explorer and guides, not per-geom
routes. Radar needs: a chart-explorer registry entry so it's reachable by existing navigation;
guides coverage at the same depth as other geoms (what it's for, **when it misleads**, the API);
and reachability in spark form. Cycle 1's `Spark` composition guidance lands in the same pass.

NOT in scope: a bespoke radar demo route, playground, or Koan catalog entry.

## Architecture

Radar ignores `xScale`/`yScale`, computing polar geometry from `innerWidth`/`innerHeight` and
centring via a transform.

| Layer | File | Role |
| --- | --- | --- |
| Pure layout | `src/lib/brewing/polar.js` | `buildRadarLayout(...)` → axes, vertices, rings. No Svelte, no context. |
| Geom adapter | `src/geoms/lib/marks/radar.js` | `buildRadarMarks(ctx)` — colours, alpha, paint order |
| Geom | `src/geoms/Radar.svelte` | `GeomState` registration, renders grid + polygons + hit targets |
| Wrapper | `src/charts/RadarChart.svelte` | `<Plot grid={false} axes={false}>` + `<Radar>` |

⚠ **Two precedents, not one.** `Arc` is the precedent for *geometry* (ignores both scales, centres
with a transform, wrapped by `PieChart` with chrome off). It is **not** the precedent for
interactivity — `Arc.svelte` calls `onselect` bare and never touches `buildSelectDetail`. The
interactivity precedent is `Point`/`Bar`/`Line`. The first draft conflated these.

⚠ Use **d3-shape's `lineRadial`** for the polygon path rather than hand-rolled trig — already a
dependency, and the same idiom `lines.js` uses with `line()`.

## API

```svelte
<Radar axes={['revenue','csat','latency']} axis="metric" value="score" series="team" />
<!-- → channels { x: axis, y: value, color: series, pattern } -->
```

Long-format data — one row per (series × axis).

⚠ **Radar takes its own channel props.** `GeomState.marks` passes the geom's own config through; it
does not fall back to the container. But the framing "there is no fallback" in the first draft was
imprecise: `geomData()` in **both** `PlotState` and `SparkState` merges
`{...containerChannels, ...geomChannels}` before running the stat. So a partially-specified geom
would be *grouped* using inherited channels while `buildRadarMarks` receives `undefined` for the
same channel — an inconsistency. Radar must always supply all channels explicitly.

⚠ **`pattern` is supported**, matching `Bar`/`Area`/`Box`/`Violin`/`Arc`. This is not decoration:
overlapping translucent polygons wash out at their intersections, and pattern is the non-colour
channel that keeps series distinguishable for colour-vision-deficient readers.

⚠ Register `radar` in `Plot.svelte`'s `GEOM_COMPONENTS` map, for consistency with `arc` on the
spec-driven path.

## Radial scale

**Per-axis by default**, with the scale made **visible** — each axis label carries its own end value,
e.g. `Latency (max 350ms)`. Per-axis is right for the mixed-unit scorecard case, but without a
visible scale it invites reading equal radii as equal values. Labelling the axis end is cheaper than
a full per-spoke tick ladder and directly neutralises the ambiguity.

⚠ **The domain→radius mapping, stated explicitly** (unspecified in the first draft, and every other
radial claim depends on it):

```
radius(v, axis) = R × (v - domain.min) / (domain.max - domain.min)
```

One linear scale per axis. **The centre is `domain.min`, not zero.** For a non-negative axis that
coincides; for `[-5, 10]` the centre is `-5` and zero sits at `R × 5/15`.

- **Negatives extend, they do not clamp.** An axis containing a negative gets `[min, max]` instead
  of `[0, max]`. Clamping would silently delete data.
- ⚠ **Zero-reference marker.** Because the hub then means different things on different spokes, any
  axis whose domain excludes zero renders a dashed zero-ring segment on that spoke, so a reader can
  find "nothing". Without it an all-zeros row bows outward instead of collapsing to the centre,
  which contradicts how radars are read.
- ⚠ **`sharedDomain` join rule:** `[min of all values across all series×axes, max of the same]`,
  applying the negatives-extend rule globally.
- **Known instability, documented:** per-axis domains derive from the rows present, so filtering a
  comparator series out moves the remaining series' radii. The visible axis maxima make this legible
  rather than silent. Consumers needing frozen shapes should pass explicit `min`/`max` per axis.

## Layout

⚠ **Corrected angle formula.** The first draft gave
`-90° + 360° × (cumulativeBefore(i) + w[i]/2) / total` and claimed it reduces to `-90° + i × 360/n`
at equal weights. **It does not** — it is off by exactly `180/n` (half a sector) for every n,
putting the first axis at −45° rather than −90° for n=4. The `w[i]/2` term places an axis at its
wedge *midpoint*, which is the right weighted semantics but breaks "first axis at top". Subtracting
the first axis's half-wedge restores both:

```js
angleOf(i) = -90° + 360° × (cumulativeBefore(i) + w[i]/2 - w[0]/2) / totalWeight
```

Verified: reduces **exactly** to `-90° + i × 360/n` at equal weights for n = 3, 4, 5; and for
`w = [2,1,1]` yields wedge widths 180°/90°/90° with axis 0 at top. A test asserts the reduction.

**Axis order** comes from the `axes` prop. ⚠ If omitted, fall back to first-appearance **and
`console.warn` in dev** — matching the existing precedent in `stat.js` and `preset.js`, which warn
when silently patching over something. Order is an analytical choice; inferring it from incidental
row order makes the shape depend on upstream sort.

⚠ **Missing `(series, axis)` cells** render as a gap in the polygon — never defaulted to zero, which
would invent data. ⚠ An `axes` prop naming an axis absent from the data renders that spoke empty;
data containing an axis absent from `axes` is dropped, with a dev warn.

⚠ **Rings are evenly spaced in radius** (`i/rings × R`), which follows from the linear mapping above.

⚠ **Axis labels** sit at `R + labelGap` with `text-anchor` flipped by hemisphere (`start` right of
centre, `end` left, `middle` at top and bottom). `buildArcs` reserves no margin — radar must reduce
its outer radius to leave room, or labels clip the viewport. No collision handling at high axis
counts; documented, with the axis cap below as the practical mitigation.

## Duplicate cells

Averaged **inside `buildRadarLayout`**, not via a `stat` default.

Reasoning: routing through `applyGeomStat` calls `groupDataByKeys`, which builds fresh row objects
containing only the group keys plus the summarised value — breaking `===` identity with
`plotState.data` and dropping every other field. Every existing geom computes
`index` as `plotState.data.indexOf(row)`, so aggregated rows would yield `index === -1` and lose
metadata in `onselect`. Aggregation is radar's *common* path, so it cannot degrade interactivity.

⚠ Duplicates also `console.warn` in dev. A repeated `(series, axis)` is nearly always a data bug —
axis is a small fixed enum, not a repeated-measurement field.

`stat` remains exposed for explicit aggregation. Note the built-in is **`mean`**, not `avg`.

## Grid and paint order

`options.grid` with `rings` (default 4) concentric polygons plus one spoke per axis, behind the
polygons.

⚠ **Paint order: all fills, then all strokes.** Otherwise a smaller series nested inside a larger one
has its outline buried under the next series' fill — invisible in the chart while present in the
data.

⚠ **`defaultPreset.opacity` has no `radar` entry**, so `resolveAlpha` would fall back to `1` and
render fully opaque overlapping polygons, hiding all but the top series. Add `radar: 0.25` (fill);
strokes stay opaque.

⚠ **A legend is required for 2+ series.** `RadarChart` mirrors `PieChart`, whose `legend` defaults to
`false` — radar must default it **on** when more than one series is present. Colour-matching alone is
not sufficient identification, especially with washed-out fill intersections.

**Accepted tradeoff:** the grid can't be replaced or restyled independently the way
`Grid`/`Axis`/`Legend` can. Upgrade path is a polar descriptor on `PlotState` that a composable
`RadarGrid` could read — deliberately not built now.

## The two forms

### Full form — inside `Plot` / `RadarChart`

Grid, axis labels with visible maxima, legend when multi-series, per-vertex hit targets.

### ⚠ Micro form — inside `Spark`: a static glyph

The first draft specced full grid and per-vertex keyboard interactivity at ~28×28px. A 24px minimum
hit target does not fit once at that size, let alone 5–7 times — arithmetic, not judgement.

Inside `Spark`, radar renders the **polygon only**: no rings, no spokes, no labels, no hit targets,
no tooltips. One `aria-label` on the container summarises the profile. A gestalt shape, exactly as a
sparkline is.

⚠ Axis cap **3–5** in the micro form with a dev warn, replacing "not capped; documented".

The geom detects context via `plotState.interactive` — already `false` on `SparkState` and part of
the 23-member `GEOM_CONTRACT` — so no spark-specific branch is needed in the geom.

## Interactivity

Vertex hit targets in the full form only: focusable, Enter/Space activation, `onselect` with the
standard `buildSelectDetail` shape, tooltips.

⚠ Do **not** use the `keyboardNav` action. It does linear left/right traversal over DOM order, built
for `Point`/`Bar`'s 1-D category list; radar vertices are logically 2-D (series × axis). Use the
per-element `onkeydown` pattern `Arc`/`Point` use for tab-reach plus Enter/Space. Arrow-key traversal
across a vertex grid is a non-goal.

## ⚠ Accessibility

Cycle 1's gap, fixed here rather than shipped through.

- **`Spark` gains an accessible name and data fallback.** `Spark.svelte` currently renders a bare
  `<svg data-spark>` with no `role`, `aria-label` or `<title>` — every spark is invisible to
  assistive tech today. It gains `role="img"`, an `aria-label` (a `label` prop, else a generated
  summary), and an sr-only textual summary.
- **`Plot`'s inherited sr-table must be checked for radar**, not assumed. `Plot.svelte` renders a
  `plot-sr-table`, but `tableColumns` falls back to `Object.keys(firstRow)` — for long-format radar
  rows that is a flat 3-column dump rather than a pivoted series×axis matrix. An acceptance criterion
  covers this rather than trusting inheritance.
- Series are distinguishable without colour, via the `pattern` channel.

## Acceptance criteria

1. `buildRadarLayout` is pure — no Svelte import, no context.
2. ⚠ With equal weights, `angleOf(i)` equals `-90° + i × 360/n` **exactly**, asserted for n = 3, 4, 5.
3. ⚠ `radius(v, axis)` matches the stated formula, asserted with a `[-5, 10]` axis where zero is at
   `R × 5/15` — not at the centre.
4. Per-axis normalisation: two axes with different maxima both reach the outer ring at their own max.
5. `sharedDomain` differs from per-axis — asserted with inputs where the two modes **disagree**.
6. A negative value extends its axis domain; that axis renders a zero-reference marker.
7. Duplicate `(series, axis)` rows average **and** `onselect` still resolves a real `index` (not
   `-1`) with non-channel fields intact.
8. Missing cells render a gap; nothing is defaulted to zero.
9. ⚠ Omitting `axes` warns in dev; supplying it produces a deterministic order.
10. `<Radar>` renders in both `<Plot>` and `<Spark>` with no spark-specific code in the geom.
11. ⚠ In `Spark`: no grid, no hit targets, and the container carries an accessible name.
12. ⚠ In `Plot`: legend present by default for 2+ series; fills at `preset.opacity.radar`, not 1.
13. ⚠ Paint order — a nested smaller series' stroke is not covered by a larger series' fill.
14. ⚠ `Plot`'s sr-table renders something legible for radar's long-format rows.
15. Every existing test in the repo passes **unmodified**.
16. Coverage: 100% statements+lines on new `.js`, ≥90% on `.svelte`.
17. `bun run check` and `bun run test:browser` green.

## Testing

**jsdom** — layout maths (angles, radii, rings, normalisation, negatives, duplicates, missing
cells), mark building, warnings, rendering, interactivity, accessibility attributes.

**Browser mode** — real geometry: a vertex lands at the pixel its angle and radius imply, asserted
against the **pinned formula's output**, not merely self-consistency. Also: `<Radar>` in `<Spark>`
versus in `<Plot>`, and computed-style checks on fill opacity and paint order — the class of
regression cycle 1 found only by reasoning (an area fill silently at ~0.15 effective opacity).

### Test-quality rules carried from cycle 1

Six cycle-1 tests passed while the code was broken; each asserted something *adjacent* to the
behaviour. Binding, not advisory:

- Assert the value the feature computes, not a property that survives the feature being wrong.
- Never loop a collection without first asserting it is non-empty.
- Where a test's name promises a difference, construct inputs where a broken implementation gives a
  **different** answer.
- `.not.toThrow()` is never sufficient for a no-op claim.
- Before committing, break the implementation and confirm the test notices. Report the outcome.

## Known limitations

- Radar area scales quadratically with radius, so a 2× difference reads as ~4×. Documented at the
  point of use, not just here. ⚠ When weighting lands it should pair with a sqrt-radius option so
  area tracks value (Nightingale-rose logic); bolting weighted angles onto a linear radius would
  compound this.
- Per-axis domains move when the comparison set changes (mitigated by visible axis maxima).
- No axis-label collision handling; the axis cap is the practical mitigation.
- ⚠ `lib/brewing/scales.js` — cited in the first draft as a placement sibling — has **zero
  production importers** and is effectively dead. The live scale module is `lib/plot/scales.js`.
  Placement of `polar.js` in `brewing/` still holds on the `colors.js`/`patterns.js` precedent.
