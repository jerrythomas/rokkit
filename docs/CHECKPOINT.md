# CHECKPOINT

**Last slice: Plot.svelte decomposition. DONE.** Plan: `docs/plans/2026-09-30-plot-svelte-decomposition.md`.

- `2d246d0f`: `lib/plot/spec.js`, the spec-over-prop precedence as a table.
- `7227692d`: `Plot/SpecGeoms` and `Plot/DataTable`. `Plot.svelte` went from 357 to 226 lines and complexity 72 to 27.
- `5c5285ce`: an arc with repeated or absent categories no longer aborts the render.
- `b19f5441`: radar keeps numeric categories and skips null ones.
- `fa4ab83e`: the docs and skill taught a `channels` geom shape that draws nothing; corrected.

Earlier today: the Navigator (journal (7)) and the open items (journal (8)).

**Remaining:** push `develop` and confirm CI is green.

**Next command:** `git push origin develop`, then watch the Check (check + browser) and Coverage runs.

**Open questions:**

- The next hotspots are `unocss/preset.ts` (cx 74, churn 34), `core/utils.js` (47/52),
  `ui/Select.svelte` (100/19) and `graph/GraphState.svelte.ts` (88/17).
- The geom fuzz harness (`/tmp/geom-fuzz.spec.js`) found two crashes. Should it become a
  permanent spec?

**Known broken:** nothing. The sensei MCP server is disconnected, so this file is the only record.
