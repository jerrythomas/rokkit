# Geom orientation / axis-flip (horizontal support for all geoms)

**Date:** 2026-08-15
**Status:** ✅ SHIPPED (2026-08-15) — all value-axis geoms flip; see completion note below.

## Completion note

Delivered on `develop` (PR #145). Foundation (`isFlipped` / `place()` / orientation-aware
scale ranges, AnimatedPlot no-op guard) + all value-axis geoms flipping, live-verified:
**Point, Jitter, Box, Violin, Line, Area, Bar (grouped + stacked), Waterfall, Candlestick**,
and the **Axis** (category → left, value → bottom). Every geom places its corners/vertices/
edges through the single `plotState.place(band, value)` primitive (identity when vertical →
byte-identical, swap when flipped). Also folded in the **geom consolidation** — one
implementation per geom (deleted the duplicate `Plot/{Bar,Line,Area,Point}.svelte`
primitives; `Plot.*` now points at `geoms/*` like Box/Violin/Jitter already did).

**Deliberately N/A** (no value axis to reorient): Hexbin (both continuous → no-op),
Heatmap (both categorical → transpose is a separate feature), Ribbon (sankey/flow layout),
Arc/pie (radial).

Commits: `86085fe4` foundation+Point/Jitter, `dd95c3f0` Box, `9f73bb7f` Violin, `9fdf03c0`
Line/Area/Axis, `fc1d7fad` consolidation, `8a012ced` Bar, `76e97675` Waterfall/Candlestick.

## Goal

Support **horizontal orientation** across all cartesian geoms via a single
`orientation` (a.k.a. flip) control, so the same chart can render vertically or
horizontally without the caller rethinking channels.

## Decisions (locked with user)

- **Approach:** build on the existing `PlotState.orientation` + a **shared
  placement helper**, NOT the legacy `flipCoords` (old ChartBrewer path) and NOT a
  hand-written `buildHorizontal<Geom>` per geom (Bar's current pattern — too much
  duplication for ~10 geoms).
- **Scope:** all geoms where horizontal is meaningful — Bar (done), Point, Line,
  Area, Box, Violin, Jitter, Waterfall, Candlestick, Ribbon, Hexbin, Heatmap
  (transpose). **Arc/pie is radial → orientation N/A** (no-op).

## Current state

- `PlotState.orientation` exists: inferred from data (`x=band,y=continuous`→vertical;
  `y=band,x=continuous`→horizontal) with an `orientation` override.
- Scales already respond to it (`includeZero`, band-axis selection); `buildUnifiedYScale`
  already produces a band scale for a categorical y.
- **Only `Bar`** renders horizontal, via a separate `buildHorizontalBars` that swaps
  the roles: value scale → width, band scale → height, `x:0,width:valueScale(v)`.
- All other geoms hardcode `x→xScale (horizontal screen)`, `y→yScale (vertical screen)`.

## Semantics (user-confirmed): x stays x, y stays y — only the direction flips

`orientation` changes **the chart's direction, not the channels.** The caller keeps
`x`/`y` as authored; `orientation='horizontal'` rotates the layout so the value axis
points right and the category axis points down.

- The **category axis** = the band (categorical) channel; the **value axis** = the
  continuous channel. `orientation` swaps which *screen* direction each points.
- **Both channels continuous** (plain scatter, and AnimatedPlot's value×`_rank` race)
  → orientation is a **no-op** for scale ranges. This is deliberate: there is no
  categorical axis to stand up, and it keeps `AnimatedPlot` (which sets
  `orientation:'horizontal'` with two continuous channels + `buildHorizontalBars`)
  **byte-identical**. Existing horizontal bars keep working unchanged.
- `includeZero` follows the **value channel** (bar/area baseline), not a hardcoded axis.

## The model: (band, value) space → screen via `place()`

The key simplification: **flipping swaps which screen axis each data channel maps to;
it does NOT change a geom's logic** (group by the categorical channel, extend by the
value channel). Channels are fixed; each geom expresses marks in abstract axis
coordinates and a single helper maps them to screen based on orientation.

Define per-datum coordinates:
- `u` = position along the **x-channel** axis = `xScale(d[x])`
- `v` = position along the **y-channel** axis = `yScale(d[y])`

`PlotState` builds the two scales with **orientation-aware ranges**:

