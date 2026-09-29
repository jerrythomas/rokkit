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

## Remains

1. **Next: layered ER layout** (user request, not started). Incoming edges always enter LEFT,
   outgoing always leave RIGHT, and boxes arranged to minimise crossings so links are
   traceable — today they are buried behind entities. This is a **new layout, not a tweak**:
   `edges.ts` `sides()` picks ports by relative POSITION, not direction, and `cluster.ts` is
   schema-grouped masonry with barycenter passes, not a DAG. Needs rank assignment (with cycle
   breaking), per-layer ordering, then fixed ports.
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
