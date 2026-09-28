# CHECKPOINT

**Slice #159** — extract dbd's ER-diagram viewer into **`@rokkit/graph`**. **Tasks 1–16 of 22
done**, tree clean, **not pushed** (51 ahead of origin/develop). **Plan:**
`docs/plans/2026-09-27-graph-package-extraction.md`, boxes ticked through Task 16.
**Done:** model, preset, both layouts, `GraphState`, `Graph.svelte`, notes, `fromSchemaModel`,
`EntitiesView` (`c8e42357`) — plus a real a11y fix in `@rokkit/ui`'s Table (`3c79c7df`: its
roving tabindex had no resting stop, so no keyboard user could enter any Table).
296 graph tests, 100% stmts, svelte-check 0/0; full repo 6770 tests green.

## Remains

1. **Next: Task 17 — `EntityView`**, presentation only, reading `state.entity` and
   `state.relationships`. Same three-way state resolution as `Graph`/`EntitiesView`
   (prop → context → self-construct).
2. Tasks 18–21 theme CSS → learn demo → e2e + contrast gates → docs and close-out.
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
