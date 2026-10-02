# Graph Package (`@rokkit/graph`)

> Design for `@rokkit/graph` — node-link diagram rendering: a canonical `{nodes, edges}` model
> with pluggable layouts, rendered as positioned cards plus routed edges, plus a schema/ER view
> layer on top of it.
>
> Origin: issue #159 — extract dbd's ER-diagram viewer (`sensei-hq/dbd`,
> `site/src/lib/design/`, 2,860 lines) so that **dbd** and **sensei** render the same thing
> from the same code instead of reimplementing it.
>
> **Status:** Design agreed 2026-09-27. Slice 1 not yet implemented.

---

## Why not `@rokkit/chart`

`@rokkit/chart` is a grammar-of-graphics engine. Its entire vocabulary is _scales → channels →
marks_: `PlotState` publishes a 23-member geom-facing contract (pinned by
`packages/chart/spec/spark-contract.spec.js`), geoms consume `xScale`/`yScale`/domains, and
`Spark` exists precisely so a sparkline can speak that same contract.

A node-link diagram has none of it — no domain, no channel encoding, no scale. It has **nodes,
edges, and a layout algorithm**. The two share an SVG element and nothing else. Three concrete
costs of folding it into `chart`:

1. **Dependency footprint.** A force-directed layout needs `d3-force`; a layered call graph
   likely needs `dagre` or `elkjs`. Those land in the install tree of everyone who wanted a bar
   chart. `chart` already carries nine `d3-*` packages plus `ramda`.
2. **The consumers do not want chart.** dbd and sensei want the ER viewer. Depending on
   `@rokkit/chart` drags in `crossfilter`, `d3-scale-chromatic` and the whole `Plot` surface.
3. **Nothing is actually reusable.** `d3-zoom` lives in `PlotSurface.svelte` and
   `Plot/Root.svelte`, both wired to `PlotState` context. There is no standalone pan/zoom
   surface to inherit — it is ~100 lines either way.

The monorepo already separates by _abstraction_, not by "is it visual" — `forms`, `data`,
`blocks`, `chart`. A graph package fits that grain.

---

## Package shape

`@rokkit/graph`, two entry points:

| Entry      | Contents                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| `.`        | Canonical model, normalizer, layout interface + built-in layouts, `Graph` canvas, edge routing, fit-to-container |
| `./schema` | ER views: `EntityView`, `EntitiesView`, `NoteBlocks`, `fromSchemaModel`, key/FK badges                           |

The entity-centric diagram is **not** a `./schema` component — it is the `neighborhood` layout
under `.`, rendered by the same `Graph` canvas. See _Layout interface_.

- **Dependency:** `@rokkit/core` only
- **Optional peer:** `@rokkit/ui` — needed by `./schema` (`EntitiesView` composes its `Table`),
  never by `.`
- **Peer:** `svelte` (`^5.0.0`) — never a hard dependency; see
  `packages/core/spec/workspace-peers.spec.js`
- **No third-party runtime dependencies.** `fflate` stays in dbd with `fragment.ts`.

**Why `@rokkit/ui` is an optional peer and not a dependency.** It carries hard runtime deps on
`marked` (^15) and `dompurify` (^3.4.13) for `MarkdownRenderer`, plus a `shiki` peer — none of
which this package touches. `dependencies` is unconditional across both export entries, so a
consumer importing only `.` for the `Graph` canvas would still pull a Markdown parser and an HTML
sanitiser into their tree. That is precisely the cost this design rejects `@rokkit/chart` for
three sections above; taking it here would be inconsistent. `@rokkit/blocks` already establishes
the pattern with `peerDependenciesMeta.mermaid.optional`.

**What crosses:** ~1,020-1,050 lines of source plus ~400 lines of existing tests. (The port
table's per-file counts are whole-file figures; two rows carry only a subset — `model.ts`
contributes ~22 of its 68 lines, and `EntityDiagram.svelte` ~125 of its 222, since its rendering
half becomes `Graph.svelte` rather than the layout.) `Icon.svelte` (78) does not cross at all —
see _Reuse instead of port_.

The two entry points keep the boundary honest without prematurely splitting into two packages.
Splitting later is a manifest change, not a redesign.

**No interactive pan/zoom in slice 1.** The `Graph` canvas does static fit-to-container, because
that is what the ported source does — `DiagramView.svelte:41` says so in its own comment:
`// Static fit-to-container (no pan/zoom — this is a gallery render).` Drag-to-pan and
scroll-to-zoom are a later slice. `@rokkit/chart` has `d3-zoom` wired to `PlotState`, so there is
prior art to draw on when that lands, but nothing to inherit today.

---

## Data contract: mapped in, canonical inside

The public API is field-mapped, matching `List`/`Tree` and the Data-First principle. A
normalize step resolves the mapping **once**; everything downstream sees concrete types.

```svelte
<Graph
  nodes={schema.tables}
  edges={schema.refs}
  layout="cluster"
  fields={{
    group: 'schema',
    kind: 'kind',
    rows: 'columns',
    source: 'from.t',
    target: 'to.t',
    sourceGroup: 'from.s',
    targetGroup: 'to.s'
  }}
/>
```

`sourceGroup`/`targetGroup` are not optional decoration. An edge endpoint like `from.t` yields a
bare label (`orders`), and qualifying it to a node id needs the group — which lives on the
_endpoint_ (`from.s`), not on the edge. Declaring the path is deliberate: the alternative is
sweeping the endpoint's sibling fields for anything that happens to form a known id, which
resolves the wrong node whenever a stale schema name coincides with a real one.

```ts
normalizeGraph(nodes, edges, fields) → GraphModel
```

### Canonical types

