# CHECKPOINT

**Slice:** #159 — extract dbd's ER-diagram viewer into a new **`@rokkit/graph`**.
**Tasks 1–3 of 22 done**, tree clean, **not pushed** (20 commits ahead of origin/develop).
**Plan:** `docs/plans/2026-09-27-graph-package-extraction.md`. This file is orientation.

## Done

- **Task 1** `b20044a1` — `packages/graph` scaffold, vitest project + coverage, `check:svelte`
- **Task 2** `f369404c` — categorical palette → `core/src/colors/categorical.json` + `brewer.ts`
- **Task 3** `d0d9aa6a` — `src/types.ts` + `src/model/path.ts` (`readPath`, own-props only)

## Remains

1. **Next: Task 4** — `normalizeGraph`, the single mapping seam (plan `## Task 4`). No decision
   needed. Its spec is already written out in the plan; port `toLayoutData`'s per-column `fk`
   derivation into it so dbd#24 becomes a one-file change.
2. Tasks 5–20 — preset → 2 layouts → `GraphState` → `Graph` → schema views → theme → demo → e2e
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
5. The plan's file lists and code blocks are **not exhaustive or infallible** — Task 2 had 4 refs
   beyond the 2 listed; Task 3's given `readPath` body walked the prototype chain. Grep before
   trusting a file list; treat plan code as a draft to test, not to transcribe.

**Known-broken:** nothing; all gates green. `svelte-check` warns "no svelte input files" for
`packages/graph` until Task 13 adds `Graph.svelte` — expected, not a failure.
Other open item: TypeScript 7 (svelte-check > TS 6).
