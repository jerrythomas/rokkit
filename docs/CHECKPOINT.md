# CHECKPOINT

**Slice #159** — extract dbd's ER-diagram viewer into **`@rokkit/graph`**. **Tasks 1–12 of 22
done**, tree clean, **not pushed** (39 ahead of origin/develop). **Plan:**
`docs/plans/2026-09-27-graph-package-extraction.md`, boxes ticked through Task 12.
**Done: the entire non-visual package** — model, preset, both layouts behind one interface, and
`GraphState` (`e0e3b0bd`) holding every derivation. Both dbd characterization suites green with
every original number. **212 tests, 100% stmts/funcs, and not one renders anything.**

## Remains

1. **Next: Task 13 — `Graph.svelte`**, the first component. **Presentation only: it computes
   nothing** — no `cardState()`/`edgeClass()` helpers; if a template needs a value, `GraphState`
   exposes it. Only `scale`/`tx`/`ty` stay local (they need `clientWidth`).
2. Tasks 14–21 notes → schema views → theme → demo → e2e → docs.
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

**Known-broken:** nothing, all gates green. `svelte-check` warns "no svelte input files" for
`packages/graph` until Task 13 — expected. Open: TS 7 (svelte-check > TS 6).
