# CHECKPOINT

**Slice: architecture-analysis primitives — DONE** (`7cb774e7..0c60e7be`, 24 commits on
`develop`, not pushed). Follow-ups `5a811b5d` hover drift, `1e04dda0` generators missed 30% of
imports (figures corrected), `0c60e7be` treemap label. Plan: `docs/plans/2026-09-30-architecture-analysis-primitives.md`.

**Done — every increment of the agreed plan:**

1. `@rokkit/chart` `Rule` `slope`/`intercept` — clipped abline, midpoint label along the line.
2. `Plot.Region` — bands (`null` open ends) and polygons in data coordinates, clipped.
3. `Plot.Hull` — padded convex hull per `fill`/`color` group.
4. `Plot.Contour` — d3-contour density rings / filled bands, clipped. (+ `PlotChart`
   `xDomain`/`yDomain`, spec path renders all four via `GeomSpec.props`.)
5. `@rokkit/graph` overlay edges (`model.overlays`, `--edge-weight`) themed in all five styles.
6. `DependencyMatrix` + `buildMatrix`, themed in all five styles.
7. learn: `build-architecture-metrics.mjs` (real rokkit metrics), chart explorer Region/Hull/
   Contour demos + Architecture group (main sequence, hotspots, complexity × coverage, fan-in ×
   fan-out, god modules), graph demo dependency matrix + hidden coupling, `architecture.e2e.ts`.
8. Docs: guides (site + llms), llms package/component refs, charts-rokkit SKILL.md, chart
   reviewer agent, READMEs, design 20/23, features/07, inventory, priority, journal, memory.

**Gates (2026-09-30):** `bun run coverage` 7577 tests / 469 files, all thresholds met; lint 0/0;
check:svelte 0/0 (7 projects); check:types clean; e2e 129/129 on a fresh build.

**Next command:** `git push origin develop` — once the user has reviewed the slice.

**Open questions:**

- Hidden-coupling view: at fit zoom the dotted overlays are close to the dashed dependency
  edges; zooming separates them. A stronger overlay treatment (colour) would need a contrast
  check against the interaction gate.
- Import regex counts `import type` as a dependency (Martin would); runtime-only coupling differs.
- Metrics are regex-derived (demo-grade, stated in the script). Real use wants an AST/indexer
  source — sensei's code graph is the obvious feed.
- Martin's A for TS counts exported types/interfaces/abstract classes/@typedef over exports.

**Known broken:** nothing. `sensei:checkpoint` not run — the daemon is not running this session.
