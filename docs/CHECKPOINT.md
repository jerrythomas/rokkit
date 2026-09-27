# CHECKPOINT

**Slice:** #159 — extract dbd's ER-diagram viewer into a new **`@rokkit/graph`**.
Design (`0b023faa`) + slice-1 plan (`183f330e`) committed. **No code yet.** 3 commits ahead of
origin/develop, not pushed.

**Plan:** `docs/plans/2026-09-27-graph-package-extraction.md` — 21 tasks, 132 TDD steps, and every
fact already verified. This file is only orientation.

## Remains

1. **Task 1** — scaffold `packages/graph`, register the vitest project + coverage thresholds, add
   it to the **hardcoded** `check:svelte` list in root `package.json`
2. Tasks 2–20 — palette move → normalizer → 2 layouts → `Graph` → schema views → theme → demo
3. **Task 21** — dbd consumes the package (separate repo + PR). **The acceptance proof; slice 1
   is not done without it.** Needs `@rokkit/graph` published or a workspace link.
4. Slice 2: force-directed (sensei's call graph) · Slice 3: dbd#24 v2 model

## Decisions locked — do not relitigate

New package, **not** `@rokkit/chart`. Entry points `.` + `./schema`. **Mapped input, canonical
internals.** Viewer core only; app-shell and `SchemaModel` stay in dbd. `data-node-kind` in CSS
for the closed set, `createGraphPreset` (`using: color|pattern|symbol`) for open-ended groups.
`base` + `rokkit` themes only. Learn examples ship **in** slice 1. And, already in both docs:
`EntityDiagram.svelte`'s own constants/`buildCard`/`anchorY`/`path` (~100 lines duplicating
`layout-cards`/`layout-edges`) become a `neighborhood` `LayoutFn`, so slice 1 ships **two**
layouts at _less_ code and the seam is validated by two real implementations.

## Invariants the executor must not violate

1. **A failing ported assertion means the port changed behaviour** — fix the port, never
   rebaseline a characterization test. Both suites (344 lines, incl. 7 exact SVG path strings)
   carry every number across; only fixtures change shape.
2. **A contrast failure on a graph selector is a real finding** — fix the token, never
   accept-list it. Sweep a **non-default** skin (default maps primary _and_ accent to `shu`).
3. `base/*.css` is structure only, **no colour** — a spec asserts it.

**Known-broken:** nothing; `check:types` clean; no blocking questions. Other open item:
TypeScript 7 (needs svelte-check > TS 6).