```ts
type RowBadge = 'pk' | 'fk' | 'uq' | 'nn'

type GraphRow = { name: string; type?: string; badges: RowBadge[]; note?: string }

type GraphNode = {
  id: string // stable key; `${group}.${label}` when group is present
  label: string
  group?: string // open vocabulary (a schema name)
  kind?: string // closed vocabulary (table | view | matview | …)
  rows: GraphRow[]
  note?: string
  meta: Record<string, unknown> // unmapped source fields, passed through untouched
}

type GraphEdge = {
  id: string
  source: string
  target: string // GraphNode.id
  sourceRow?: string
  targetRow?: string // GraphRow.name — the anchor points
  kind: 'reference' | 'dependency'
  cardinality?: string
  action?: string
}

type GraphModel = {
  nodes: GraphNode[]
  edges: GraphEdge[]
  byId: Map<string, GraphNode>
  neighbors: Map<string, Set<string>>
}
```

Two deliberate choices:

- **`kind` on the edge** is the seam for dbd#24's dependency edges (view reads table, procedure
  calls function). A second edge kind lands without touching a single layout call site.
- **`badges` as an array** replaces dbd's per-flag booleans (`pk`, `nn`, `en`) plus the `fk`
  flag derived in `toLayoutData`. Derivation moves into the normalizer, so `fk`/`uq` arriving
  natively from dbd#24 is a normalizer change, not a component change.

### `SchemaModel` does not enter Rokkit

Issue #159's first concern is that dbd's `model.ts` is a hand-written mirror of
`crates/dbd-core/src/schema_model.rs`, kept in step by hand, and that sensei becoming a third
consumer makes that a real drift risk.

**This design dissolves it.** `@rokkit/graph` only ever sees its own canonical types. dbd keeps
`SchemaModel` and `validateModel` and maps its JSON in; sensei maps its own shape; neither
model crosses the boundary. The extraction therefore adds **no** new consumer to drift against
the Rust type.

`fromSchemaModel()` ships in `./schema` as optional sugar over the same normalizer — a
convenience for dbd, not a second contract.

**The drift is not hypothetical — it has already happened.** `crates/dbd-core/src/schema_model.rs`
shipped a v2 on 2026-09-27 (`version`, `entities`, `deps`, plus `fk`/`uq` on `Column`), while
`site/src/lib/design/model.ts` was last touched 2026-06-15 and is still v1-shaped. Two definitions
kept in step by hand, currently out of step. Keeping that mirror out of Rokkit is the whole point.

What does cross from `model.ts` is `toLayoutData`, `neighborsOf` and `nodeId`, re-expressed in
canonical terms inside the normalizer.

---

## Layer separation: state owns every derivation

Three layers, each testable alone — the `sensei:ui-state-pattern` shape, and the one
`PlotState`/`SparkState` already use in `@rokkit/chart`.

| Layer         | Here                                         | Owns                                                          | Tested by    |
| ------------- | -------------------------------------------- | ------------------------------------------------------------- | ------------ |
| **Load**      | the consumer                                 | where `nodes`/`edges` come from                               | the consumer |
| **State**     | `GraphState.svelte.ts`                       | normalize → layout → preset → selection. **Every** derivation | no DOM       |
| **Component** | `Graph.svelte`, `EntityView`, `EntitiesView` | render + route intent through state methods                   | DOM only     |

`@rokkit/graph` is a library, not a screen, so the **load** layer belongs to the consumer: the
package's contract is `nodes`/`edges`/`fields` and it never fetches.

`GraphState` follows the house idiom — private `$state` inputs, `$derived` outputs, explicit
getters, named methods for every transition.

Since 2026-09-30 it is a composition over parts that can each be tested alone. Its public
surface is unchanged, and each member delegates in one line:

| Part | Owns |
| --- | --- |
| `state/GraphConfig.svelte.ts` | every input. `CONFIG_FIELDS` gives each field's fallback and normaliser: the depth and level floors, nestBy ≠ groupBy, and `raw` for the four that keep a `null` as given. `update` / `apply` / `setDensity` / `setGrouping` |
| `state/GraphSelection.svelte.ts` | value, expanded cards, related, entity, relationships; `select` / `clear` / `adopt` / `toggleExpanded`, `nodeState` / `edgeState` |
| `model/relationships.ts`, `model/entities.ts`, `layout/extent.ts` | the pure derivations: a node's relationships over the canonical edges, the entity rows, and the content extent |
| `GraphState` itself | the layout pipeline (model → layout function → result → overlay routing), group styles, and the view queries the templates read |

The decomposition was checked against the previous class. Every getter and every per-node,
per-edge and per-cluster method was compared before and after a transition sequence, over
432 cases, and all were identical.

**`update(config)` follows `SparkState`, not `PlotState`.** The two differ, and the difference
matters: `SparkState.update` (`packages/chart/src/SparkState.svelte.js:174-185`) reassigns every
field unconditionally and documents itself as "re-callable… it must fully re-apply config rather
than merge deltas". `PlotState.update` guards 15 of its fields with
`if (config.X !== undefined)`, so an omitted key keeps its old value — that is merge-by-delta.
`GraphState` wants the `SparkState` contract, because `Graph.svelte` calls `update()` from an
`$effect` on every prop change and a prop reverting to undefined must actually revert.

It publishes on `setContext('graph-state', …)`, so a view composed inside a `<Graph>` needs no
prop, mirroring how a geom resolves `'plot-state'`. **The published instance must have stable
identity for the component's lifetime** — `setContext` runs once at init and captures the value,
so swapping which `GraphState` object is passed in after mount would leave nested views reading
the old one. `PlotState`/`SparkState` hold the same discipline: reactivity flows through mutating
one object, never through replacing which object is in context.

### The rule that makes this worth doing

