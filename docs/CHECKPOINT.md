# CHECKPOINT

**Slice:** #159 — extract dbd's ER-diagram viewer into a new **`@rokkit/graph`**.
**Tasks 1–2 of 22 done**, tree clean, **not pushed** (18 commits ahead of origin/develop).
**Plan:** `docs/plans/2026-09-27-graph-package-extraction.md`. This file is orientation.

## Done

- **Task 1** `b20044a1` — `packages/graph` scaffold, vitest project + coverage, `check:svelte`
- **Task 2** `f369404c` — categorical palette → `core/src/colors/categorical.json` + `brewer.ts`

## Remains

1. **Next: Task 3** — canonical types + dotted-path reader (`src/types.ts`, `src/model/path.ts`).
   Plan line 666. Needs no decision.
2. Tasks 4–20 — normalizer → 2 layouts → `GraphState` → `Graph` → schema views → theme → demo → e2e
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
5. The plan's file lists are **not exhaustive** — Task 2 had 4 refs, not 2. Always grep first.

**Known-broken:** nothing; all gates green. Other open item: TypeScript 7 (svelte-check > TS 6).
