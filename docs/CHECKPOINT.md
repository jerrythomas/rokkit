# CHECKPOINT

**Slice #159/#163** — `@rokkit/graph`. Package **published**; the API has since moved to named
diagrams over a bare canvas (BREAKING — dbd needs updating). Tree clean on `develop`, **not
pushed**. **1078 unit (graph+learn), 44 graph e2e, lint/types 0/0, graph coverage gate passes,
zero a11y compile warnings.**

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

**`43329bee` — `radial` and `sunburst`.** Call graph as a tidy tree/dendrogram; sunburst as the
treemap's question asked radially. Dot treatment keys on `data-graph-node-shape`, not a layout
name. `sizing.ts` shared with `points`.

**`d7e8addf` — named diagrams over a bare canvas (BREAKING).** `Graph` ships no chrome.
`ErDiagram` · `DependencyDiagram` · `CallTree` · `Treemap` · `Sunburst` · `Neighborhood` ·
`StructureDiagram`, each usable alone, each offering only the controls that mean something for
it. `controls`/`legend` default OFF. Controls are components that store nothing.

**`4ec67db1` — one demo example per diagram (#159).** A registry pairs each diagram with the
dataset it reads, so an ER dataset can no longer be pointed at a radial tree. Found two real
defects: with a SHARED state a diagram wrote nothing so its controls were inert (fixed by
`GraphState.apply()`, a merge where `update()` reverts), and the layout has to come from the
registry because `update()` fully re-applies — `graph-registry.spec.ts` compares the two.

**`50783403` — the `structure` view.** What `CallTree` could not be over a real repo: a call
graph's spanning tree has hundreds of roots, so depth prunes nothing. Containment is a real
tree — `buildTree` over `path`, leaves on a rim, ancestor bands as wedges, calls BUNDLED
through the hierarchy (Holten). Modelled on Sensei's Structure board. Four bugs the specs
caught: a declared leaf's id is not its joined path (every edge started at its parent);
depth-based radii broke the rim because the tree folds single-child wrappers; `bundleTension`
never reached `GraphState`'s options object; bands keyed by label collided (`each_key_duplicate`
aborts the whole render). Strokes are `non-scaling-stroke` — a repo's canvas fits ~1700px into
~700px.

## Remains

1. **`flow` slice 2 — dummy-node routing.** A long edge is still drawn straight over any box
   between its endpoints; that is the remaining 2 of 9 on the ER diagram. Needs dummy nodes on
   the intervening ranks and a polyline router. Stated as a limit in `docs/design/25-flow-layout.md`.
2. **Legend reuse.** `@rokkit/graph` ships its own because chart carries 8 d3 packages + ramda
   against this package's ONE dependency, and chart does not depend on `@rokkit/ui` either — so
   there is no package both already share. Real reuse means promoting a generic legend
   somewhere both can reach. Flagged in `GraphLegend.svelte` as what it replaces.
3. **World/sunburst drill** (design step 4: `drillPath`, breadcrumbs) and step 5 (`shade`
   channel). Issues **#163**, **#164** still open.
4. **Release order:** rokkit first (dbd needs a `@rokkit/themes` carrying `graph.css`), then
   bump dbd and publish a minor. dbd is on `feat/rokkit-graph`, unmerged. **dbd will need
   updating for the breaking API change** — `Graph` no longer ships controls, and the named
   diagrams are the intended entry point.
5. **Open note:** a shared table is a fan-in hub in the dependency view; `neighborhood` +
   selection dimming answer it but are not discoverable there.

**Design decisions are locked in `docs/design/23-graph.md`, `24-world-view.md` and
`25-flow-layout.md` — read them before relitigating one.**

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
