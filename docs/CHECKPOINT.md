# CHECKPOINT

**Slice #159** — extract dbd's ER-diagram viewer into **`@rokkit/graph`**. **Tasks 1–4 of 22
done**, tree clean, **not pushed** (23 ahead of origin/develop). **Plan:**
`docs/plans/2026-09-27-graph-package-extraction.md`, boxes ticked through Task 4.
**Done:** `b20044a1` scaffold · `f369404c` palette→core · `d0d9aa6a` types + `readPath` ·
`a36c7b36` `normalizeGraph` (40 tests, 100% stmts/branches/funcs).

## Remains

1. **Next: Task 5 — `createGraphPreset`** (`src/preset.ts`): colour for the OPEN vocabulary
   (group names), off `@rokkit/core`'s `categoricalPalette`. The closed vocabulary
   (`data-node-kind`) stays in CSS. No decision needed; spec is in the plan.
2. Tasks 6–21 layouts → `GraphState` → `Graph` → schema views → theme → demo → e2e → docs.
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
5. **Plan file lists and code are drafts** — Task 2 missed 4 refs; Task 3's `readPath` walked the
   prototype chain; Task 4's code tripped 3 lint warnings and missed 6 covered paths. Test it.

**Known-broken:** nothing, all gates green. `svelte-check` warns "no svelte input files" for
`packages/graph` until Task 13 — expected. Open: TS 7 (svelte-check > TS 6).
