# CHECKPOINT

**Slice #159** — extract dbd's ER-diagram viewer into **`@rokkit/graph`**. **Tasks 1–21 of 22
done + slice 3 folded in**, tree clean, **not pushed** (78 ahead of origin/develop). Plan
`docs/plans/2026-09-27-graph-package-extraction.md`, ticked through Task 20. Package + learn
demo (`2765ab8b`) + `graph.css` for **all six** styles (`f47bd305`); `@rokkit/ui` Table a11y
(`3c79c7df`). **6990 unit + 105 e2e green; lint/types/svelte-check 0/0; graph coverage 100%;
nothing known-broken.** Open: TS 7.

**Six commits, one theme: the view no longer asserts more structure than the data has.**
`421b49a1` keeps unplaced edges (59.6% of Sensei's 4.08M have a null target) and makes a
keyless card read `no keys · 3 rows`. `43c4e435` — **kind icons never worked**: `i-graph-*` was
in no config, collection or stylesheet, so every kind was a blank box. `1e761044` — **a schema
is two graphs**, as dbd v2 says itself → `toGraphInput(model, 'er'|'dependencies')`.
`d86de9ca` — `points` declared a canvas **36% full**, which presented as a zoom bug; rounded
rects fixed it. `91799084` — **two-level clustering** (`groupBy` × `nestBy`). `9fdb549e` —
docs. **Slice 3 is done, folded into slice 1.**

## Remains

1. **Next: Task 22 — dbd consumes the package** (linked workspace, then a PR against
   `sensei-hq/dbd`). **The acceptance proof — nothing publishes before it passes.** dbd is on
   v2 and the package now speaks it. Then slice 2 (world view). Slice 3 is closed.
2. **Open note:** a shared table is a fan-in hub in the dependency view; `neighborhood` +
   selection dimming answer it but are not discoverable there.

**Design decisions are locked in `docs/design/23-graph.md` — read it before relitigating one.**

## Invariants the executor must not violate

1. **Never de-duplicate `buildAdjacency`** — duplicates are the barycenter weighting; a `Set`
   relayouts every multi-FK schema and the suite cannot see it.
2. **A failing ported assertion means the port changed behaviour.** Fix the port, never rebaseline.
3. **A contrast failure on a graph selector is real** — fix the token, never accept-list it; a
   brand colour is a fill or border, never a foreground. `base/*.css` = structure only.
4. Lint, journal, checkpoint and `coverage --project graph` after **every** commit.
5. **Plan lists and code are drafts** — every task has had a defect. A binding named `state`
   breaks the `$state` rune, and theme CSS is dead until `packages/themes` rebuilds.
6. **A green unit suite proves the assertions hold, not that anyone looked.** Blank icons, a
   64%-empty canvas and a render aborted by `each_key_duplicate` all passed 6900+ tests.
