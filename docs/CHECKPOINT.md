# CHECKPOINT

**Last slice: the open items. DONE and pushed.** `develop` is at `56d90af1`, and CI is green
(check, browser, coverage).

- `00f64615`: the browser specs run in CI.
- `1b629aa6`: forms no longer ships its specs or fixtures; a workspace guard enforces it.
- `066d5b3a` and `56d90af1`: JSON Schema object-level `required` is honoured, and the docs say so.

The Navigator decomposition (`9449887f`..`fb46dafb`) landed before these; see journal 2026-09-30 (7).

**Next slice: `chart/src/Plot.svelte`.** It is the top hotspot now (cx 72, churn 38).
Same method as before:

1. characterise it;
2. write the plan doc;
3. extract pure parts behind the unchanged component API;
4. run a differential and re-measure.

**Next command:** read `packages/chart/src/Plot.svelte` and its specs, then write
`docs/plans/2026-09-30-plot-svelte-decomposition.md`.

**Open questions:**

- The next hotspots after Plot.svelte: `unocss/preset.ts` (74/34) and `core/utils.js` (47/52).

**Known broken:** nothing. The sensei MCP server is disconnected, so this file is the only record.
