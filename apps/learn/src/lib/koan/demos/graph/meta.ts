import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'

const meta: DemoMeta = {
	id: 'graph',
	title: 'Graph',
	description:
		'Node-link diagram explorer — ER diagrams, schema entity tables and call graphs from the same component. Pluggable layouts (cluster, flow, neighborhood, points, world), density, arrange, edge style and a colour|pattern channel, all driven by field-mapped data rather than a fixed schema type.',
	keywords: [
		'graph', 'graphs', 'diagram', 'diagrams', 'er-diagram', 'erd',
		'schema', 'entity', 'entities', 'relationship', 'relationships',
		'nodes', 'edges', 'node-link', 'network', 'topology',
		'call-graph', 'dependency', 'dependencies', 'lineage', 'force-directed',
		'database', 'table', 'tables', 'foreign-key'
	],
	category: 'data',
	icon: '網',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_graph',
		description:
			'Mount the interactive graph explorer on the canvas — a node-link diagram with pluggable layouts. Pass `dataset` to open a specific one.',
		parameters: {
			dataset:
				'optional dataset: ecommerce | schema-deps | service-calls | codebase (defaults to ecommerce)'
		}
	},
	inline: { capable: true },
	/*
	 * Three examples, and the first two come from ONE dbd v2 payload. An ER diagram is table
	 * entities and their foreign keys; a view is a derived projection and a routine is
	 * behaviour, so neither is an entity and neither appears in the ER example. They appear in
	 * `Schema dependencies`, where the edges that give them meaning — reads, writes, calls,
	 * member — actually exist.
	 *
	 * The third is the general-contract proof: a service call graph shares none of the schema
	 * shape's key names and is adapted entirely by a `fields` map.
	 */
	variants: [
		{
			id: 'er-diagram',
			label: 'ER diagram',
			mode: 'dynamic',
			props: { dataset: 'ecommerce' }
		},
		{
			id: 'schema-deps',
			label: 'Schema dependencies',
			mode: 'dynamic',
			props: { dataset: 'schema-deps' }
		},
		{
			id: 'call-graph',
			label: 'Call graph',
			mode: 'dynamic',
			props: { dataset: 'service-calls' }
		},
		{
			id: 'codebase',
			label: 'This codebase',
			mode: 'dynamic',
			props: { dataset: 'codebase' }
		}
	],
	api: {
		props: [
			{ name: 'nodes', type: 'unknown[]', default: '[]', desc: 'Any row shape — mapped by `fields`, never required to match a schema type' },
			{ name: 'edges', type: 'unknown[]', default: '[]', desc: 'Any edge shape — endpoints resolved through `fields.source` / `fields.target`' },
			{ name: 'fields', type: 'GraphFields', default: '{}', desc: 'Dotted-path map from your shape to the canonical model. Omitted keys fall back to the same-named key' },
			{ name: 'state', type: 'GraphState', desc: 'Share one state across Graph / EntityView / EntitiesView. Must keep stable identity — drive it with its methods, do not swap instances' },
			{ name: 'layout', type: "'cluster' | 'flow' | 'neighborhood' | 'points' | 'world' | LayoutFn", default: "'cluster'", desc: 'A built-in by name, or your own pure (model, options) => LayoutResult. `flow` ranks by reference direction so every link leaves right and enters left' },
			{ name: 'density', type: "'names' | 'keys' | 'full'", default: "'keys'", desc: 'How much of each node’s row list a card shows' },
			{ name: 'arrange', type: "'untangle' | 'a-z'", default: "'untangle'", desc: 'Cluster ordering. untangle chains heavily-linked groups; a-z is area-descending' },
			{ name: 'groupBy', type: "'group' | 'kind'", default: "'group'", desc: 'Outer grouping axis. Schema suits an ER diagram; kind suits a dependency graph, where one schema holds a table, a trigger and a procedure' },
			{ name: 'sizeBy', type: "'degree' | 'weight'", default: "'degree'", desc: '`points` only — what a node’s size encodes. `weight` reads GraphNode.weight, for when the picture is about a quantity rather than connectivity' },
			{ name: 'sizeScale', type: "'linear' | 'log'", default: "'linear'", desc: 'How the measure maps onto area. `log` for a measure spanning orders of magnitude' },
			{ name: 'depth', type: 'number', default: '1', desc: '`neighborhood` only — hops out from the focus. 1 answers “what touches this”, 2 answers “what does changing this reach”' },
			{ name: 'nestBy', type: "'group' | 'kind'", desc: 'Subdivide each cluster by a second axis, so both facts are visible at once. Omit for one level; the same axis as groupBy is ignored' },
			{ name: 'edgeStyle', type: "'curved' | 'orthogonal'", default: "'curved'", desc: 'Connector geometry' },
			{ name: 'focus', type: 'string | null', default: 'null', desc: '`neighborhood` only — the node to centre. Defaults to the selection' },
			{ name: 'value', type: 'string | null', desc: 'Selected node id. Input and output both' },
			{ name: 'preset', type: 'GraphPreset', desc: 'createGraphPreset({ groups, shades, using }) — colour for the open-ended GROUP vocabulary. Node kinds are a closed set and are themed in CSS instead' },
			{ name: 'mode', type: "'light' | 'dark'", default: "'light'", desc: 'Which shade ladder the group ramp resolves against' },
			{ name: 'label', type: 'string', desc: 'Accessible name. Derived from the node/edge counts when omitted' },
			{ name: 'icons', type: 'Record<string, string>', desc: 'Icon class per node kind and row badge, merged over DEFAULT_ICONS. The built-ins name i-glyph:* entries — override to adopt a different collection' },
			{ name: 'onselect', type: '(id: string | null) => void', desc: 'Fires when a node is activated, and with null when the selection is cleared — a controlled consumer has no other way to learn it was dropped' }
		],
		attrs: [
			// Canvas
			{ selector: '[data-graph-viewport]', desc: 'Positioned wrapper; anchors the zoom controls over the canvas' },
			{ selector: '[data-graph-paper]', desc: 'Scrolling canvas — reuses the shared dotted-canvas primitive' },
			{ selector: '[data-graph-panning]', desc: 'Present on the canvas while a drag-pan is in progress' },
			{ selector: '[data-graph-zoom-controls]', desc: 'On-canvas zoom cluster; buttons carry data-graph-zoom="in|out|reset"' },
			{ selector: '[data-graph-world]', desc: 'Scaled/translated world; declares --graph-head-h, --graph-row-h, --graph-more-h' },
			{ selector: '[data-graph-layout]', desc: 'Active layout name — `points` reshapes a node from a card into a dot' },
			{ selector: '[data-graph-detail]', desc: 'full | compact | minimal | dot — level of detail from the effective scale' },
			{ selector: '[data-graph-density-controls]', desc: 'On-canvas detail toggle; buttons carry data-graph-density="names|keys|full"' },
			// Clusters
			{ selector: '[data-graph-cluster]', desc: 'One group box. Reads --group-fill / --group-stroke' },
			{ selector: '[data-graph-column]', desc: 'A column heading in a multi-column layout. Position, width and wording all come from the layout' },
			{ selector: '[data-column-side]', desc: 'in | out | focus — which side of the focus a column sits on. `focus` names the node itself, so it is styled as a proper noun' },
			{ selector: '[data-column-depth]', desc: 'Hops from the focus. 0 is the focus column' },
			{ selector: '[data-cluster-depth]', desc: '0 for an outer box, 1 for one nested inside it. Outer boxes are emitted first, so paint order nests them with no DOM tree' },
			{ selector: '[data-graph-cluster-label]', desc: 'Group name + count, or name + measure where the layout sizes by one. Truncates with an ellipsis rather than hiding, so how much is readable follows the zoom' },
			{ selector: '[data-graph-group-tint]', desc: 'Set on the canvas when `groupTint` is on — cards carry a spine in their group colour, which is how schema stays visible in a layout with no cluster boxes' },
			{ selector: '[data-graph-node-id]', desc: 'The node a box IS, on a containment layout where a leaf is still a box rather than a card. Makes it selectable; absent on a region, which is not a node' },
			// Node card
			{ selector: '[data-graph-node]', desc: 'Node card — a <button>' },
			{ selector: '[data-node-kind]', desc: 'table | view | matview | materialized_view | function | procedure | trigger | enum — sets --node-accent. matview and materialized_view are the same object under rokkit’s short name and dbd’s wire name' },
			{ selector: '[data-node-group]', desc: 'The node’s group name, for per-group overrides' },
			{ selector: '[data-node-state]', desc: 'selected | related | dim' },
			{ selector: '[data-node-headonly]', desc: 'Card with neither rows nor a more-row' },
			{ selector: '[data-graph-node-head]', desc: 'Card header strip' },
			{ selector: '[data-graph-node-icon]', desc: 'Kind icon' },
			{ selector: '[data-graph-node-title]', desc: 'Node label' },
			{ selector: '[data-graph-node-kind]', desc: 'Kind spelled out beside the icon (underscores rendered as spaces). Hidden below `full` detail and in the points layout' },
			{ selector: '[data-graph-node-count]', desc: 'Total row count' },
			// Rows
			{ selector: '[data-graph-row]', desc: 'One visible row' },
			{ selector: '[data-graph-row-name]', desc: 'Row name' },
			{ selector: '[data-graph-row-type]', desc: 'Row type — ink-mute, never ink-soft' },
			{ selector: '[data-row-badge]', desc: 'pk | fk | uq | nn' },
			{ selector: '[data-row-badge-empty]', desc: 'Spacer keeping badge-less rows aligned' },
			{ selector: '[data-graph-more]', desc: 'Hidden-row count / expand toggle' },
			{
				selector: '[data-graph-more-empty]',
				desc: 'Set when the density filter matched NO rows — a view, procedure or enum at key density has no keys, and the count alone reads as a rendering failure'
			},
			// Edges
			{ selector: '[data-graph-edge]', desc: 'Routed edge group' },
			{ selector: '[data-edge-kind]', desc: 'reference | dependency — dependency renders dashed' },
			{ selector: '[data-edge-relation]', desc: 'The producer’s own verb for the edge, when it has one — dbd v2 emits reads | writes | calls | member. Absent on a plain foreign key' },
			{ selector: '[data-edge-from]', desc: 'Source node id — an edge’s endpoints are not otherwise recoverable from the DOM' },
			{ selector: '[data-edge-to]', desc: 'Target node id' },
			{ selector: '[data-edge-state]', desc: 'highlight | dim' },
			{ selector: '[data-graph-edge-dot]', desc: 'Source anchor dot (and the target anchor when arrows are off)' },
			{ selector: '[data-graph-edge-arrow]', desc: 'Directional arrowhead at the edge target' },
			// Schema views
			{ selector: '[data-graph-entity]', desc: 'EntityView root' },
			{ selector: '[data-graph-entity-head]', desc: 'Entity header' },
			{ selector: '[data-graph-entity-group]', desc: 'Group prefix' },
			{ selector: '[data-graph-entity-kind]', desc: 'Kind hook on the EntitiesView cell' },
			{ selector: '[data-graph-section-title]', desc: 'Section heading' },
			{ selector: '[data-graph-column]', desc: 'One column row in EntityView' },
			{ selector: '[data-graph-column-name]', desc: 'Column name' },
			{ selector: '[data-graph-column-note]', desc: 'Column comment' },
			{ selector: '[data-graph-column-badges]', desc: 'Badge group in an EntityView column row — badges render as text chips here, as masked icons in a node card' },
			{ selector: '[data-graph-column-type]', desc: 'Base type' },
			{ selector: '[data-graph-column-size]', desc: 'Type size argument' },
			{ selector: '[data-graph-index]', desc: 'One index row' },
			{ selector: '[data-graph-index-unique]', desc: 'Unique marker' },
			{ selector: '[data-graph-index-name]', desc: 'Index name' },
			{ selector: '[data-graph-relationship]', desc: 'in | out — one relationship button' },
			{ selector: '[data-graph-relationship-group]', desc: 'Other end’s group' },
			{ selector: '[data-graph-relationship-label]', desc: 'Other end’s label' },
			{ selector: '[data-graph-relationship-action]', desc: 'Referential action' },
			{ selector: '[data-graph-relationships-empty]', desc: 'Shown when nothing references the entity' },
			// Notes
			{ selector: '[data-graph-note]', desc: 'Rendered note blocks' },
			{ selector: '[data-graph-note-list]', desc: 'Bullet list inside a note' },
			{ selector: '[data-graph-note-code]', desc: 'Inline `code` span inside a note' }
		]
	},
	snippets: [
		{
			id: 'minimal',
			title: 'Minimal',
			lang: 'svelte',
			code: `<script>
  import { Graph } from '@rokkit/graph'

  const nodes = [
    { id: 'users', label: 'users', rows: [{ name: 'id' }] },
    { id: 'orders', label: 'orders', rows: [{ name: 'user_id' }] }
  ]
  const edges = [{ source: 'orders', target: 'users' }]
<\/script>

<Graph {nodes} {edges} />`
		},
		{
			id: 'fields',
			title: 'Any shape, via fields',
			lang: 'svelte',
			code: `<script>
  import { Graph } from '@rokkit/graph'

  // Nothing here matches the canonical model. The map is the whole adapter.
  const services = [{ key: 'checkout', team: 'commerce', endpoints: [{ label: 'POST /cart' }] }]
  const calls = [{ caller: 'checkout', callee: 'catalog' }]

  const fields = {
    id: 'key', label: 'key', group: 'team',
    rows: 'endpoints', rowName: 'label',
    source: 'caller', target: 'callee'
  }
<\/script>

<Graph nodes={services} edges={calls} {fields} />`
		},
		{
			id: 'schema',
			title: 'dbd schema JSON',
			lang: 'svelte',
			code: `<script>
  import { Graph } from '@rokkit/graph'
  import { SCHEMA_FIELDS, fromSchemaModel } from '@rokkit/graph/schema'

  // Either hand SCHEMA_FIELDS straight to Graph...
  // ...or normalise once and share the model.
  const model = fromSchemaModel(schemaJson)
<\/script>

<Graph nodes={schemaJson.tables} edges={schemaJson.refs} fields={SCHEMA_FIELDS} />`
		},
		{
			id: 'preset',
			title: 'Preset override',
			lang: 'svelte',
			code: `<script>
  import { Graph, createGraphPreset } from '@rokkit/graph'

  const preset = createGraphPreset({
    groups: ['teal', 'gold', 'violet'],   // the ramp, in assignment order
    shades: { dark: { fill: '800' } },     // partial, merges
    using: 'pattern'                       // colour-blind- and print-safe
  })
<\/script>

<Graph {nodes} {edges} {preset} />`
		},
		{
			id: 'css-override',
			title: 'One-rule CSS override',
			lang: 'css',
			code: `/* Every visual hook is a data-attribute, so one rule retones a kind — no prop,
   no preset, no component change.

   Match the theme's specificity. Each style scopes its rules under [data-style], so a
   bare [data-node-kind='table'] is (0,1,1) against the theme's (0,2,0) and loses. */
[data-style] [data-node-kind='table'] {
  --node-accent: var(--primary);
}

/* Or target one style, which is what you want when the tone is style-specific: */
[data-style='zen-sumi'] [data-node-kind='view'] {
  --node-accent: var(--accent);
}`
		}
	],
	docs
}

export default meta
