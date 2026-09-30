# CHECKPOINT

**Last slice: remaining hotspots + type suppressions. DONE.** Journal 2026-09-30 (11).

- `a43e855c`: `core/utils.js` is a barrel over single-job modules.
- `50e38677`, `b7304e22`: Select and MultiSelect share `utils/dropdown.ts`. MultiSelect's focus no longer scrolls the page.
- `deb10469`, `bb2e239a`, `df565680`: GraphState is `GraphConfig` + `GraphSelection` + pure helpers (complexity 88 → 40).
- `50e7d434`: a filterable Bar filters on click without also selecting.
- `d355a586`: no `@ts-nocheck` remains in any package, and a workspace guard bans it.

**Next slice: the open issues from #165**, as the user asked.

- #165 [graph] P0: drill-down/up events so the host can supply each level's data
- #166 [graph] P1: a collapsed group node (SCC condensation) that expands to its members
- #167 [graph] P2: a layered DAG layout, with edges that climb marked as violations
- #168 [graph] P3: a polymetric tree (Lanza's System Complexity)
- #169 [chart] P4: a dual arc diagram (co-change vs imports on one axis)

**Next command:** `gh issue view 165`, then plan it against `docs/design/23-graph.md` (drill state is listed there as future work).

**Open questions:** MultiSelect lacks Select's fixed positioning and `maxRows`, so it clips inside `overflow` containers. Noted, not fixed.

**Known broken:** nothing. The sensei MCP server is disconnected, so this file is the only record.
