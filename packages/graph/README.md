# @rokkit/graph

Node-link diagram components for Svelte 5. ER diagrams, schema entity tables and dependency /
call graphs from one component, driven by field-mapped data rather than a fixed schema type.

```bash
npm install @rokkit/graph
```

`@rokkit/ui` and `svelte` are peer dependencies. `@rokkit/ui` is optional — only the
`./schema` views use it.

## Usage

```svelte
<script>
  import { Graph } from '@rokkit/graph'

  const services = [
    { key: 'checkout', team: 'commerce', type: 'procedure' },
    { key: 'ledger', team: 'finance', type: 'table' }
  ]
  const calls = [{ caller: 'checkout', callee: 'ledger' }]

  // Your shape, mapped once. Nothing downstream sees your field names.
  const fields = {
    id: 'key',
    label: 'key',
    group: 'team',
    kind: 'type',
    source: 'caller',
    target: 'callee'
  }
</script>

<div class="relative h-[600px]">
  <Graph nodes={services} edges={calls} {fields} />
</div>
```

The canvas fills its nearest positioned ancestor, so give it a `relative` box with a height.

## What it is

The package knows nodes, edges, groups and kinds — it has no opinion about databases. The dbd
vocabulary lives entirely in the optional `./schema` entry point.

| Import | Contains |
|--------|----------|
| `@rokkit/graph` | `Graph`, `GraphState`, layouts, presets, `normalizeGraph`, `DEFAULT_ICONS`, `appliesTo`, types |
| `@rokkit/graph/schema` | `EntityView`, `EntitiesView`, `NoteBlocks`, `fromSchemaModel`, `toGraphInput`, `SCHEMA_FIELDS`, `DEPS_FIELDS` |
| `@rokkit/graph/icons` | `DEFAULT_ICONS` alone, with no Svelte imports — for your UnoCSS safelist |

## Named diagrams

`Graph` is the canvas and ships no chrome. A named diagram is the composition already made —
one layout, the controls that mean something for it, an opt-in legend. The same shape
`@rokkit/chart` uses, where `BarChart` and `LineChart` sit over one `Plot`.

```svelte
<script>
  import { ErDiagram, CallTree, Treemap, Sunburst } from '@rokkit/graph'
</script>

<ErDiagram {nodes} {edges} {fields} controls legend />
```

`ErDiagram` · `DependencyDiagram` · `CallTree` · `Treemap` · `Sunburst` · `Neighborhood`.
Both `controls` and `legend` default to off: the default is the bare picture.

Composing your own is the same parts in a different box — `DensityControl`, `EdgeStyleControl`,
`DepthControl`, `ZoomControl` and `GraphLegend` are all exported, and none of them stores a
value. They report what was chosen and you own it.

## Layouts

A layout is a pure `(model, options) => LayoutResult` — DOM-free, synchronous, deterministic.
Your own slots in the same way.

- **`flow`** — cards in columns by reference direction. **The default.** Every edge leaves
  right and enters left, so direction reads off the geometry and links stay traceable. Pair it
  with `groupTint` to keep schema visible without cluster boxes.
- **`cluster`** — cards in group boxes. Entity diagrams grouped by schema.
- **`neighborhood`** — one focus node and its 1-hop neighbours.
- **`radial`** — a tidy tree or dendrogram around a circle. Call graphs: angle separates the
  subtrees, radius carries the depth.
- **`points`** — degree-sized rects, shelf-packed. Dense graphs, 1000+ nodes.
- **`world`** — nested rectangles, area proportional to a measure. Where the mass is.
- **`sunburst`** — the same containment as nested wedges, with depth on the radius.

Two-level clustering shows both grouping axes at once, which matters for a dependency graph
where one schema holds a table, a trigger and a procedure:

```svelte
<Graph {nodes} {edges} {fields} groupBy="group" nestBy="kind" />
```

`world` returns no cards: a treemap nests one shape, so a leaf is a `Cluster` too, carrying
`nodeId` and `kind` so it stays selectable. Its caption is the measure driving its area, not a
child count.

Not every option reaches every layout, and a control wired to one that does not is worse than a
missing one — it moves and nothing happens:

```js
import { appliesTo } from '@rokkit/graph'

appliesTo('world', 'density')  // false — a treemap box has no row list to thin
```

## Two things worth knowing

**An unplaced edge is dimmed, never dropped.** An endpoint the map cannot resolve is a normal
state at scale, not a defect — Sensei's code graph reports 59.6% of 4.08M edges with a null
target: the call is real, the callee is simply not indexed. Dropping them would make the graph
look far more complete than it is.

**A schema is two graphs.** dbd's v2 `SchemaModel` separates `tables`/`refs` from
`entities`/`deps` because an ER diagram is table entities and their foreign keys — a view is a
derived projection and a routine is behaviour, so neither belongs on that canvas:

```js
import { toGraphInput } from '@rokkit/graph/schema'

const er = toGraphInput(model, 'er')             // tables + refs
const deps = toGraphInput(model, 'dependencies') // tables + entities, deps as edges
```

## Icons need a safelist

The component picks a node's icon at runtime from its kind, so the class names never appear in
your source and UnoCSS purges them — cards render a blank box. Safelist them from the
Node-safe subpath (a `uno.config.ts` runs in Node and cannot parse `.svelte`):

```js
import { DEFAULT_ICONS } from '@rokkit/graph/icons'

export default defineConfig({ safelist: Object.values(DEFAULT_ICONS) })
```

## Theming

Unstyled by default; `@rokkit/themes` ships `graph.css` for all six styles. Every visual hook
is a data-attribute — `data-node-kind`, `data-edge-kind`, `data-edge-relation`,
`data-cluster-depth`, `data-graph-detail` and more.

Node kinds are a closed set, so they are plain CSS. Groups are open-ended, so they get a ramp
from `createGraphPreset({ using: 'color' | 'pattern' })`.

## Docs

- [Package reference](../../docs/llms/packages/graph.txt) — data contract, layouts, dbd adapter
- [Component reference](../../docs/llms/components/graph.txt) — props, interaction, attributes
- [Design](../../docs/design/23-graph.md) — why it is its own package, and what is locked