| | x-channel scale (`xScale`) range | y-channel scale (`yScale`) range |
| --- | --- | --- |
| vertical (today) | `[0, innerWidth]` (→ screen X) | `[innerHeight, 0]` (→ screen Y) |
| horizontal | `[0, innerHeight]` (→ screen Y) | `[0, innerWidth]` (→ screen X) |

Helper on `PlotState`:

```js
// Map abstract axis coords to screen. In vertical, x-channel is horizontal;
// in horizontal, the two screen axes swap.
place(u, v) {
  return this.orientation === 'horizontal' ? { x: v, y: u } : { x: u, y: v }
}
// Screen coord of value=0 on the value axis (bar/area baseline).
valueBaseline()   // = yScale(0) mapped through place
get thickness()   // band scale bandwidth() (bar/box/violin width along the band axis)
get isHorizontal()
```

A geom that today does `cx = xScale(d[x]); cy = yScale(d[y])` becomes
`const { x: cx, y: cy } = place(xScale(d[x]), yScale(d[y]))`. Symmetric geoms
(Point, Jitter, Hexbin) are then flip-correct with no other change. Asymmetric geoms
(Bar, Area, Box, Violin, Waterfall, Candlestick, Ribbon) additionally express their
extent along the **value axis** (from `valueBaseline()`) and thickness along the
**band axis** (`thickness`), then `place()` — replacing the hardcoded
`height = innerHeight - y` / `x:0,width:…` logic.

### Why this is DRY

`place()` + orientation-aware ranges live in `PlotState` once. Each mark builder gains
an orientation branch only where it computes *extent/thickness* (asymmetric geoms); the
positioning swap is centralized. New geoms get flip for free by using `place()`.

## API surface

- Composable: `<Plot.Root orientation="horizontal">` (new prop; default `undefined` →
  inferred). Also accept `flip={true}` as sugar for `orientation='horizontal'`.
- High-level charts already thread `spec.orientation` / `options.orientation`; expose an
  `orientation` prop on `BarChart`/`LineChart`/`AreaChart`/`ScatterPlot`/`BoxPlot`/`ViolinPlot`.
- Per-geom `options.orientation` override stays (already used by AnimatedPlot bar race).

## Per-geom work

| Geom | Kind | Work |
| --- | --- | --- |
| Point, Jitter, Hexbin | symmetric | use `place()`; ~trivial |
| Line | symmetric-ish | `place()` each vertex; area-baseline for Area |
| Bar | asymmetric | migrate `buildHorizontalBars` onto the helper (keep behavior) |
| Area | asymmetric | baseline via `valueBaseline()`; band/value extent |
| Box, Violin | asymmetric | group along band axis, stats along value axis via `place()` |
| Waterfall, Candlestick, Ribbon | asymmetric | value extent + thickness via helper |
| Heatmap | 2×categorical | transpose (swap row/col mapping) |
| Arc/pie | radial | **N/A** — no-op |

## Testing

- `PlotState` unit: orientation-aware scale ranges (horizontal → xScale over height,
  yScale over width); `place()` swaps correctly; `valueBaseline()`.
- Each mark-builder: a vertical vs horizontal case asserting the screen mapping swaps
  (e.g. a bar's `width`↔`height`, a box's whisker axis).
- Component/live: a horizontal variant of each geom in the learn demo; verify in-browser
  (correct axis, no clipping, axes labelled on the right sides).
- Regression: all existing vertical charts unchanged (full suite green) — the default
  path must be byte-identical when `orientation` is vertical/inferred.

## Phasing (proposed)

1. **Foundation:** `PlotState` orientation-aware scale ranges + `place()`/`valueBaseline()`/
   `thickness` + `orientation`/`flip` prop on `Plot.Root`. Migrate **Point** (symmetric)
   and **Bar** (asymmetric reference) onto it. Live-verify a horizontal scatter + bar.
2. **Distribution + area:** Box, Violin, Jitter, Area, Line.
3. **Rest:** Waterfall, Candlestick, Ribbon, Hexbin, Heatmap. Axis component labels sides.

## Out of scope

- Arc/pie orientation (radial).
- Diagonal/arbitrary rotation.
- Changing the default (charts stay vertical unless `orientation='horizontal'`).

## Risk

The foundation edits `PlotState` scale construction, which every chart depends on — the
vertical path must remain byte-identical. Mitigation: orientation-aware ranges gate on
`orientation === 'horizontal'`; full suite (5346 tests) is the regression net; each geom
live-verified both orientations.
