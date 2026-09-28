# CHECKPOINT

**Slice #159** — extract dbd's ER-diagram viewer into **`@rokkit/graph`**. **Tasks 1–20 of 22
done**, tree clean, **not pushed** (70 ahead of origin/develop). Plan
`docs/plans/2026-09-27-graph-package-extraction.md`, ticked through Task 20. Package + learn
demo (`2765ab8b`) + `graph.css` for **all six** styles (`f47bd305`); `@rokkit/ui` Table a11y
(`3c79c7df`). **6917 unit + 99 e2e green; lint/types/svelte-check 0/0; graph coverage 100%;
nothing known-broken.** Open: TS 7.

`421b49a1` — **the diagram no longer looks more complete than it is**; both halves surfaced
from Sensei's real `code-graph-schema.json`, not the demo fixture. (a) **Unplaced edges are
kept and marked, never dropped** — 59.6% of its 4.08M edges have a null `target_id` and
`normalizeGraph` discarded every one; `GraphEdge.unplaced` records which end, and
`buildNeighbors`/`buildAdjacency`/`neighborhood.partition` skip them (no card → `barycenter`
crashed). (b) **A keyless card says so** — view/procedure/enum have no pk/fk, so `keys`
collapsed them to a title + `+3 more`; `GraphState.moreLabel` returns `no keys · 3 rows`.

## Remains

1. **Next: Task 21 — docs + close-out.** `design/23-graph.md`, `12-priority.md`,
   `agents/memory.md`, backlog, plus the surfaces claiming completeness today:
   **`llms/index.txt`**, **`README.md`**, new `llms/{components,packages}/graph.txt`.
2. **Task 22 — dbd consumes the package** (separate repo + PR). **The acceptance proof.** Linked
   workspace; publish only after it passes. Then slice 2 (world view), slice 3 (dbd#24).

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
