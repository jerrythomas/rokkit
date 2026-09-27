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

- **Workspace dependencies:** `@rokkit/core`, `@rokkit/ui`
- **Peer:** `svelte` (`^5.0.0`) — never a hard dependency; see
  `packages/core/spec/workspace-peers.spec.js`
- **No third-party runtime dependencies.** `fflate` stays in dbd with `fragment.ts`.

**What crosses:** ~1,170 lines of source plus ~400 lines of existing tests. `Icon.svelte` (78)
is not among them — see _Reuse instead of port_.

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

| Layout         | Source                                                                        | Notes                                                                                                                       |
| -------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `cluster`      | `layout-cards.ts`, `layout-clusters.ts`, `layout-edges.ts`, `layout-types.ts` | Both existing test suites (`layout-clusters.test.ts` 192 lines, `layout-edges.test.ts` 152) run against the canonical types |
| `neighborhood` | `EntityDiagram.svelte`'s geometry                                             | Focus node centred, inbound neighbours left, outbound right                                                                 |

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

`chart/src/lib/palette.json`, the categorical half of `chart/src/lib/preset.js`, and
`chart/src/lib/brewing/patterns.js` move to `@rokkit/core`; chart imports them from there.
Charts and diagrams then agree on categorical colour by construction — a schema tinted teal in
the ER diagram matches a teal series in a chart.

Each risk checked, not assumed:

| Risk                                  | Finding                                                                                                                                                                                |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public API breakage                   | None of the three appear in chart's `exports` map — internal only                                                                                                                      |
| New transitive deps in core           | `brewing/patterns.js` and `brewing/symbols.js` have **zero imports** — pure data. Core gains no d3.                                                                                    |
| Collides with core's existing palette | It does **not**. `core/src/colors/tailwind.json` is a _different_ palette: chart has `gold`/`lavender`/`wood`, core has `fuscia`/`green`/`slate`, and shared families differ in value. |
| Chart's colours shift                 | Ships as a distinct `categoricalPalette` export, **not merged** into `defaultColors`; values byte-identical, so no chart visual or contrast baseline moves.                            |

`chart/src/symbols/index.js` imports Svelte components and **stays in chart**.

---

## Reuse instead of port

- **`[data-graph-paper]` already exists** (`themes/src/base/graph-paper.css`) and is exactly the
  dotted diagram canvas. dbd's `.dg-dots` radial-gradient rule is **deleted**, not translated.
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

**Slice 3 — dbd#24 v2 model.** Non-table entity kinds and the dependency-edge list. Lands as
normalizer plus theme work: `data-node-kind` and `data-edge-kind` already exist for it.

Sequencing rationale, from #159: the current model is stable and tested, so extracting against
it avoids extracting a moving target.

---

## Left behind in dbd

`Header.svelte` (branding — the directory's only site coupling), `store.ts` (a localStorage
persistence choice a host app should own), `fragment.ts` (URL-fragment codec, the only `fflate`
dependency), `data.ts` (sample data), `ProjectsView.svelte`, `SchemaSnapshot.svelte`,
`Tabs.svelte`, `ContentHeader.svelte`, `Sidebar.svelte` — all app-shell, and sensei will want
its own. Plus `SchemaModel`/`validateModel`, the Rust mirror.

`Sidebar` and `Tabs` are deliberately **not** promoted: they overlap `@rokkit/ui`'s `Tree` and
`Tabs`, and shipping near-duplicates to save a port is the wrong trade.
