# CHECKPOINT

**Slice #159/#163** — `@rokkit/graph`. Slice 1 done (Tasks 1–22), package **published**, world
view built and now corrected. Tree clean on `develop`, **not pushed**. **7126 unit green
(775 across graph+learn on the last targeted run), lint/types 0/0, docs+meta gates green.**

**`0d331a06` — a treemap nests ONE box shape.** `world` returned a leaf as a node CARD and a
container as a label box: two structures in one hierarchy, and the card's furniture came with
it — a codebase module has no rows, so every leaf showed a literal `0`. `world` now returns no
cards; a leaf is a `Cluster` carrying `nodeId` + `kind`, so uniform structure costs no
identity. Three latent defects surfaced with it:

- **The zero-measure floor was backwards.** `MIN_SHARE * total` applied PER CHILD sums to
  `n * k * total` — 2px hairline at n=2, 94% of the canvas at n=470. Now measured against the
  equal slice, so the total floor caps at `k` whatever n is. 79 of rokkit's own 470 modules
  have degree 0: the common case, not the edge.
- **Labels spilled and interleaved** — `UTILS.JS · 1INDEX.JS · 11` was two boxes.
- **A pixel-threshold `display: none` made label visibility a property of the DATA** — a
  container query measures canvas units, so a small box was nameless at every zoom. Labels now
  ellipsise and each zoom step buys characters.

**Dead controls now disappear.** `LAYOUT_OPTIONS` / `appliesTo` publish which options bite per
layout. `density` was dead in `world`, `points` AND `neighborhood` (which builds cards at
`full` unconditionally). The toggle reads `graph.layoutName`, not the `layout` prop — every
real consumer passes a state, leaving the prop answering for a layout not on screen.

**`63bdfa55` / `6ba66953` — the `flow` layout.** Columns ranked by reference direction, every
edge leaves RIGHT and enters LEFT. Demo ER diagram: edges over a foreign card **5 of 9 → 2 of
9**. `rank.ts` (longest path + DFS cycle breaking), `order.ts` (barycentre sweeps scored by an
explicit crossing count, best-seen kept), `flow.ts` (columns, centred, fixed ports).

**`bfdd91c0` — `flow` is now the DEFAULT layout (breaking).** `layout="cluster"` restores the
old arrangement. Schema survives the change via **`groupTint`**, which paints a spine down each
card's leading edge: `--group-fill` was already on every card but only `[data-graph-cluster]`
consumed it, so group identity vanished the moment you left `cluster`.

**`43329bee` — `radial` and `sunburst`.** `points` packed a call graph into boxes and at seven
services read as a stack of colliding labels; `radial` puts angle on the subtrees and radius on
the depth, with `radialMode: 'tree' | 'dendrogram'`. `hierarchy.ts` spanning-tree keeps every
non-tree edge, marked `back`, and walks cycles no root reaches. `sunburst` is the treemap's
question asked radially — same tree, same measure, wedges as `{r0,r1,a0,a1}` turned into paths
by `arc.ts`. **The dot treatment now keys on `data-graph-node-shape`**, not on a layout name,
so `radial` inherited all fifteen rules by declaring a shape; `sizing.ts` is shared, proven
faithful by points' 17 characterization tests still passing. Two defects found by the new
tests: the sunburst drew NOTHING on an all-zero measure, and every containment box took colour
from its OWN name so only the outer ring was coloured (now `Cluster.ramp` inherits).

## Remains

1. **`flow` slice 2 — dummy-node routing.** A long edge is still drawn straight over any box
   between its endpoints; that is the remaining 2 of 9. Routing around needs dummy nodes on the
   intervening ranks, the ordering pass treating them as orderable, and a polyline router.
   Stated as a limit in `docs/design/25-flow-layout.md`, not as completeness.
2. World design steps **4** (drill: `drillPath`/`drillInto`/`drillOut`/breadcrumbs) and **5**
   (`shade` channel + label-contrast flip). Issues **#163**, **#164** still open.
3. **Release order:** rokkit first (dbd needs a `@rokkit/themes` carrying `graph.css` before it
   can drop `link:`), then bump dbd and publish a minor. dbd is on `feat/rokkit-graph`,
   unmerged/unpushed.
4. **Open note:** a shared table is a fan-in hub in the dependency view; `neighborhood` +
   selection dimming answer it but are not discoverable there.

**Design decisions are locked in `docs/design/23-graph.md` and `24-world-view.md` — read them
before relitigating one.**

## Invariants the executor must not violate

1. **Never de-duplicate `buildAdjacency`** — duplicates are the barycenter weighting; a `Set`
   relayouts every multi-FK schema and the suite cannot see it.
2. **A failing ported assertion means the port changed behaviour.** Fix the port, never rebaseline.
3. **A contrast failure on a graph selector is real** — fix the token, never accept-list it; a
   brand colour is a fill or border, never a foreground. `base/*.css` = structure only.
4. Lint, journal, checkpoint and `coverage --project graph` after **every** commit.
5. **Plan lists and code are drafts** — every task has had a defect. A binding named `state`
   breaks the `$state` rune, and **theme CSS is dead until `packages/themes` rebuilds**.
6. **A green unit suite proves the assertions hold, not that anyone looked.** Blank icons, a
   64%-empty canvas, a render aborted by `each_key_duplicate`, 2px-tall nodes and a `0` on
   every treemap leaf all passed 6900+ tests. **Look in a browser.**
7. **Check which port `vite preview` actually bound.** A stale server on 4173 had me reading
   the old build and concluding a correct fix had not applied.
