# The world view — containment, drill-down, and a second measure

> Slice 2 of `@rokkit/graph` (#159). Closes **#163** (containment beyond two levels, no way to
> descend) and **#164** (no quantitative colour channel). Design only — nothing here is built.
>
> Prerequisite shipped: `GraphNode.weight` + `sizeBy`/`sizeScale` (#161, `f74c7f1c`).

## The question this view answers

`points` answers *"what does a dense flat graph look like"*. `cluster` answers *"which things
are grouped, and what links them"*. Neither answers the one a reader of a codebase actually
opens with:

> **Where is the mass, what contains what, and where does the graph know least?**

That is three questions over one picture — **area**, **containment** and **shade** — and the
package can express none of them today.

## What the data looks like

Sensei's index: **1.18M nodes, 4.08M edges**, containment six deep.

```
project › repository › folder › module › file › symbol
```

Two numbers matter per node and they are **not the same number**:

| | example | range | drives |
| --- | --- | --- | --- |
| size | declarations in this subtree | 0 … 10⁵ | area |
| share | how much of it reaches no target | 0 … 1 | shade |

A reader asks both at once — *"this module is huge **and** half its calls go nowhere"* — so
one field serving both is not enough. #164 suggested one addition might cover #161 and itself;
looking at the real control (`SIZE BY` and `SHADE BY` are independent) it cannot.

## Decision 1 — how containment arrives

`GraphFields` has `group`: one flat key. Hierarchy needs more, and there are two shapes.

| | `parent: string` | `path: string[]` |
| --- | --- | --- |
| ancestors must exist as nodes | **yes** | no — synthesised |
| referential integrity | a dangling parent is a broken graph | impossible |
| arrives naturally from | a graph DB | a file path |
| container carries its own data | yes | only if a node happens to match |

**Recommendation: `path`, and it is the node's OWN full path — including itself.**

```js
{ id: 'mod_42', label: 'Lexer', path: ['dbd','core','lexer'], note: 'Tokeniser' }
{ id: 'a',      label: 'parse', path: ['dbd','core','lexer','parse'], weight: 40 }
```

**Containment is PREFIX.** Anything whose path extends past another's is inside it. That is
what makes a container an ordinary node: it keeps its own id, label, note, measures and edges,
and there is no second kind of node and no convention to satisfy.

The first draft of this design had containers **claimed** by a node whose *id* matched the
joined path. That reads fine for the easy entry point and fails exactly where it matters — a
rich node array where containers are real entities with their own ids and attributes could not
claim anything. Prefix containment removes the convention entirely; a prefix nothing declares
is still synthesised, so the easy case still needs only leaves.

A container's value is its subtree **plus its own** measure: a module holds top-level
declarations as well as the functions inside it.

### It also accepts a delimited string

```js
{ id: 'a', label: 'parse', path: 'dbd/core/lexer/parse', weight: 40 }
```

A file path arrives as a string; making every consumer split it is asking for the same three
lines everywhere. `GraphFields.pathDelimiter` overrides `/`, and empty segments are dropped so
a leading, trailing or doubled separator is harmless rather than producing a nameless box.
Both forms build a byte-identical tree.

This is a **model change, not a layout change** — the real prerequisite, exactly as the slice-1
note predicted.

### A single-child container is folded away

`src › lib › index.ts` with nothing else at either level is three boxes for one file. The
reference folds them, and so should we: a wrapper is not a level. Folding is a property of the
tree build, so it is testable without geometry.

Two exceptions since #165. A declared node is never a wrapper. And the containers on the current
`focusPath` are never folded, because they are the scope the reader asked for (see Decision 3).

## Decision 2 — what it looks like

The obvious reaches are circle packing and the radial family. Both are wrong here, for reasons
this package has already measured once.

| | containment | area ∝ measure | legible label | deterministic | survives 1.18M |
| --- | --- | --- | --- | --- | --- |
| **nested rects (treemap)** | yes | yes | **yes** | yes | with materialisation |
| circle pack | yes | yes | poor | yes | wastes 21% per level |
| sunburst | yes | by angle | poor past depth 2 | yes | yes |
| radial cluster | yes | no | poor | yes | no |
| force-directed tree | implied | no | no | **no** | no |
| force-directed graph | **no** | no | no | **no** | no |

**Recommendation: squarified treemap of nested rounded rects.**

`points.ts` already learned the geometry half of this the hard way: a circular container
discards `1 − π/4 = 21%` of its bounding box before anything is placed in it, and the fix
measured **607×595 → 352×426** on the same data. Nesting multiplies that waste per level. A
rect also holds a readable label at small sizes, which is what makes drill-down navigable —
you have to be able to read what you are about to click.

### Why not force, specifically

Two independent disqualifiers, and the second is the one that settles it:

1. **Non-deterministic.** Every layout here is a pure `(model, options) => LayoutResult`,
   unit-testable to exact pixels — that is what the 20 ported characterization tests rest on. A
   force sim can be *made* deterministic (seeded RNG, fixed tick count, run to completion), so
   this is a cost, not a bar.
2. **It does not scale, and cannot be made to.** Force is O(n log n) **per tick** × ~300 ticks.
   At 1.18M nodes that is not a slow render, it is not a render. The world view survives its
   data by materialising two levels at a time — and a simulation over two materialised levels
   is just a simulation over a small graph, at which point the hierarchy is doing the work and
   the physics is decoration.

Force earns its place on a *different* question — "what clusters together" over an adjacency
graph of a few thousand nodes, with no hierarchy. That is a separate `LayoutFn`, and the seam
already accepts it. It is not the world view.

### Sunburst is worth having, later

As a **minimap**, not the main view: it shows the shape of the whole tree in one glance where
the treemap shows one level well. Same `path` model, same measure, different projection —
another `LayoutFn`, no new model work. Sequencing it after the treemap costs nothing.

## Decision 3 — two levels, and drilling

The technique that makes 1.18M nodes survivable is **not** geometry. It is refusing to
materialise the tree.

```
world(model, { focusPath: ['dbd', 'core'], levels: 2 })
```

Renders `core`'s children and their children. Nothing else exists in the result — not hidden,
not clipped, **not built**. The cost is in materialising nodes, not in packing them.

**Zoom magnifies; drilling changes scope.** They are different operations and conflating them
is the trap: `Graph`'s existing zoom is a scale transform over the whole canvas, so at 1.18M
nodes every box is sub-pixel — the exact failure `points.ts`'s own doc comment describes for
cards. Only re-running the layout with a subtree as root keeps it readable.

### State, because the view must not own it

```ts
GraphState {
  drillPath: string[]              // [] is the root
  drillInto(id: string): void
  drillOut(levels = 1): void
  breadcrumbs: { id: string; label: string }[]
}
```

This is the architecture directive applied: the whole of drilling is provable from a dataset
and three assertions, with no render. The component gets a breadcrumb trail and an "up"
affordance that call methods and display `state.breadcrumbs`.

`focus` is **not** reusable for this. It already means "centre on this node" and belongs to
`neighborhood`; overloading it would make two layouts fight over one field.

### Built (#165, 2026-09-30) — and what the design left open

`state/GraphDrill.svelte.ts` holds the drill state; `drillPath` IS `focusPath`. What #165 added
on top, and the decisions made building it:

- **Events.** `ondrill(path, node)` / `ondrillup(path)`. A promise return makes the state
  `pending` until it settles. Only the latest drill's settlement counts. A rejection, or a
  handler that throws, restores the previous path and exposes `drillError`, because an empty
  canvas would read as a broken level, not a failed load.
- **The DATA path, not the display path.** Folding splices a wrapper's segment out of a box's
  `path`, but a host loads by the path in its own data. So every tree node keeps its unfolded
  `address`; `Cluster.path` and `focusPath` are addresses.
- **The focus chain is never folded.** A host answering a drill sends ONE level: a crate's
  modules, with nothing declaring the crate. Every container above them is then an undeclared
  single-child wrapper, exactly what folding removes, so the focusPath naming them stopped
  resolving and the new level rendered empty. `buildTree(model, { keep: focusPath })` keeps
  the containers on that path.
- **Gestures.** A drillable container is a real button ("Open …"). A leaf selects on click
  and opens on double-click, or via the drill bar's *Open*. A leaf is drillable only when the
  host loads levels. Only a layout that DECLARES `focusPath` drills.
- **Drilling is not selecting**, as the `root` doc comment already drew the line.

## Decision 4 — the second measure (#164)

`GraphChannel` is `'color' | 'pattern'`, both **nominal**. A 0..1 share bucketed into eight
categorical hues says the opposite of what the data says: `blue` and `emerald` are not
more-and-less of anything.

Two ways to carry the numbers:

**(a) A second named field.** `GraphFields.shade` beside `weight`.
Simple, explicit, two optional numbers. Switching which share is shaded means re-mapping
fields, which **re-normalizes the whole model** — O(n) over 1.18M nodes on every toggle of a
three-way control.

**(b) A measures bag.** `GraphNode.measures?: Record<string, number>`, with `sizeBy` and
`shadeBy` naming a key.
Switching is a layout re-run over an unchanged model. `weight` stays as the named default, so
#161 does not churn.

**Recommendation: (b).** The control it exists for is *three* shares switchable at runtime, and
(a) pays a full re-normalize for each toggle. The cost is one more concept; the alternative is
a concept that does not fit its only use.

```ts
type GraphChannel = 'color' | 'pattern' | 'shade'
createGraphPreset({ using: 'shade', shade: { family: 'slate', from: 50, to: 900 } })
```

### The part that is easy to get wrong

**Label contrast.** Past roughly the midpoint of any ramp the label must flip to the light
shade, and a consumer doing it by hand gets it wrong on two of eight steps. `resolveGroupStyles`
already measures a label against its fill; the same discipline applies per value, and it is
the reason this belongs in the package rather than in a snippet.

## Decision 5 — the dependency question

`d3-hierarchy` has `treemap` (squarified) and `pack`. `@rokkit/chart` already carries nine d3
packages, so the precedent exists in the monorepo — but `@rokkit/graph` has **no third-party
runtime dependency** (`@rokkit/core` is a workspace sibling), and `dependencies.spec.js`
asserts exactly that:

```js
const thirdParty = Object.keys(pkg.dependencies ?? {}).filter((d) => !d.startsWith('@rokkit/'))
expect(thirdParty).toEqual([])
```

**Recommendation: write it.** Squarified treemap is ~80 lines and naturally deterministic; we
hand-rolled shelf packing in `points.ts` for the same reason, and that file is 297 lines of
which most is the reasoning rather than the maths. The case *for* d3 would be circle packing,
which decision 2 rejects. Taking the package's **first** third-party runtime dependency to
avoid 80 lines would be a poor trade, and it is the kind of decision that is easy to drift
into and hard to reverse — the spec above exists precisely so it has to be deliberate.

## What it does not solve

Named so nobody discovers them as surprises:

- **Edges at world scale.** The world view is containment; 4.08M edges cannot be drawn and
  should not be. Cross-container relationships need aggregation ("47 calls from `core` to
  `util`") which is its own design.
- **Search.** Drilling six levels to find one symbol is worse than typing its name. The
  breadcrumb trail makes drilling *reversible*, not *efficient*.
- **#162's fan-out grouping.** Deferred here on purpose: grouping a depth-2 neighbourhood's
  outer columns by module is the same containment question, and solving it twice in two shapes
  would be the wrong move.

## Build order

Each step is shippable and independently testable, and the first two are the model work
everything else waits on.

1. **`path` on the canonical model**, container synthesis, single-child folding, subtree sums.
   No geometry. Pure `normalizeGraph` + tree tests.
2. **`measures` bag**, `sizeBy`/`shadeBy` by key. `weight` stays the default.
3. **`world` LayoutFn** — squarified treemap over `focusPath` + `levels`.
4. **Drill state** — `drillPath`, `drillInto`, `drillOut`, `breadcrumbs`.
5. **`shade` channel** on the preset, with the label-contrast flip.
6. *(optional)* **`radial`** — sunburst minimap over the same model.
7. *(separate question)* **`force`** — adjacency, no hierarchy, seeded and frozen.

Steps 1–2 close the model half of #163 and #164. Steps 3–4 make it a view. Step 5 is the
second channel. 6 and 7 are additions to the same seam, not prerequisites.
