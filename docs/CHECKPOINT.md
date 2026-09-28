# CHECKPOINT

**Slice #159** — extract dbd's ER-diagram viewer into **`@rokkit/graph`**. **Tasks 1–20 of 22
done + slice 3 folded in**, tree clean, **not pushed** (72 ahead of origin/develop). Plan
`docs/plans/2026-09-27-graph-package-extraction.md`, ticked through Task 20. Package + learn
demo (`2765ab8b`) + `graph.css` for **all six** styles (`f47bd305`); `@rokkit/ui` Table a11y
(`3c79c7df`). **6948 unit + 103 e2e green; lint/types/svelte-check 0/0; graph coverage 100%;
nothing known-broken.** Open: TS 7.

**Three commits, one theme: the view no longer asserts more structure than the data has.**
`421b49a1` keeps unplaced edges (59.6% of Sensei's 4.08M have a null target) and makes a
keyless card read `no keys · 3 rows`. `43c4e435` — **kind icons never worked**: `i-graph-*` was
in no config, collection or stylesheet, so every kind rendered a blank box; `src/icons.ts` now
names real `i-glyph:*` and a spec checks each against the shipped collection. `1e761044` — **a
schema is two graphs**, as dbd v2 says itself, so `toGraphInput(model, 'er'|'dependencies')`
picks one: ER is 8 tables + 2 enums with **zero orphans**, and views/routines/triggers moved to
a new dependency example carrying dbd's four verbs. **Slice 3 is done, folded into slice 1.**

## Remains

1. **Next: Task 21 — docs + close-out.** `design/23-graph.md`, `12-priority.md`,
   `agents/memory.md`, backlog, plus the surfaces claiming completeness today:
   **`llms/index.txt`**, **`README.md`**, new `llms/{components,packages}/graph.txt`.
2. **Task 22 — dbd consumes the package** (separate repo + PR). **The acceptance proof.** Linked
   workspace; publish only after it passes. Then slice 2 (world view). Slice 3 is closed.

**Every design decision is locked in `docs/design/23-graph.md` — read it before relitigating
one** (own package, mapped input + canonical internals, `@rokkit/ui` an optional peer).

## Invariants the executor must not violate

1. **Never de-duplicate `buildAdjacency`** — duplicates are the barycenter weighting; a `Set`
   relayouts every multi-FK schema and the suite cannot see it.
2. **A failing ported assertion means the port changed behaviour.** Fix the port, never rebaseline.
3. **A contrast failure on a graph selector is real** — fix the token, never accept-list it; a
   brand colour is a fill or border, never a foreground.
4. `base/*.css` = structure only. Lint, journal, checkpoint and `coverage --project graph`
   (100% stmts, `all: true`) after **every** commit.
5. **Plan lists and code are drafts** — every task has had a defect. A binding named `state`
   breaks the `$state` rune, and a theme CSS edit is dead until `packages/themes` rebuilds.
