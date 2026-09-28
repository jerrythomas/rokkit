# CHECKPOINT

**Slice #159** — extract dbd's ER-diagram viewer into **`@rokkit/graph`**. **Tasks 1–20 of 22
done**, tree clean, **not pushed** (68 ahead of origin/develop). **Plan:**
`docs/plans/2026-09-27-graph-package-extraction.md`, boxes ticked through Task 20.
**Ships, renders, gated in every style.** Package + learn demo (`2765ab8b`) + `graph.css` for
**all six** styles (`f47bd305`); 7 contrast findings fixed at the token, none accept-listed; a11y
fixes in `@rokkit/ui` Table (`3c79c7df`) + the demo. **6917 unit + 99 e2e green.**

`421b49a1` — **the diagram no longer looks more complete than it is.** Two variants of one
defect, both found by reading Sensei's real `code-graph-schema.json` rather than the demo
fixture. (a) **Unplaced edges are kept and marked, never dropped**: 59.6% of that schema's
4.08M edges have a null `target_id` — the call is real, the callee just is not indexed — and
`normalizeGraph` was silently discarding all of them. `GraphEdge.unplaced` now records which
end, with the raw value left in place; `buildNeighbors`, `buildAdjacency` and
`neighborhood.partition` skip them (no card → `barycenter` crashed, and `related` would have
named an unclickable node). (b) **A keyless card says so**: a view/procedure/enum has no
pk/fk, so at `keys` it collapsed to a title + `+3 more`, reading as a rendering failure.
`GraphState.moreLabel` now returns `no keys · 3 rows`, italicised via `data-graph-more-empty`.

## Remains

1. **Next: Task 21 — docs + close-out.** `design/23-graph.md`, `12-priority.md`,
   `agents/memory.md`, backlog, plus the surfaces claiming completeness today:
   **`llms/index.txt`**, **`README.md`**, new `llms/{components,packages}/graph.txt`.
2. **Task 22 — dbd consumes the package** (separate repo + PR). **The acceptance proof.** Linked
   workspace; publish only after it passes. Then slice 2 (force-directed), slice 3 (dbd#24).
3. **Closed:** the theme gap — all six styles ship `graph.css`, swept per style by the e2e.

## Decisions locked — do not relitigate

New package, **not** `@rokkit/chart`. Entry points `.` + `./schema`. **Mapped input, canonical
internals** via `GraphState` — a component may not compute. Viewer core only; app-shell and
`SchemaModel` stay in dbd. `data-node-kind` in CSS for the closed set, `createGraphPreset`
(`using: color|pattern`) for open groups — the preset has NO `kinds` map. `@rokkit/ui` an
**optional peer**. `base` + all five styles. No pan/zoom. `EntityDiagram` becomes a
`neighborhood` `LayoutFn`. A CSS kind override must match `[data-style] [data-node-kind=…]`.

## Invariants the executor must not violate

1. **Never de-duplicate `buildAdjacency`** — duplicates are the barycenter weighting; a `Set`
   silently relayouts every multi-FK schema and the suite cannot see it.
2. **A failing ported assertion means the port changed behaviour.** Fix the port, never rebaseline.
3. **A contrast failure on a graph selector is real** — fix the token, never accept-list it.
   **A brand colour is a fill or a border, never a foreground** (the 500 is ~2.4:1 on paper).
4. `base/*.css` = structure only. Lint + journal + checkpoint after **every** commit; run
   `bun run coverage --project graph` too (100% stmts, `all: true`).
5. **Plan file lists and code are drafts** — every task so far has had a defect. Grep and test it.
   A local binding named `state` breaks the `$state` rune (`s.subscribe is not a function`).
6. **A theme CSS edit is not live until `packages/themes` is rebuilt.** Verify the BUILT
   output in the browser, never the component source — this has now bitten twice.

**Known-broken:** nothing; every gate clean. Open: TS 7.
