# CHECKPOINT

**Slice #159** — extract dbd's ER-diagram viewer into **`@rokkit/graph`**. **Tasks 1–18 of 22
done**, tree clean, **not pushed** (59 ahead of origin/develop). **Plan:**
`docs/plans/2026-09-27-graph-package-extraction.md`, boxes ticked through Task 18.
**Code and theme are done.** Model, preset, both layouts, `GraphState`, `Graph`, both schema
views, `themes/{base,rokkit}/graph.css` (`2fc3cbe2`) — plus an a11y fix in `@rokkit/ui`'s Table
(`3c79c7df`: its roving tabindex had no resting stop, so no keyboard user could enter one).
**333 graph tests, 100% stmts+funcs**; full repo **6829** green. No component computes anything.

## Remains — surfacing and proof, not core logic

1. **Next: Task 19 — the learn demo**, the visual verification surface. Three layers visible at
   once: `datasets.ts` (load) · `store.svelte.ts` + `GraphState` (state) · `GraphExplorer` /
   `GraphControls` (component). Every control in the design's table must exist.
2. Task 20 e2e + contrast gates → Task 21 docs/llms/README + close-out.
3. **Task 22 — dbd consumes the package** (separate repo + PR). **The acceptance proof.** Linked
   workspace; publish only after it passes. Then slice 2 (force-directed), slice 3 (dbd#24).

## Decisions locked — do not relitigate

New package, **not** `@rokkit/chart`. Entry points `.` + `./schema`. **Mapped input, canonical
internals** via `GraphState` — a component may not compute. Viewer core only; app-shell and
`SchemaModel` stay in dbd. `data-node-kind` in CSS for the closed set, `createGraphPreset`
(`using: color|pattern`) for open groups. `@rokkit/ui` an **optional peer**. `base` + `rokkit`
themes only. No pan/zoom. `EntityDiagram`'s geometry becomes a `neighborhood` `LayoutFn`.

## Invariants the executor must not violate

1. **Never de-duplicate `buildAdjacency`** — duplicates are the barycenter weighting; a `Set`
   silently relayouts every multi-FK schema and the characterization suite cannot see it.
2. **A failing ported assertion means the port changed behaviour.** Fix the port, never rebaseline.
3. **A contrast failure on a graph selector is real** — fix the token, never accept-list it.
   Sweep a **non-default** skin (default maps primary _and_ accent to `shu`).
4. `base/*.css` = structure only. `update()` follows `SparkState`. Lint + journal + checkpoint
   after **every** commit; run `bun run coverage --project graph` too (100% stmts, `all: true`).
5. **Plan file lists and code are drafts** — every task so far has had a defect: missed refs, a
   prototype-chain bug, stale literals, 7 lint warnings, uncovered paths. Grep and test it.

**Known-broken:** nothing; lint, types, coverage and svelte-check all clean. Open: TS 7.
