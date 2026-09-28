# CHECKPOINT

**Slice #159** — extract dbd's ER-diagram viewer into **`@rokkit/graph`**. **Tasks 1–3 of 22
done**, tree clean, **not pushed** (20 ahead of origin/develop). **Plan:**
`docs/plans/2026-09-27-graph-package-extraction.md`, boxes ticked through Task 3.
**Done:** `b20044a1` scaffold · `f369404c` palette→core · `d0d9aa6a` types + `readPath`.

## Remains

1. **Next: Task 4 — `normalizeGraph`**, the single mapping seam. No decision needed; spec is in
   the plan. Port `toLayoutData`'s per-column `fk` derivation into it, so dbd#24 delivering
   `fk`/`uq` natively becomes a change to that one file.
2. Tasks 5–21 preset → 2 layouts → `GraphState` → `Graph` → schema views → theme → demo → e2e → docs.
3. **Task 22 — dbd consumes the package** (separate repo + PR). **The acceptance proof.** Linked
   workspace; publish only after it passes. Then slice 2 (force-directed), slice 3 (dbd#24).

## Decisions locked — do not relitigate

New package, **not** `@rokkit/chart`. Entry points `.` + `./schema`. **Mapped input, canonical
internals** via `GraphState` — a component may not compute. Viewer core only; app-shell and
`SchemaModel` stay in dbd. `data-node-kind` in CSS for the closed set, `createGraphPreset`
(`using: color|pattern`) for open-ended groups. `@rokkit/ui` is an **optional peer**. `base` +
`rokkit` themes only. No pan/zoom. `EntityDiagram`'s geometry becomes a `neighborhood`
`LayoutFn`, so slice 1 ships **two** layouts.

## Invariants the executor must not violate

1. **Never de-duplicate `buildAdjacency`** — duplicates are the barycenter weighting; a `Set`
   silently relayouts every multi-FK schema and the characterization suite cannot see it.
2. **A failing ported assertion means the port changed behaviour.** Fix the port, never rebaseline.
3. **A contrast failure on a graph selector is real** — fix the token, never accept-list it.
   Sweep a **non-default** skin (default maps primary _and_ accent to `shu`).
4. `base/*.css` = structure only. `update()` follows `SparkState`. Lint + journal + checkpoint
   after **every** commit.
5. **Plan file lists and code are drafts** — Task 2 had 4 refs, not 2; Task 3's `readPath` walked
   the prototype chain. Grep first; test plan code.

**Known-broken:** nothing, all gates green. `svelte-check` warns "no svelte input files" for
`packages/graph` until Task 13 — expected. Open: TS 7 (svelte-check > TS 6).
