# Chart geom gaps — backlog

**Date:** 2026-08-16
**Context:** Audit prompted by "are there any missing geoms? do we support pattern fills?" — the
raincloud `side`, pattern fills on Box/Violin, the `Rule` geom, and the `Plot.*` namespace
completions were done then (see journal 2026-08-16). This tracks what's still missing.

## Missing geoms (grammar-of-graphics gaps)

Existing: Bar, Line (linear/smooth/step), Area, Point, Arc/pie, Box, Violin, Jitter, Heatmap,
Candlestick, Waterfall, Hexbin, Ribbon, Trend, Highlight, **Rule** (new).

Not yet supported:

- **Error bar / interval** — `errorbar` / `linerange` / `pointrange` (± error, confidence
  intervals). Box has whiskers but there's no standalone interval geom. Highest value — pairs with
  aggregate stats (mean ± sd/ci).
- **Text / data-label geom** — a general point-label geom (`geom_text`/`geom_label`). Labels are
  currently baked into Bar; `LabelPill` is a helper. Would let any geom carry value labels.
- **Rug** — marginal ticks along an axis (`geom_rug`).
- **Segment / arrow** — arbitrary line segments between (x1,y1)→(x2,y2) (`geom_segment`), optional
  arrowhead. Useful for connections/annotations.
- **Density (1-D)** — a standalone density curve. Violin computes a density internally but doesn't
  expose it as a line geom.
- **Contour / 2-D density** — `geom_contour` / `geom_density_2d`. Larger effort (marching squares).

## Rule geom follow-ups

- **Domain auto-extend** — a reference value outside the data range currently clips at the axis
  edge. Optionally contribute the reference value(s) to the scale domain so an above-data target
  line is visible.
- **Data-driven rules** — accept `data` + a field (e.g. one rule per category mean) in addition to
  literal values.

## Sort follow-ups

- **Static `sort` shipped** (2026-08-17): `sort='asc'|'desc'` on `Plot.Root`/spec orders the band
  axis by aggregated value (bars by size). See journal 2026-08-17.
- **Smooth vertical animated race** — the horizontal bar race reorders smoothly via the
  continuous-category rank mechanism; the vertical (band) animation only snaps between positions.
  A smooth vertical race needs `continuousCategory` positioning applied on the vertical axis (like
  the horizontal race, un-flipped). Threading `sort` into `AnimatedPlot`'s frameSpec would give a
  snapping vertical reorder in the meantime.

## Notes

- Pattern fills now work on Bar/Area/Arc/Box/Violin. Still solid-only: Waterfall, Heatmap, Ribbon,
  Candlestick, Point — wire the pattern channel there if texture fills are wanted.
