# CHECKPOINT

**Slice:** #159 — extract dbd's ER-diagram viewer into a new **`@rokkit/graph`**. **No code yet.**
Not pushed. **Plan:** `docs/plans/2026-09-27-graph-package-extraction.md` — 22 tasks, reviewed
adversarially (6 reviewers; 6 CRITICAL / 13 HIGH / 17 MEDIUM all fixed). This file is orientation.

## Remains

1. **Task 1** — scaffold `packages/graph`, register the vitest project + coverage thresholds, add
   it to the **hardcoded** `check:svelte` list in root `package.json`
2. Tasks 2–20 — palette move → normalizer → 2 layouts → `GraphState` → `Graph` → schema views →
   theme → demo → e2e
3. Task 21 — docs, journal, llms index + README, close-out
4. **Task 22** — dbd consumes the package (separate repo + PR). **The acceptance proof.** Linked
   workspace; publish only after it passes.
5. Slice 2: force-directed (sensei's call graph) · Slice 3: dbd#24 v2 model

## Decisions locked — do not relitigate

New package, **not** `@rokkit/chart`. Entry points `.` + `./schema`. **Mapped input, canonical
internals** via `GraphState` — a component may not compute. Viewer core only; app-shell and
`SchemaModel` stay in dbd. `data-node-kind` in CSS for the closed set, `createGraphPreset`
(`using: color|pattern` — symbol cut, no renderer) for open-ended groups. `@rokkit/ui` is an
**optional peer**, not a dependency. `base` + `rokkit` themes only. No pan/zoom in slice 1.
`EntityDiagram`'s geometry becomes a `neighborhood` `LayoutFn`, so slice 1 ships **two** layouts.

## Invariants the executor must not violate

1. **Never de-duplicate `buildAdjacency`.** Duplicates are the barycenter weighting; a `Set`
   silently relayouts every multi-FK schema and the characterization suite cannot see it.
2. **A failing ported assertion means the port changed behaviour** — fix the port, never
   rebaseline a characterization test.
3. **A contrast failure on a graph selector is a real finding** — fix the token, never
   accept-list it. Sweep a **non-default** skin (default maps primary _and_ accent to `shu`).
4. `base/*.css` = structure only, no colour. `update()` follows `SparkState`, not `PlotState`.
   Lint + journal + checkpoint after **every** commit.

**Known-broken:** nothing; `check:types` clean. Other open item: TypeScript 7 (svelte-check > TS 6).
