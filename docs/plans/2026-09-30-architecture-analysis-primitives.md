# Architecture-analysis primitives

**Status:** IMPLEMENT (agreed 2026-09-30)
**Packages:** `@rokkit/chart`, `@rokkit/graph`, `apps/learn`

## Goal

Make repository-architecture charts composable from generic primitives — Robert Martin's
main-sequence diagram first, then hotspots, complexity × coverage, fan-in × fan-out and
code-smell regions, plus a dependency structure matrix and a co-change overlay on the graph.

The charts themselves are **recipes** (demos + guide), not library components: the chart
package keeps no architecture vocabulary. Metrics (Ca/Ce, abstractness, churn, complexity,
coverage) arrive as ordinary row fields from whatever indexer the consumer runs.

## Why these primitives

Four of the charts are the same shape — points on a metric plane, with rule-defined regions.
`Rule` only draws axis-aligned lines; nothing fills a data-coordinate polygon, outlines a
group, or contours density. Those four gaps are what every one of those charts needs.

## Slices (one commit each, test first)

| # | Package | Primitive | Notes |
|---|---------|-----------|-------|
| 1 | chart | `Rule` `slope` + `intercept` | ggplot's `abline`; clipped to the visible domain so a line never leaves the plot. The main sequence is `slope={-1} intercept={1}`. |
| 2 | chart | `Plot.Region` | Data-coordinate fill: a band (`x`/`y` as `[lo, hi]`, either omitted = full span) or a polygon (`points`). Label, fill, alpha. Draws BEHIND marks. |
| 3 | chart | `Plot.Hull` | Convex hull per group (the `color` channel, which joins the shared palette); `padding` via a round-joined stroke so 1- and 2-point groups still render. Pure `convexHull` in `lib/`. |
| 4 | chart | `Plot.Contour` | Density contours (`d3-contour`), pairs with `Hexbin` for pile-ups. |
| 5 | graph | overlay edges | An edge flagged `overlay` is drawn but never shapes the layout — co-change and rule-violation edges would otherwise re-rank the picture. `data-edge-overlay`. |
| 6 | graph | `DependencyMatrix` | DSM: nodes in dependency order, a cell per edge, cells above the diagonal are cycles/back-references, group blocks outlined. Pure builder + diagram. |
| 7 | learn | demos + guides | Chart explorer gains an **Architecture** group (main sequence, hotspots, complexity × coverage, fan-in/out, smells) and entries for each primitive; graph demo gains matrix + overlay. Charts/graphs guides gain an architecture-analysis section. |
| 8 | docs | sync | `docs/llms/*` + site copies, `charts-rokkit` SKILL.md (both copies), design docs 20/23, features/07, inventory, priority, journal, checkpoint. |

## Gates per slice

`bun run test:ci`, `bun run lint` (0/0), `bun run check:svelte`, chart/graph coverage, and
e2e for slice 7.
