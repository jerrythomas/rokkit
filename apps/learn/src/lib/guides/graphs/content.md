# Graphs

`@rokkit/graph` draws node-link diagrams. An ER diagram is one thing it can draw, not
what it is — the same component renders a service call graph, a dependency tree or a
lineage map, because nothing in it knows what a table is.

## Start with the data you have

There is no import step and no schema type to conform to. `nodes` and `edges` are
whatever shape you already hold, and `fields` maps dotted paths from that shape to the
canonical model:

```svelte
<script>
  import { Graph } from '@rokkit/graph'

  const services = [
    { key: 'checkout', team: 'commerce', endpoints: [{ label: 'POST /cart' }] },
    { key: 'catalog', team: 'commerce', endpoints: [{ label: 'GET /products' }] }
  ]
  const calls = [{ caller: 'checkout', callee: 'catalog' }]

  // The whole adapter. No transform step, no bespoke types.
  const fields = {
    id: 'key',
    label: 'key',
    group: 'team',
    rows: 'endpoints',
    rowName: 'label',
    source: 'caller',
    target: 'callee'
  }
</script>

<Graph nodes={services} edges={calls} {fields} />
```

Anything you omit falls back to the same-named key, so data already shaped like the
canonical model needs no map at all. Fields the map does not claim ride along untouched
on `node.meta` — which is how the entity panel finds a table's indexes without the
package ever learning what an index is.

Endpoints resolve by exactly two rules: the value already **is** a node id, or it is
`group.value` where the group comes from a path you declared. There is deliberately no
third "search the siblings for a match" rule. An endpoint that cannot be resolved drops
its edge rather than landing on a coincidental match and drawing a relationship that
does not exist.

## Layouts are functions

```ts
type LayoutFn = (model: GraphModel, options: LayoutOptions) => LayoutResult
```

DOM-free, synchronous, deterministic — card heights come from row counts and nothing is
measured, which is what makes a layout testable to exact pixels. Eight ship today:

- **`flow`** (the default) — columns ranked by reference direction, every edge leaving a
  card's right edge and entering the next one's left.
- **`cluster`** — groups become clusters, clusters are ordered to reduce edge crossings,
  and each cluster's nodes are masonry-packed then flowed into wrapping rows.
- **`neighborhood`** — the focused node centred, nodes that reference it stacked left,
  nodes it references stacked right.
- **`points`** — dense graphs: small rects sized by degree or a measure, packed by group.
- **`radial`**, **`structure`**, **`world`**, **`sunburst`** — trees and containment.

Pass `layout` a name or your own function. Nothing about the canvas is layout-specific.

## Edges that must not move the picture

Some edges are exactly what a reader wants to see and exactly what must not shape the layout —
files that change in the same commit with no import between them, a layering rule broken, a
suggested dependency. Let a co-change edge into `flow`'s ranking and it pulls the pair side by
side, hiding the coupling it was meant to expose. Mark it an overlay:

```js
const edges = [
  ...imports,
  { source: 'ui/components', target: 'ui/types', overlay: true, relation: 'co-change', weight: 20 }
]
```

An overlay never reaches the layout, neighbours or relationships; it is routed afterwards,
between the cards the layout placed, drawn dotted (`data-edge-overlay`), and its `weight` —
normalised to the heaviest — thickens the stroke. `fields.overlay` and `fields.edgeWeight` map
both from your own shape.

## The dependency matrix

A node-link drawing of a real codebase is a hairball. `DependencyMatrix` draws the same model as
a dependency structure matrix — every node a row and a column, a cell where the row depends on
the column — ordered providers-first, so a layered codebase is lower-triangular and **a cell
above the diagonal is a dependency against the grain**: a cycle, or a layer reaching up.

```svelte
<DependencyMatrix {nodes} {edges} {fields} groupBy="group" cell={14} />
```

`groupBy` keeps each group contiguous and outlines it on the diagonal, so a cross-module
violation is a mark outside its block. The drawing grows with the square of the node count —
aggregate files to components first; a weighted edge counts as its weight, so an aggregated
import list reads as-is. Row headers are buttons that select through `GraphState`: share one
`state` with a node-link view and both follow the same selection.

The graph demo's **Dependency matrix** and **Hidden coupling** examples read rokkit itself at
component grain — 17 of its 81 component dependencies sit above the diagonal, and 19 pairs of
components change together with no import between them.

## Three views, one state

`Graph`, `EntityView` and `EntitiesView` all read a `GraphState`. Hand them the same
instance and selection is two-way for free — clicking a node in the diagram is what the
entity panel is already reading:

```svelte
<script>
  import { Graph, GraphState } from '@rokkit/graph'
  import { EntityView } from '@rokkit/graph/schema'

  const state = new GraphState({ nodes, edges, fields })
</script>

<Graph {state} />
<EntityView {state} />
```

A view nested inside `<Graph>` picks the state up from context, so composing them works
too. The instance must keep **stable identity** — drive it through `update()` and its
methods rather than replacing it.

`GraphState` owns every derivation in the package. Components render and route intent;
they compute nothing. That is what lets the geometry, badge derivation and selection
logic be covered exhaustively without a renderer.

## Reading a large diagram

Fit-to-container alone shrinks a real schema until its labels are unreadable, so the
canvas zooms:

- the controls sit **on the canvas**, bottom right — `−`, the current percentage (click
  to reset to fit), and `+`
- ctrl/⌘ + wheel, which is what a trackpad pinch reports as, zooms the diagram rather
  than the page
- past the fit the canvas scrolls, and dragging the background pans it

Set `zoomable={false}` to turn all of that off, or bind `zoom` to drive it yourself.

## Colour

Two vocabularies, handled deliberately differently.

**Node kinds are a closed set**, so they live in CSS. One rule retones a kind — but match
the theme's specificity, because every style scopes its rules under `[data-style]`:

```css
/* wins everywhere */
[data-style] [data-node-kind='table'] {
  --node-accent: var(--primary);
}
```

A bare `[data-node-kind='table']` is `(0,1,1)` against the theme's `(0,2,0)` and silently
loses.

**Group names are open** — not knowable at build time, so they cannot be pre-written.
`createGraphPreset` assigns them from a ramp, by *sorted* group name so a group keeps its
colour when `arrange` reorders the layout:

```js
createGraphPreset({
  groups: ['teal', 'gold', 'violet'],
  using: 'pattern' // colour-blind- and print-safe
})
```

It resolves to CSS custom properties rather than concrete fills, so an attribute rule
still wins. JS picks the default; CSS keeps the final say.

All six styles ship a `graph.css` — `base`, `rokkit`, `minimal`, `material`, `frosted`
and `zen-sumi` — each with its own character rather than a shared default.

## Using it with dbd

`@rokkit/graph/schema` carries `SCHEMA_FIELDS` and `fromSchemaModel` for dbd-shaped JSON.

It does **not** import dbd's `SchemaModel` type, and that is deliberate: the hand-written
mirror of `schema_model.rs` stays in the consuming app, so this package never becomes a
third definition to keep in step by hand.