**A component may not compute.** No `refCount` loop in `EntitiesView`, no `cardState()` helper in
`Graph`, no relationship partitioning in `EntityView`. If a template needs a value, `GraphState`
exposes it.

That is what buys the testability: the geometry, badge derivation, group-colour assignment and
selection logic are covered exhaustively with **no renderer**, and the component specs assert only
attributes. Two failure modes stay clearly separated — "the layout is wrong" fails a state test,
"the attribute is missing" fails a DOM test, and neither can masquerade as the other.

One deliberate exception: the fit maths in `Graph.svelte` (`clientWidth`/`scale`/`tx`/`ty`) stays
in the component. It depends on the rendered viewport, which state cannot know.

`value` is the one input that is also an output, so `update()` adopts it only when the caller
supplies one — otherwise a re-render would wipe a selection the user just made. Same hazard
`List`/`Tree`'s `bind:value` race contract documents.

---

## Layout interface

```ts
type LayoutFn = (model: GraphModel, options: LayoutOptions) => LayoutResult
```

Pure, DOM-free, synchronous, deterministic — which is what dbd's layout already is
(`layout.ts:3-5`: "Pure function: schema data + density + arrange -> geometry. No DOM
measuring; card heights are computed from row counts"). Nothing is measured.

```ts
type LayoutOptions = {
  density?: 'names' | 'keys' | 'full' // the compact option
  arrange?: 'untangle' | 'a-z'
  edgeStyle?: 'curved' | 'orthogonal'
  focus?: string | null // `neighborhood` only — the node the view centres on
}

type LayoutResult = {
  clusters: Cluster[] // empty for an ungrouped layout such as `neighborhood`
  cards: Record<string, Card>
  edges: RoutedEdge[]
  size: { w: number; h: number }
}
```

Slice 1 ships **two** layouts:

| Layout         | Source                                                                        | Notes                                                                                                                                                                   |
| -------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cluster`      | `layout-cards.ts`, `layout-clusters.ts`, `layout-edges.ts`, `layout-types.ts` | Both existing test suites (`layout-clusters.test.ts` 192 lines, `layout-edges.test.ts` 152 — nine exact SVG path assertions among them) run against the canonical types |
| `neighborhood` | `EntityDiagram.svelte`'s geometry                                             | Focus node centred, inbound neighbours left, outbound right                                                                                                             |

**Why `neighborhood` is in slice 1 and costs nothing.** `EntityDiagram.svelte` carries its own
`C` constants, `buildCard`, `anchorY` and `path` — roughly 100 lines duplicating `layout-cards.ts`
and `layout-edges.ts` with slightly different numbers. Expressed as a `LayoutFn` it reuses both
instead, so porting it this way **removes** the duplication rather than carrying it. It is
cheaper than porting `EntityDiagram` as a component, not dearer.

The side benefit is real: the layout interface is validated by two independent implementations
inside slice 1, rather than by one plus a promise about `d3-force`.

`force` remains slice 2: a third `LayoutFn` behind the same interface, adding `d3-force` to
`@rokkit/graph` alone. No change to the core.

---

## Overlay edges

An edge flagged `overlay` (`fields.overlay`) goes to `GraphModel.overlays`, never
`GraphModel.edges`. Layouts, neighbours, relationships and reference counts see only structural
edges; `GraphState` routes overlays with the same `buildEdges` against the finished
`result.cards` and appends them to `routedEdges`, each carrying `overlay: true`.

Why a separate list rather than a flag every layout ignores: every layout reads `model.edges`,
and a future one would have to remember to filter. Keeping overlays out of the model's edge
list makes "never shapes the layout" structural, not a convention. The motivating case is
co-change — files that change together with no import between them; ranked by `flow` they
would be drawn side by side and the coupling would vanish into the layout.

`GraphEdge.weight` (`fields.edgeWeight`) is optional on every edge. `GraphState.edgeWeight(edge)`
normalises it to 0..1 of the heaviest weighted edge and the canvas exposes it as
`--edge-weight`; base CSS thickens the stroke from it. Every style dots overlays in `ink-mute`.
Layouts with no cards (`world`, `sunburst`) have nothing to route an overlay between.

## The dependency matrix

`DependencyMatrix` is a named diagram that does not draw on the `Graph` canvas: a DSM needs no
layout, only an order. `buildMatrix(model, { groupBy })` (pure, `layout/matrix.ts`) orders nodes
providers-first by reversing `rank` — `flow` puts a target in a later column than its source; a
DSM wants the target first — so an acyclic layering is lower-triangular and a cell above the
diagonal is a dependency against the grain. `groupBy` keeps groups contiguous, ordered by where
their first member ranks, and reports each as a diagonal block. Parallel edges fold into one
cell; a weighted edge counts as its weight (an import list aggregated to components arrives as
one edge per pair). Overlays, self-loops and unplaced edges never enter.

Selection goes through `GraphState` — row headers are buttons — so a shared state keeps a
node-link view beside it in step. Themed like the canvas: structure in `base/graph.css`
(`--cell-weight` drives intensity), colour per style, above-diagonal cells `danger` in every one.

## Theming: semantic attributes + brewer preset

Two vocabularies, two mechanisms. This is the central theming decision.

### Closed vocabulary → pure CSS, zero JS

Node kinds, row badges and states are a known, finite set, so they are plain data-attributes
the theme colours directly.

```
data-graph-node      data-node-kind="table|view|matview|function|procedure|enum"
                     data-node-state="selected|related|dim"
data-graph-row       data-row-badge="pk|fk|uq"
data-graph-edge      data-edge-kind="reference|dependency"
                     data-edge-state="highlight|dim"
data-graph-cluster
```

```css
/* theme */
[data-node-kind='view'] {
  --node-accent: var(--info);
}
/* app override — one rule, no config, no rebuild */
[data-node-kind='table'] {
  --node-accent: var(--primary);
}
```

### Open vocabulary → brewer preset

Group names (schemas) are not knowable at build time, so they cannot be pre-written in CSS.
This is where the palette comes in, following `createChartPreset`'s shape so the two packages
are learned once:

```js
createGraphPreset({
  kinds: { table: 'blue', view: 'emerald', matview: 'teal', function: 'amber' },
  groups: ['blue', 'emerald', 'rose', 'amber', 'violet', 'sky', 'pink', 'teal'],
  shades: {
    light: { fill: '100', stroke: '400', label: '700' },
    dark: { fill: '900', stroke: '600', label: '200' }
  },
  using: 'color' // | 'pattern'
})
```

Resolved to **inline custom properties, never hardcoded fills**, so CSS keeps the final say and
an attribute override still wins:

```html
<div
  data-graph-cluster
  data-node-group="public"
  style="--group-fill:…; --group-stroke:…; --group-label:…"
></div>
```

`using: 'pattern'` reuses chart's `patterns.js` — print-safe and colour-blind-safe diagrams
fall out for free.

### What this replaces

dbd today hardcodes eight oklch hue angles (`layout-types.ts:71`,
`HUES = [245, 160, 70, 330, 200, 25, 120, 285]`) and hand-picks lightness and chroma in twelve
hue-carrying rules — six of which exist only as `[data-mode='dark']` duplicates of the other
six — none of which participate in the skin system:

| Rules              | Where                                                         | Fate                                                                      |
| ------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 6 (3 × light/dark) | `styles.css:221-232` — cluster fill, cluster label, card head | **Replaced** by `data-node-kind` + the preset                             |
| 6 (3 × light/dark) | `styles.css:266-275` — `.sn-tile`, `.sn-label`, `.sn-bar`     | **Stay in dbd** — `SchemaSnapshot.svelte` is app-shell and does not cross |

dbd may adopt the preset for the snapshot thumbnail later, since `createGraphPreset` is
exported; it is not part of this extraction.

---

## Shared categorical palette moves to `@rokkit/core`

`chart/src/lib/palette.json` moves to `@rokkit/core` as `colors/categorical.json`, re-exported as
`categoricalPalette`; chart imports it from there.

**Scope note — `preset.js` does NOT move.** Its `createChartPreset`/`defaultPreset` are re-exported
through chart's `.` entry (`chart/src/index.js:56`) and are documented public API, used in
`packages/cli/skills/charts-rokkit/SKILL.md` and the charts guide. Moving them would be a breaking
change to `@rokkit/chart`. `@rokkit/graph` gets its own `createGraphPreset` modelled on the same
shape instead — the shapes rhyme so a consumer learns one, but they are separate exports.
`brewing/patterns.js` is genuinely internal and can move if `using: 'pattern'` needs it.
Charts and diagrams then agree on categorical colour by construction — a schema tinted teal in
the ER diagram matches a teal series in a chart.

Each risk checked, not assumed:

| Risk                                  | Finding                                                                                                                                                                                |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public API breakage                   | `palette.json` is absent from chart's `exports` map — internal only. `preset.js` is **not**, which is why it stays behind (scope note above).                                          |
| New transitive deps in core           | `brewing/patterns.js` and `brewing/symbols.js` have **zero imports** — pure data. Core gains no d3.                                                                                    |
| Collides with core's existing palette | It does **not**. `core/src/colors/tailwind.json` is a _different_ palette: chart has `gold`/`lavender`/`wood`, core has `fuscia`/`green`/`slate`, and shared families differ in value. |
| Chart's colours shift                 | Ships as a distinct `categoricalPalette` export, **not merged** into `defaultColors`; values byte-identical, so no chart visual or contrast baseline moves.                            |

`chart/src/symbols/index.js` imports Svelte components and **stays in chart**.

---

## Reuse instead of port

- **`[data-graph-paper]` already exists** (`themes/src/base/graph-paper.css`) and is the
  graph-paper canvas backdrop to reuse. It draws crossing grid _lines_ where dbd's `.dg-dots` drew
  radial _dots_ — same role, different texture. The `.dg-dots` rule is **deleted**, not translated.
- **`EntitiesView` composes `@rokkit/ui`'s `Table`** rather than shipping a bespoke table. It is
  80 lines and is already a table usage.
- **The `.dbd-app` scoped preflight is dropped.** `styles.css:27-70` re-applies a Tailwind-style
  reset because dbd's global reset does not reach that subtree; `base/graph.css` carries
  structure instead.
- **`Icon.svelte` does not port.** Rokkit's standing decision (2026-02) is icons-as-CSS-classes
  with no Icon component. Node kinds and row badges take icon classes through the existing
  two-layer pattern — `defaultIcons` in core plus a per-instance `icons` prop — which is also
  how #159's "configurable icons" ask is answered.

### Naming note

`data-graph-paper` (a background utility) and `data-graph-node` (a node-link part) share a
prefix. There is no functional collision — distinct attribute names — but `base/graph.css`
carries a header comment disambiguating the two, since a reader scanning theme CSS will meet
both.

---

## Token translation

dbd's site already consumes Rokkit tokens via `rokkit.config.js` `overrides`
(`styles.css:5` says so), but under dbd-local names. The port translates them to the canonical
24 (`packages/core/src/named-tokens.ts`):

| dbd                      | Rokkit                                       |
| ------------------------ | -------------------------------------------- |
| `--bg`                   | `--paper`                                    |
| `--paper`                | `--paper-soft`                               |
| `--paper-2`              | `--paper-mute`                               |
| `--line`, `--line-soft`  | `--paper-edge`                               |
| `--fg`                   | `--ink`                                      |
| `--muted`                | `--ink-mute`                                 |
| `--faint`                | `--ink-mute` — **not** `ink-soft`; see below |
| `--accent`, `--accent-2` | `--primary` + relative-oklch hover           |
| `--on-accent`            | `--on-primary`                               |
| `--edge`, `--edge-dim`   | new `--graph-edge`, `--graph-edge-dim`       |
| `--shadow-card`          | `--shadow-tint`-derived                      |

### Two defects this fixes, not carries

1. **`--faint` must land on `ink-mute`.** `.dg-row .ctype` and `.dg-fkicon`
   (`styles.css:194,201`) use `--faint` → `ink-soft`, and `.dg-card` is a `<button>`. The
   standing rule is that `ink-soft` (ink.500, 1.95–2.13:1 on paper) cannot carry an interactive
   control's label or icon. This is a live contrast bug in dbd today;
   `interaction-contrast.e2e.ts` holds the fix.
2. **`.dg-card.sel` must use `primary`/`on-primary`.** It currently uses `--accent` plus
   `--accent-soft` (`styles.css:174`). Only `on-primary` is a real CSS variable —
   `text-on-accent` compiles to a build-time-baked hex and cannot react to a skin.

---

## Theme files

Per the headless-base rule, `base/*.css` is structure only and carries **no colour**.

- **Slice 1:** `base/graph.css` + `rokkit/graph.css`
- **Follow-up:** `minimal`, `material`, `frosted`, `zen-sumi` — once the attribute surface has
  stopped moving

---

## Verification

| Gate           | What it covers                                                                                                                                                              |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit           | Both ported layout suites run against canonical types, plus a new normalizer suite                                                                                          |
| `bun run lint` | 0 errors, 0 warnings                                                                                                                                                        |
| `svelte-check` | 0 errors                                                                                                                                                                    |
| Contrast       | The diagram enters `/embed/gallery`. **Swept against a non-default skin** — the default skin maps primary _and_ accent to `shu`, so a bad token swap is invisible under it. |
| Screens smoke  | `apps/learn/e2e/screens-smoke.e2e.ts` picks up the new screens — marker element, a real interaction, and silence on console / `pageerror` / 4xx-5xx                         |
| Learn examples | See below — the examples _are_ the verification surface                                                                                                                     |
| Acceptance     | dbd's `site/src/routes/diagram` and `/projects` consume the package and render unchanged                                                                                    |

### Learn-site examples are a deliverable, not a follow-up

The learn site is how this gets verified visually, so the examples ship **with** the
implementation, in the same slice. They also make the package's every surface reachable by a
human and by Playwright, which is the point: a layout bug or a bad token is obvious on a demo
page and invisible in a unit test.

Built to the established Koan demo contract — `apps/learn/src/lib/koan/demos/graph/` with
`index.svelte`, `meta.ts`, `docs.md`, plus the Explorer / Controls / Conversation / store files
the chart and sparkline demos use. Registered in `catalog.ts`, and in `shell.svelte.ts` +
`conversations.svelte.ts` (`DEMO_ROUTE`, `ShellDemoType`, `pickDemoKind`) — the registration
points #147 established. That yields both routes for free:

- **`/components/graph`** — static, prerendered, indexable reference page
- **`/app/graph`** — the interactive Koan explorer

`meta.ts` carries the full `api` block (`props`, `events`, `attrs`) and `snippets`. The `attrs`
list is not decoration here: it is the published contract for every data-attribute in the
theming section, and it is what a consumer reads to write an override rule.

**Every claim in this design must be exercised by a control on the explorer:**

| Surface          | What the example must let you do                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `density`        | Switch `names` / `keys` / `full` and watch cards resize                                                                      |
| `arrange`        | Switch `untangle` / `a-z` and see edge-crossing change                                                                       |
| `edgeStyle`      | Switch `curved` / `orthogonal`                                                                                               |
| `layout`         | Switch `cluster` / `neighborhood` — two real implementations, so the seam is exercised, not just declared                    |
| `data-node-kind` | Data covering every kind, so each kind's colour is visible at once                                                           |
| `using`          | Switch `color` / `pattern` — the colour-blind-safe path is verified, not assumed                                             |
| Group preset     | Multi-schema data, so the `groups` ramp assigns and wraps visibly                                                            |
| Override         | A documented snippet showing a one-rule `[data-node-kind=…]` override actually taking effect                                 |
| Views            | The `Graph` canvas, `EntityView` and `EntitiesView` each reachable                                                           |
| Field mapping    | At least one non-dbd-shaped dataset, mapped via `fields` — proving the contract is general and not a SchemaModel in disguise |

The last row matters most. The whole justification for mapped-input-canonical-internals is that
a second, differently shaped consumer can use this. An example with only dbd-shaped data would
leave that untested.

---

## Slice boundaries

**Slice 1 — ER on a pluggable layout.** Package scaffold, canonical model + normalizer, layout
interface, the `cluster` layout ported with its tests and the `neighborhood` layout,
`Graph` canvas, `EntityView`, `EntitiesView`, the palette move to core, `base` + `rokkit` theme files, **the
learn demo and its examples**, dbd consuming it.

**Slice 2 — force-directed / call graph.** A second `LayoutFn` plus `d3-force`, validated
against an interface one real consumer already exercises. Sensei's call graph is the driver.

**Slice 3 — dbd#24 v2 model.** ~~Non-table entity kinds and the dependency-edge list.~~
**Pulled into slice 1** (2026-09-28): dbd shipped v2 on 2026-09-27, so slice 1's acceptance
gate — dbd consuming the package — was going to hit it regardless, and task 21 would otherwise
have documented a model the one real consumer had already moved past. See *A schema is two
graphs* below.

Sequencing rationale, from #159: the current model is stable and tested, so extracting against
it avoids extracting a moving target.

---

## A schema is two graphs, not one

Locked 2026-09-28, from a reader's question: *"what position do views and functions have in an
ER diagram? An ER diagram is only for table entities."*

That is right, and **dbd's v2 `SchemaModel` had already encoded it** — in its own doc comments:

> `tables`: "Tables only — unchanged from v1, deliberately. Every other kind is in `entities`,
> so a consumer reading this as *the tables* stays correct."
>
> `refs`: "Foreign keys only — unchanged from v1. The dependency graph is `deps`; **an ER
> renderer wants these and a call-graph renderer wants those.**"
>
> `EntityNode`: "A non-table entity: a view, materialized view, function or procedure. **No
> columns.** A parsed routine has none, and a view's are not read — what it has is a body and
> the things it depends on."

An ER diagram is entities and their relationships. A view is a derived projection and a
routine is behaviour; neither is an entity. The visible symptom of ignoring that: slice 1's
demo put all six kinds in `tables`, invented columns for them, and gave them no edges — four
of fourteen nodes floated unconnected, and at `keys` density they collapsed to a bare `+3
more`. The picture asserted more structure than the data had.

**The package does not gain a kind filter.** The consumer choosing what to pass IS the
mechanism, and it is what dbd's split exists for. A built-in filter would force a generic
graph package to know that `table` is special.

What `./schema` gains — the one entry point allowed to know dbd's vocabulary — is a scope:

| call | nodes | edges |
| --- | --- | --- |
| `toGraphInput(model, 'er')` *(default)* | `tables` | `refs` |
| `toGraphInput(model, 'dependencies')` | `tables` + `entities` | `deps` |

Tables stay in the dependency scope because a view READS a table; dropping them would leave
every edge dangling — the same orphan defect from the other direction. `er` is the default so
a caller written against v1 reads a v2 model unchanged.

### Two canonical additions this required

- **`GraphEdge.relation`** — dbd's `DepEdge.kind` is `reads | writes | calls | member`, four
  verbs that are one `EdgeKind` for layout but read very differently. Widening `EdgeKind` to
  hold them would teach a generic package what a stored procedure is, so `kind` stays the
  two-value discriminator every layout branches on and `relation` carries the consumer's word
  out to `data-edge-relation`. It also joins the edge id: a procedure that both reads AND
  writes one table is two edges with identical endpoints and no row anchors.
- **`GraphFields.defaultEdgeKind`** — for a list that is wholly dependencies there is no
  per-row path to point at, and without it every call renders as a foreign key.

`DepEdge.unresolved` needs no mapping: an endpoint dbd could not resolve is absent from the
model, so `unplaced` derives the same fact. dbd's instruction is the same one already
implemented — *"the edge is real, the endpoint is not placeable"*, so dim rather than drop.

### Vocabulary corrections found here

- `materialized_view` and `trigger` are dbd's wire strings and were unknown to the icon map
  and to all five themes. `matview` stays as a declared alias.
- **Kind icons never worked.** `i-graph-*` was defined in no UnoCSS config, icon collection or
  stylesheet, so every kind rendered an identical blank 13x13 box. `src/icons.ts` now names
  `i-glyph:*` entries and `spec/icons.spec.ts` checks each against the shipped collection.
- **Seven kinds, six semantic roles.** `trigger` shares `procedure`'s accent — both are
  invoked behaviour — and the glyph carries the distinction. `--secondary` exists in the CLI
  skin scaffold but is never emitted, and inventing a seventh hue via `color-mix` would put an
  unskinnable colour through the 5-style x 2-mode x 5-skin contrast sweep. Note also that the
  **default skin collapses `primary`/`accent`/`danger` to one colour** and `info`/`warning` to
  another, so kind colour is a weaker signal than the glyph on that skin.

---

## Left behind in dbd

`Header.svelte` (branding — the directory's only site coupling), `store.ts` (a localStorage
persistence choice a host app should own), `fragment.ts` (URL-fragment codec, the only `fflate`
dependency), `data.ts` (sample data), `ProjectsView.svelte`, `SchemaSnapshot.svelte`,
`Tabs.svelte`, `ContentHeader.svelte`, `Sidebar.svelte` — all app-shell, and sensei will want
its own. Plus `SchemaModel`/`validateModel`, the Rust mirror.

`Sidebar` and `Tabs` are deliberately **not** promoted: they overlap `@rokkit/ui`'s `Tree` and
`Tabs`, and shipping near-duplicates to save a port is the wrong trade.

---

## Slice 2 — the world view (designed, not built)

> **Full design: [`24-world-view.md`](./24-world-view.md).** That doc takes the decisions this
> section only names — how containment arrives (`path`, not `parent`), what it looks like
> (nested rects, and why not force or circles), how drilling differs from zooming, and where
> the second measure lives. It also closes #163 and #164 on paper.

Studied against `~/Downloads/Sensei/Sensei Schema and Call Graph v3.dc.html`, which drives
**1.18M nodes / 4.08M edges**. Two views, and the repo's own numbers make the gap concrete.

### What already matches

The reference's **Neighbourhood** view — *"what calls this symbol, and what it calls — read
left to right. Centre on any neighbour to keep walking"* — is the `neighborhood` LayoutFn
shipped in slice 1, including the walk: clicking a neighbour re-centres because `focus`
defaults to the selection. That behaviour is now pinned by an e2e test.

Its header reads *"one symbol at a time"*, which is the whole scaling story for that view:
the 1-hop neighbourhood of one node is small no matter how large the graph is.

### What does not

The reference's **World** view is *"each bubble is sized by its declarations and holds what it
contains"* — and the technique that makes it survive 1.18M nodes is one `points` does not use:

1. **Only two levels are materialised at a time.** `shallow(focus, 0)` walks `d < 2`, so the
   render is one level plus its children — never the whole tree.
2. **Drill-down is the navigation.** A stack (`wStack`) of focused containers, with
   breadcrumbs back out. Zoom changes detail; drilling changes *scope*.
3. **Containment, not grouping.** A bubble *holds* its children — package → module → symbol —
   and a node's size is its subtree's summed declaration count.
4. **A single-child container is folded away**, because a wrapper is not a level.
5. **Shading is a second channel** over the same geometry: unresolved share, test share, docs
   share — "where the graph knows least".
6. **Status reads on the border**: indexing dashed, queued dotted, failed accent.

`points` (slice 1) is flat and single-level: it packs every node of every group into one
spiral. Measured, that is the difference between usable and not — 1000 nodes render at 0.603
fit; 1.18M would not render at all, because the cost is in materialising the nodes rather
than in the geometry.

### What slice 2 needs

- **A containment relation in the canonical model.** `GraphFields` has `group`, a single flat
  key. Hierarchy needs `parent` (or `path`), and `normalizeGraph` needs to build the tree.
  This is the real prerequisite and it is a model change, not a layout change.
- **A `world` LayoutFn** doing circle packing over two materialised levels. `d3-hierarchy`'s
  `pack` is the obvious tool and `@rokkit/chart` already carries d3 packages, so the
  dependency question is about whether `@rokkit/graph` should take `d3-hierarchy` as its
  first third-party runtime dependency — today it has none, and `dependencies.spec.js`
  enforces that. Deliberate decision, not an accident to drift into.
- ~~**Drill state on `GraphState`**~~ — built for #165 (2026-09-30): `GraphDrill`, with
  `ondrill` / `ondrillup` host events, a pending state and the `DrillBar`. See
  24-world-view.md, Decision 3.
- **A `value` field** for node weight, so a bubble is sized by declarations rather than by
  degree as `points` does today.

Slice 1 deliberately stops short of all of this. `points` answers "what does a dense flat
graph look like"; the world view answers "what does a 1M-node hierarchy look like", and they
are different questions with different models underneath.

## Group nodes (#166)

A node with `members` stands for them. `model/condense.ts` is the pure step between the model
and the layout:

- a collapsed group hides its members, reroutes their edges to itself, drops the edges inside
  it, and folds parallel edges (weights summed, `count` kept, no longer `weakest`);
- an expanded group gives way to its members and drops pre-aggregated edges to itself. One whose
  members have not arrived stays as itself.

`state/GraphGroups` holds which groups are collapsed: as each starts (`collapsed`, default true)
and as the reader toggles. `GraphState` condenses the canonical model through it before any
layout runs, so every layout draws groups with no change of its own.

The library computes no strongly-connected components. The host groups, and rokkit draws: the
learn demo runs Tarjan's algorithm itself, playing host.

Two fixes came with it:
- every edge builder now spreads the shared `carried()` half, which `flow` and `radial` used to
  skip, silently dropping edge weight there;
- a group card reserves its control row.

## The layers layout (#167)

`layout/layers.ts` places nodes by a host-assigned `layer`: rokkit computes no depth. It is
Sugiyama-shaped, minus the half the host owns.

- **Bands.** One full-width band per layer, drawn as a cluster box so it renders through the
  existing box path with its label.
- **Wrapping.** A crowded layer wraps into rows of 8.
- **Ordering.** One barycenter pass against the layer above.
- **Edges.** Vertical S-curves, carrying `conformance`. Host-supplied wins; otherwise it is
  derived from the two layers, a comparison and not a depth computation.
- **Filter.** `showEdges: 'violations'` keeps only `up`.
- **Options.** `edgeStyle` is not one: a layered edge is always the vertical S.

`LayersDiagram` composes it with `ViolationsControl`.

The learn demo assigns rokkit's packages their intended layers. Measured, no import climbs, so
the honest *Violations only* view is empty, and the blurb says so. #167's own sample is a second
example with the one climbing edge.

## The polymetric layout (#168)

`layout/polymetric.ts` is Lanza & Marinescu's System Complexity view: a top-down tidy tree
whose leaves are boxes sized `widthBy` × `heightBy` and shaded by `colorBy`.

- **Containment.** `normalize` derives `path` from `parent` ids when a node has none, so the
  shape #168's sample sends needs no adapter. Segments are ids; a dangling parent becomes a
  synthesised container, and a cycle is cut where it closes.
- **Placement.** Children side by side, each parent centred over them; every box at one depth
  is topped on one line, so heights compare at a glance. Containers are fixed label boxes;
  links are elbows (`kind: 'containment'`).
- **Scaling.** Each channel's `cap` is the 95th percentile of its present, positive values.
  Past the cap a value clamps to the maximum and the box lists the channel in `clamped`; a
  missing value draws at the minimum and is listed in `missing`. A zero is a value.
- **Result.** `LayoutResult.channels` reports each channel's measure and cap; `GraphState`
  exposes it as `channels`, and `measureKeys` lists what the pickers offer.
- **Styling.** `--shade` (0..1) on the leaf; base marks missing (dashed) and clamped (a heavy
  edge on that side) by shape, and each style maps the shade to ink-into-paper and hatches a
  missing shade.

`PolymetricTree` composes it with three `MeasureControl`s and the legend, on by default.

The learn demo sends `@rokkit/core` as parent-linked nodes with declarations × lines × churn.
The graph package (62 files in one row) read as a strip at fit, so the demo uses a package
that reads without zooming; a wide tree is still pannable and zoomable. The explorer carries a
picked measure back through `update()`, as it does the drill path, so a pick survives the next
selection.

## The arcs layout (#169)

`layout/arcs.ts` is a dual arc diagram: items on one vertical axis, and two relations arcing
out of either side of it.

- **Package.** It lives in graph, not chart, although #169 is filed `[chart]`. Chart's `Arc`
  is a pie slice and `Ribbon` a y-band; `Plot`'s rows-and-channels grammar has no
  items-plus-relations. Graph already had both edge sets (structural and overlay), weight to
  width, selection, the legend, theme CSS, and the co-change data.
- **Axis.** One box per item, ordered by group (first appearance) then input order. It is
  vertical so labels read horizontally at ~50 items, and fixed by the items alone, so filtering
  never moves a box.
- **Sides.** Structural edges go left (`side: 'below'`) and overlays right (`'above'`), unless
  `above` names a relation. Arcs are elliptical: the horizontal reach is half the vertical
  span, so the canvas stays narrower than it is tall. The layout routes overlays itself,
  because it has no cards for the generic overlay router.
- **Strength.** Per side, to the 95th percentile (`layout/percentile.ts`, shared with
  `polymetric`), clamped past it. `GraphState.edgeWeight` prefers it.
- **Filter.** `keepsEdge(showEdges, edge)` is shared with `layers`: `violations` keeps `up`,
  `hidden` keeps `hidden`.

`ArcDiagram` composes it with `HiddenControl` and the legend's side and hidden keys, on by
default.

The demos are rokkit's 47 components (110 imports, 62 co-change pairs, 15 hidden; a spec checks
each `hidden` against the imports) and #169's sample, verbatim.

Building the demo exposed a latent explorer bug: its `update()` re-applied the registry props,
so selecting a node reset *Hidden only*, and since #167 *Violations only* too. The explorer
now carries the reader's `showEdges` back with the measure picks.

## Words and interactions (2026-10-01)

An audit of the #165–#169 visuals found the package breaking two rules the rest of rokkit
keeps: its text was hardcoded English (rokkit's convention is the `messages` store), and
`Graph.svelte` decided in each element's branch what its click meant, with 21 inline
handlers.

- **Words.** `messages.graph` in `@rokkit/states` is one flat namespace, flat because the store
  merges only one level deep. Templates take `{token}` values, filled by `fill` / `say` /
  `counted` (`src/messages.ts`). Pure functions in `state/text.ts` word what the state
  produces: the default label, the more-rows control, legend rows, side names, the drill
  error. `layers` names its fallback bands from the same store.
- **Intents.** State emits `data-graph-press` / `data-graph-open` / `data-graph-key` in
  `boxAttrs`, `cardAttrs` and `moreAttrs`. `GraphState.act` looks the intent up in
  `state/intents.ts`. A leaf carries one key (its node id) for both its press and its open,
  and `boxFor` resolves either kind of key.
- **Actions.** `interactions` delegates click, double-click, Enter / Space on non-button
  controls, and Escape. `canvasNavigation` handles pan and zoom. `choices` reports a
  control's pick. All three are classic `{ update, destroy }` actions, so they are tested on
  bare DOM with no component.
- **Controls.** Four toggles share an internal `ToggleControl`, and zoom steps through a pure
  `nextZoom`.
- **Arc sides** come from the data, and the sensei-specific default is gone.
- **Guards.** `spec/locale.spec.ts` checks that a locale changes every surface.
  `spec/no-literals.spec.ts` fails on any literal word or DOM handler in a component. On its
  first run it caught two that the audit had missed (EntityView's column count and its
  relationship links).

Graph now depends on `@rokkit/states`. `@rokkit/ui`, already a graph peer, depends on it, so
a consumer installs nothing new. Plan: `docs/plans/2026-10-01-graph-messages-and-interactions.md`.

## The shade channel (#164)

Built as step 5 of `24-world-view.md`, which also records what building it changed. In brief:

- `shadeBy` on `world` / `sunburst` gives each box `Cluster.shade`, with a container taking the
  size-weighted mean of what it holds.
- `resolveShade` paints the share from the preset's ramp with a measured label.
- A shaded box carries `data-graph-shaded`, and each style paints it at full strength.
- The demo is *Treemap, shaded by tests*.

## Neighborhood parity and the canvas frame (#170, #171, #172), 2026-10-01

All three were found migrating dbd's viewer (dbd#25).

- **#170, corrected 2026-10-02.** The first fix made the focus the centre by default,
  reserving `max(in, out)` columns on both sides. dbd's owner then found the original report
  misdiagnosed (a cropped viewport) and wanted the 1.7.0 behaviour: centre the DRAWN cards.
  - The default `centre: 'content'` restores it: no column is reserved for an empty side.
  - `centre: 'focus'` is the opt-in. It keeps the symmetric reservation and reports
    `LayoutResult.extent`, which `contentExtent` returns as-is. A canvas that framed only the
    cards would centre them and undo the reservation, which is what 1.8.2 did for an
    inbound-only focus. #171's scroll extent reads the same value.
- **#172.**
  - `Neighborhood` gains `groupTint`, on by default.
  - In the neighborhood layout, a selection that IS the focus yields no `related` / `dim` /
    `highlight` states. The canvas is built from adjacency to the focus, so they meant nothing,
    and they dimmed ring 2.
  - The dark-mode card that matched the paper came from dbd's `rokkit.config.js` overriding
    dark `paper`. rokkit's zen-sumi steps the card above it, measured at 0.21 vs 0.17.
- **#171.**
  - `canvas/frame.ts` is pure. The extent is the scaled drawing plus `PAD` all round, or exactly
    the viewport while the drawing fits. `anchoredScroll` keeps a content point under an anchor.
  - `Graph.svelte` sizes a clipping `[data-graph-extent]` box from the frame. Its old
    transformed world left the scroll extent unscaled.
  - A pinch anchors at the pointer, and the buttons at the viewport centre. On an axis that
    still fits, centring wins.
  - The e2e covers flow, neighborhood, radial, layers and world.

