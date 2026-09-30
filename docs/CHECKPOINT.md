# CHECKPOINT

**Slice: Navigator decomposition — DONE.** Plan: `docs/plans/2026-09-30-navigator-decomposition.md`.

- `9449887f`: dom.js
- `79a38106`: Typeahead
- `657db32f`: focus.js
- `fb46dafb`: intent.js; the Navigator is now pure wiring

`navigator.js` went from 418 to 187 lines and complexity 70 to 18. The differential replayed
30,318 scenarios, all identical, and caught all 5 planted bugs.

Also landed: `6ec4971b` fixes `bun run test:browser`, which vitest 4 broke; it now passes 34 tests.

**Pushed:** `develop` is at `982abc5c`, and CI's Check and Coverage runs are green. Nothing remains in this slice.

**Next command:** none queued. Pick the next item from the open questions below.

**Open questions:**

- `@rokkit/forms` ships `*.spec.js` + fixtures in `dist/lib` — packaging hygiene, not yet fixed.
- Object-level JSON Schema `required: [...]` is not honoured — only field-level `required: true`.
- `test:browser` is not in CI, so it can rot again unnoticed. Add it to CI?
- Next hotspots: `Plot.svelte` (cx 72, churn 38), `unocss/preset.ts` (74/34), `core/utils.js` (47/52).

**Known broken:** nothing. The sensei MCP server is disconnected, so this file is the only record.
