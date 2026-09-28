`@rokkit/graph` draws node-link diagrams. An ER diagram is one thing it can draw, not
what it is.

## The data contract

`nodes` and `edges` are whatever shape you already have. `fields` is a map of dotted paths
from that shape to the canonical model, resolved **once**, before anything else runs:

```js
const fields = {
  id: 'key',
  label: 'key',
  group: 'team',
  rows: 'endpoints',
  rowName: 'label',
  rowBadges: { pk: 'primary' },
  source: 'caller',
  target: 'callee'
}
```

Anything you omit falls back to the same-named key, so data already shaped like the canonical
model needs no map at all. Fields the map does not claim are passed through untouched on
`node.meta` — that is how `EntityView` finds a table's indexes without the package ever
knowing what an index is.

Endpoints resolve by exactly two rules: the value already **is** a node id, or it is
`group.value` where the group comes from a path you declared. There is deliberately no third
"search the siblings" rule — an endpoint that cannot be resolved drops its edge rather than
landing on a coincidental match and drawing a relationship that does not exist.

## Layouts

A layout is a pure function:

```ts
type LayoutFn = (model: GraphModel, options: LayoutOptions) => LayoutResult
```

DOM-free, synchronous, deterministic — card heights come from row counts, nothing is measured.
Two ship today:

- **`cluster`** — groups become clusters, clusters are ordered to reduce edge crossings, and
  each cluster's nodes are masonry-packed then flowed into wrapping rows.
- **`neighborhood`** — the focused node centred, nodes that reference it stacked left, nodes it
  references stacked right.

Pass `layout` a name or your own function. Nothing about the canvas is layout-specific.

## Three views, one state

`Graph`, `EntityView` and `EntitiesView` all read a `GraphState`. Hand them the same instance
and selection is two-way for free — clicking a node in the diagram is what the entity panel is
already reading:

```svelte
<script>
  import { Graph, GraphState } from '@rokkit/graph'
  import { EntityView } from '@rokkit/graph/schema'

  const state = new GraphState({ nodes, edges, fields })
</script>

<Graph {state} />
<EntityView {state} />
```

A view nested inside `<Graph>` picks the state up from context, so you can also just compose
them. The instance must keep **stable identity** — drive it through `update()` and its methods
rather than replacing it.

`GraphState` owns every derivation in the package. The components render and route intent; they
compute nothing. That is what lets the geometry, badge derivation and selection logic be tested
exhaustively without a renderer.

## Colour

Two vocabularies, deliberately handled differently.

**Node kinds are a closed set**, so they are plain CSS. One rule retones one kind:

```css
[data-node-kind='table'] {
  --node-accent: var(--primary);
}
```

**Group names are open** — they are not knowable at build time, so they cannot be pre-written.
`createGraphPreset` assigns them from a ramp, by *sorted* group name so a group keeps its colour
when `arrange` reorders the layout:

```js
createGraphPreset({
  groups: ['teal', 'gold', 'violet'],
  using: 'pattern' // colour-blind- and print-safe
})
```

It resolves to CSS custom properties rather than concrete fills, so an attribute rule still
wins. JS picks the default; CSS keeps the final say.

## Theming hooks

Every visual hook is a data-attribute — see the API tab for the full list. The ones you will
reach for first:

| Attribute          | Values                                            |
| ------------------ | ------------------------------------------------- |
| `data-node-kind`   | `table` `view` `matview` `function` `procedure` `enum` |
| `data-node-group`  | your group names                                  |
| `data-node-state`  | `selected` `related` `dim`                        |
| `data-edge-kind`   | `reference` `dependency` (dashed)                 |
| `data-edge-state`  | `highlight` `dim`                                 |
| `data-row-badge`   | `pk` `fk` `uq` `nn`                               |

## Using it with dbd

`@rokkit/graph/schema` carries `SCHEMA_FIELDS` and `fromSchemaModel` for dbd-shaped JSON.

It does **not** import dbd's `SchemaModel` type, and that is on purpose: the hand-written
mirror of `schema_model.rs` stays in the consuming app, so this package never becomes a third
definition to keep in step by hand.
